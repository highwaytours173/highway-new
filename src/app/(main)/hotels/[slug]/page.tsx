import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicHotelBySlug, getPublicRoomTypesByHotelId } from '@/lib/supabase/hotels';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { getApprovedReviewsForHotel } from '@/lib/supabase/reviews';
import { ReviewForm } from '@/components/review-form';
import { ReviewsDisplay } from '@/components/reviews-display';

interface HotelDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function HotelDetailsPage({ params }: HotelDetailsPageProps) {
  const { slug } = await params;
  const hotel = await getPublicHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  const [roomTypes, agency, reviews] = await Promise.all([
    getPublicRoomTypesByHotelId(hotel.id),
    getCurrentAgency(),
    getApprovedReviewsForHotel(hotel.id),
  ]);

  const reviewsEnabled = agency?.settings?.modules?.reviews !== false;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <Link href="/hotels" className="text-sm text-muted-foreground hover:underline">
          ← Back to hotels
        </Link>
        <h1 className="mt-3 text-3xl font-semibold">{hotel.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {hotel.city || hotel.country || hotel.address || ''}
        </p>
        {hotel.description ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {hotel.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Rooms</h2>
        {roomTypes.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
            No rooms available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {roomTypes.map((room) => (
              <div key={room.id} className="rounded-lg border p-5">
                <div className="space-y-1">
                  <p className="text-lg font-medium">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Max {room.maxAdults} adults
                    {room.maxChildren ? `, ${room.maxChildren} children` : ''}
                  </p>
                </div>
                {room.description ? (
                  <p className="mt-3 text-sm text-muted-foreground">{room.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {reviewsEnabled && (
        <div className="mt-10 space-y-8">
          <ReviewsDisplay reviews={reviews} title={`Reviews for ${hotel.name}`} />
          <ReviewForm agencyId={agency?.id || ''} hotelId={hotel.id} itemName={hotel.name} />
        </div>
      )}
    </div>
  );
}
