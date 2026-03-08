import { getUpsellItems } from '@/lib/supabase/upsell-items';
import { UpsellPageClient } from './upsell-page-client';
import { getAgencySettings } from '@/lib/supabase/agency-content';

export const dynamic = 'force-dynamic';

export default async function UpsellItemsPage() {
  let items = [] as Awaited<ReturnType<typeof getUpsellItems>>;
  let heroImageUrl =
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2400&q=70';
  try {
    items = await getUpsellItems();
  } catch {
    items = [];
  }

  try {
    const settings = await getAgencySettings();
    heroImageUrl = settings?.data?.images?.upsellHeroUrl || heroImageUrl;
  } catch {}

  return <UpsellPageClient items={items} heroImageUrl={heroImageUrl} />;
}
