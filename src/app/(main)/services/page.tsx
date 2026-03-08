import { getUpsellItems } from '@/lib/supabase/upsell-items';
import { ServicesPageClient } from './services-page-client';
import type { Metadata } from 'next';
import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('services', {
    title: 'Services',
    description: 'Add travel services like transport, pickup, and extras.',
  });
}

export default async function ServicesPage() {
  let services = [] as Awaited<ReturnType<typeof getUpsellItems>>;
  let heroImageUrl =
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=70';
  try {
    const items = await getUpsellItems();
    services = items.filter((i) => i.type === 'service');
  } catch {
    services = [];
  }

  try {
    const settings = await getAgencySettings();
    heroImageUrl = settings?.data?.images?.servicesHeroUrl || heroImageUrl;
  } catch {}

  return <ServicesPageClient services={services} heroImageUrl={heroImageUrl} />;
}
