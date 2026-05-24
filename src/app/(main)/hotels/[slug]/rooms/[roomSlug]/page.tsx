import { notFound, redirect } from 'next/navigation';
import { getPublicHotelBySlug, getRoomTypeBySlug } from '@/lib/supabase/hotels';
import { getAgencySettings } from '@/lib/supabase/agency-content';
import { getRoomAddons } from '@/lib/supabase/room-pricing';
import { RoomDetailView } from '@/components/room-detail-view';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface RoomPageProps {
  params: Promise<{ slug: string; roomSlug: string }>;
}

export default async function HotelRoomDetailPage({ params }: RoomPageProps) {
  const { slug: hotelSlug, roomSlug } = await params;
  const settings = await getAgencySettings();
  const singleHotelMode = settings?.data?.singleHotelMode === true;

  if (singleHotelMode) {
    redirect(`/rooms/${roomSlug}`);
  }

  const hotel = await getPublicHotelBySlug(hotelSlug);
  if (!hotel) {
    notFound();
  }

  const room = await getRoomTypeBySlug({ hotelId: hotel.id, roomSlug });
  if (!room || !room.isActive) {
    notFound();
  }

  const addons = await getRoomAddons(room.id);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-2">
        <Breadcrumbs
          items={[
            { label: 'Hotels', href: '/hotels' },
            { label: hotel.name, href: `/hotels/${hotel.slug}` },
            { label: room.name },
          ]}
        />
      </div>
      <RoomDetailView room={room} hotel={hotel} addons={addons} singleHotelMode={false} />
    </>
  );
}
