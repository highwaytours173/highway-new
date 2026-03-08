import { PromoCodeForm } from '../promo-code-form';

export default function NewPromoCodePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Promo Code</h2>
        <p className="text-muted-foreground">Add a new discount code for your customers.</p>
      </div>
      <PromoCodeForm formType="new" />
    </div>
  );
}
