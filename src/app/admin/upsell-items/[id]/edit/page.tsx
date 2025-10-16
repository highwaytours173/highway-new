import { getUpsellItemById, updateUpsellItem } from "@/lib/supabase/upsell-items";
import { notFound } from "next/navigation";
import { UpsellItemEditClient } from "./upsell-item-edit-client";

export const dynamic = "force-dynamic";

interface EditUpsellItemPageProps {
  params: {
    id: string;
  };
}

export default async function EditUpsellItemPage({
  params,
}: EditUpsellItemPageProps) {
  const upsellItem = await getUpsellItemById(params.id);

  if (!upsellItem) {
    notFound();
  }

  return (
    <UpsellItemEditClient
      initialData={upsellItem}
      id={params.id}
      onSubmit={updateUpsellItem.bind(null, params.id)}
    />
  );
}
