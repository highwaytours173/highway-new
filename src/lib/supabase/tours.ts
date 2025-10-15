"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tour } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export async function getTours(): Promise<Tour[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tours").select("*");
  if (error) {
    console.error("Error fetching tours:", error);
    return [];
  }
  return data.map(toCamelCase) as Tour[];
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Error fetching tour by slug ${slug}:`, error);
    return null;
  }
  if (!data) {
    console.log(`No tour found for slug: ${slug}`);
    return null;
  }

  console.log(`Tour data for slug ${slug}:`, data);
  return toCamelCase(data) as Tour;
}

export async function addTour(formData: Omit<Tour, "id">) {
  const supabase = await createClient();

  // 1. Handle image uploads
  const imageUrls: string[] = [];
  if (formData.images && formData.images.length > 0) {
    for (const image of formData.images) {
      const file = image as unknown as File; // We receive File objects from the form
      if (!file.name || !file.size) continue; // Skip empty/invalid file inputs
      const filePath = `public/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("tours")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw new Error("Failed to upload image.");
      }

      const { data: urlData } = supabase.storage
        .from("tours")
        .getPublicUrl(filePath);

      imageUrls.push(urlData.publicUrl);
    }
  }

  // 2. Prepare data for database (snake_case)
  const {
    priceTiers,
    durationText,
    tourType,
    availabilityDescription,
    pickupAndDropoff,
    cancellationPolicy,
    ...rest
  } = formData;
  const dbData = {
    ...rest,
    images: imageUrls.length > 0 ? imageUrls : rest.images, // Use new URLs or keep old ones if no new files were uploaded
    price_tiers: priceTiers,
    duration_text: durationText,
    tour_type: tourType,
    availability_description: availabilityDescription,
    pickup_and_dropoff: pickupAndDropoff,
    cancellation_policy: cancellationPolicy,
  };

  // 3. Insert into database
  const { error: insertError } = await supabase.from("tours").insert(dbData);

  if (insertError) {
    console.error("Error inserting tour:", insertError);
    throw new Error("Failed to create tour.");
  }

  // 4. Revalidate and redirect
  revalidatePath("/admin/tours");
  revalidatePath("/"); // Revalidate homepage
  revalidatePath("/tours"); // Revalidate tours page
  redirect("/admin/tours");
}

export async function updateTour(id: string, formData: Omit<Tour, "id">) {
  const supabase = await createClient();

  // 1. Handle image uploads (similar logic as addTour, but consider existing images)
  const imageUrls: string[] = [];
  if (formData.images && formData.images.length > 0) {
    for (const image of formData.images) {
      // If it's a new File object, upload it
      if (typeof image === "object" && "name" in image && "size" in image) {

        const file = image as unknown as File;
        if (!file.name || !file.size) continue;
        const filePath = `public/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("tours")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error("Failed to upload image.");
        }

        const { data: urlData } = supabase.storage
          .from("tours")
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      } else if (typeof image === "string") {
        // If it's an existing URL, keep it
        imageUrls.push(image);
      }
    }
  }

  // 2. Prepare data for database (snake_case)
  const {
    priceTiers,
    durationText,
    tourType,
    availabilityDescription,
    pickupAndDropoff,
    cancellationPolicy,
    ...rest
  } = formData;
  const dbData = {
    ...rest,
    images: imageUrls.length > 0 ? imageUrls : rest.images, // Use new URLs or keep old ones if no new files were uploaded
    price_tiers: priceTiers,
    duration_text: durationText,
    tour_type: tourType,
    availability_description: availabilityDescription,
    pickup_and_dropoff: pickupAndDropoff,
    cancellation_policy: cancellationPolicy,
  };

  // 3. Update in database
  const { error: updateError } = await supabase
    .from("tours")
    .update(dbData)
    .eq("id", id);

  if (updateError) {
    console.error("Error updating tour:", updateError);
    throw new Error("Failed to update tour.");
  }

  // 4. Revalidate and redirect
  revalidatePath("/admin/tours");
  revalidatePath("/"); // Revalidate homepage
  revalidatePath("/tours"); // Revalidate tours page
  redirect("/admin/tours");
}
