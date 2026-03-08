import { getPublicHotels } from '@/lib/supabase/hotels';
import { HotelsPageClient } from './hotels-page-client';

export default async function HotelsPage() {
  const hotels = await getPublicHotels();
  return <HotelsPageClient hotels={hotels} />;
}
