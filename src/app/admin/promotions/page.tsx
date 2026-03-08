import { getPromoCodes } from '@/lib/supabase/promo-codes';
import { PromotionsClient } from './promotions-client';

export default async function PromotionsPage() {
  const promoCodes = await getPromoCodes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
        <p className="text-muted-foreground">
          Manage discount codes and promotions for your customers.
        </p>
      </div>
      <PromotionsClient initialData={promoCodes} />
    </div>
  );
}
