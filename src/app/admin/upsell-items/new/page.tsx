import { UpsellItemForm, formSchema } from "@/components/admin/upsell-item-form";
import { addUpsellItem } from "@/lib/supabase/upsell-items";
import { z } from "zod";

export const dynamic = "force-dynamic";

export default function NewUpsellItemPage() {
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    "use server";
    // Ensure relatedTourId is undefined if null or empty string to match strict types
    const payload = {
      ...values,
      relatedTourId: values.relatedTourId || undefined,
    };
    await addUpsellItem(payload);
  };

  return <UpsellItemForm onSubmit={onSubmit} formType="new" />;
}

