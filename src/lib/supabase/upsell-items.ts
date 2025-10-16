"use server";

import { createClient } from "@/lib/supabase/server";
import type { UpsellItem } from "@/types";
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

export async function getUpsellItems(): Promise<UpsellItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("upsell_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching upsell items:", error);
    return [];
  }
  return data.map(toCamelCase) as UpsellItem[];
}

export async function getUpsellItemById(
  id: string,
): Promise<UpsellItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("upsell_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching upsell item by ID ${id}:`, error);
    return null;
  }
  if (!data) return null;

  return toCamelCase(data) as UpsellItem;
}

async function handleImageUpload(
  images: any[] | undefined,
  existingImageUrl?: string,
): Promise<string | undefined> {
  const supabase = await createClient();
  let imageUrl: string | undefined = existingImageUrl;

  if (images && images.length > 0) {
    const file = images[0] as File;
    if (file.name && file.size) {
      // Check if it's a new file object
      const filePath = `public/upsell-items/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("tours") // Using the existing 'tours' bucket as requested
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading upsell item image:", uploadError);
        throw new Error("Failed to upload upsell item image.");
      }

      const { data: urlData } = supabase.storage
        .from("tours")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }
  }
  return imageUrl;
}

export async function addUpsellItem(
  formData: Omit<UpsellItem, "id" | "createdAt" | "imageUrl"> & {
    images?: any[];
  },
) {
  const supabase = await createClient();

  const imageUrl = await handleImageUpload(formData.images);

  const { error } = await supabase.from("upsell_items").insert({
    name: formData.name,
    description: formData.description,
    price: formData.price,
    type: formData.type,
    related_tour_id: formData.relatedTourId,
    image_url: imageUrl, // Store the uploaded image URL
    is_active: formData.isActive,
  });

  if (error) {
    console.error("Error adding upsell item:", error);
    throw new Error("Failed to add upsell item.");
  }

  revalidatePath("/admin/upsell-items");
  redirect("/admin/upsell-items");
}

export async function updateUpsellItem(
  id: string,
  formData: Omit<UpsellItem, "id" | "createdAt" | "imageUrl"> & {
    images?: any[];
    imageUrl?: string;
  },
) {
  const supabase = await createClient();

  const imageUrl = await handleImageUpload(formData.images, formData.imageUrl); // Pass existing URL

  const { error } = await supabase
    .from("upsell_items")
    .update({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      type: formData.type,
      related_tour_id: formData.relatedTourId,
      image_url: imageUrl, // Update with new or existing URL
      is_active: formData.isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating upsell item:", error);
    throw new Error("Failed to update upsell item.");
  }

  revalidatePath("/admin/upsell-items");
  redirect("/admin/upsell-items");
}

export async function deleteUpsellItem(id: string) {
  const supabase = await createClient();

  // Optional: Delete image from storage if it exists
  const { data: itemToDelete } = await supabase
    .from("upsell_items")
    .select("image_url")
    .eq("id", id)
    .single();
  if (itemToDelete?.image_url) {
    const filePath = itemToDelete.image_url.split("public/")[1]; // Extract path after 'public/'
    if (filePath) {
      const { error: deleteError } = await supabase.storage
        .from("tours")
        .remove([filePath]);
      if (deleteError) {
        console.warn(
          "Failed to delete old upsell item image from storage:",
          deleteError,
        );
      }
    }
  }

  const { error } = await supabase.from("upsell_items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting upsell item:", error);
    throw new Error("Failed to delete upsell item.");
  }

  revalidatePath("/admin/upsell-items");
}
