"use client";

import { UpsellItemForm } from "@/components/admin/upsell-item-form";
import type { UpsellItem } from "@/types";

interface UpsellItemEditClientProps {
  initialData: UpsellItem;
  id: string;
  onSubmit: (data: any) => Promise<void>;
}

export function UpsellItemEditClient({
  initialData,
  id,
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
