"use client";

import { UpsellItemForm } from "@/components/admin/upsell-item-form";
import type { UpsellItem } from "@/types";

interface UpsellItemEditClientProps {
  initialData: UpsellItem;
  onSubmit: (
    data: Omit<UpsellItem, "id" | "createdAt" | "imageUrl"> & {
      images?: (string | File)[];
      imageUrl?: string;
    },
  ) => Promise<void>;
}

export default function UpsellItemEditClient({
  initialData,
  onSubmit,
}: UpsellItemEditClientProps) {
  return (
    <UpsellItemForm
      initialData={initialData}
      onSubmit={onSubmit}
      formType="edit"
    />
  );
}