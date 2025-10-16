import { UpsellItemForm } from "@/components/admin/upsell-item-form";
import { addUpsellItem } from "@/lib/supabase/upsell-items";

export const dynamic = "force-dynamic";

export default function NewUpsellItemPage() {
  async function onSubmit(values: any) {
    "use server";
    await addUpsellItem(values);
  }
  return <UpsellItemForm onSubmit={onSubmit} formType="new" />;
}
