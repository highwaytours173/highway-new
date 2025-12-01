import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/supabase/tours";
import { TourEditClient } from "./tour-edit-client";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  return <TourEditClient tour={tour} />;
}

