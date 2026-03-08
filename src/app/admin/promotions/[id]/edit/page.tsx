import { getPromoCodeById } from '@/lib/supabase/promo-codes';
import { PromoCodeForm } from '../../promo-code-form';
import { notFound } from 'next/navigation';

export default async function EditPromoCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promoCode = await getPromoCodeById(id);

  if (!promoCode) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Promo Code</h2>
        <p className="text-muted-foreground">Modify existing discount code.</p>
      </div>
      <PromoCodeForm formType="edit" initialData={promoCode} />
    </div>
  );
}
