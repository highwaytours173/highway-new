import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, MapPin, Star, Clock, Phone, Mail, Globe } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { HotelHeroGallery } from '@/components/hotel-hero-gallery';
import {
  getPublicHotelBySlug,
  getPublicHotels,
  getPublicRoomTypesByHotelId,
} from '@/lib/supabase/hotels';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { getAgencySettings } from '@/lib/supabase/agency-content';
import { getApprovedReviewsForHotel } from '@/lib/supabase/reviews';
import { ReviewForm } from '@/components/review-form';
import { ReviewsDisplay } from '@/components/reviews-display';
import { RoomsGrid } from '@/components/rooms-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HotelDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function HotelDetailsPage({ params }: HotelDetailsPageProps) {
  const { slug } = await params;
  const settings = await getAgencySettings();
  const singleHotelMode = settings?.data?.singleHotelMode === true;

  if (singleHotelMode) {
    redirect('/hotel');
  }

  const agency = await getCurrentAgency();
  const requestedSlug = slug === 'default' ? (agency?.slug ?? slug) : slug;
  let hotel = await getPublicHotelBySlug(requestedSlug);

  if (!hotel && slug === 'default') {
    const hotels = await getPublicHotels({ skipTranslation: true });
    hotel = hotels[0] ?? null;
  }

  if (!hotel) {
    notFound();
  }

  const [roomTypes, reviews] = await Promise.all([
    getPublicRoomTypesByHotelId(hotel.id),
    getApprovedReviewsForHotel(hotel.id),
  ]);

  const reviewsEnabled = agency?.settings?.modules?.reviews !== false;
  const images = Array.isArray(hotel.images) ? hotel.images.filter(Boolean) : [];
  const location = [hotel.address, hotel.city, hotel.country].filter(Boolean).join(', ');

  return (
    <div>
      {/* Hero gallery — scroll-parallax */}
      <HotelHeroGallery images={images} alt={hotel.name} />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-10">
        {/* Header info */}
        <Reveal className="space-y-4">
          <Link
            href="/hotels"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to hotels
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {typeof hotel.starRating === 'number' && hotel.starRating > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                    <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                    {hotel.starRating}-star
                  </Badge>
                )}
                {hotel.city && <Badge variant="outline">{hotel.city}</Badge>}
                {hotel.country && hotel.country !== hotel.city && (
                  <Badge variant="outline">{hotel.country}</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{hotel.name}</h1>
              {location && (
                <p className="inline-flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                  <span>{location}</span>
                </p>
              )}
            </div>

            <Button asChild size="lg" className="shrink-0">
              <a href="#rooms">View rooms</a>
            </Button>
          </div>

          {hotel.description && (
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
              {hotel.description}
            </p>
          )}
        </Reveal>

        {/* Info chips: check-in/out times + contact */}
        {(hotel.checkInTime ||
          hotel.checkOutTime ||
          hotel.contactPhone ||
          hotel.contactEmail ||
          hotel.website) && (
          <Reveal as="div" delay={0.1} className="grid grid-cols-2 gap-3 md:grid-cols-4 rounded-2xl border bg-card p-4">
            {hotel.checkInTime && (
              <InfoChip
                icon={<Clock className="h-4 w-4 text-primary" />}
                label="Check-in"
                value={hotel.checkInTime}
              />
            )}
            {hotel.checkOutTime && (
              <InfoChip
                icon={<Clock className="h-4 w-4 text-primary" />}
                label="Check-out"
                value={hotel.checkOutTime}
              />
            )}
            {hotel.contactPhone && (
              <InfoChip
                icon={<Phone className="h-4 w-4 text-primary" />}
                label="Phone"
                value={hotel.contactPhone}
                href={`tel:${hotel.contactPhone}`}
              />
            )}
            {hotel.contactEmail && (
              <InfoChip
                icon={<Mail className="h-4 w-4 text-primary" />}
                label="Email"
                value={hotel.contactEmail}
                href={`mailto:${hotel.contactEmail}`}
              />
            )}
            {hotel.website && (
              <InfoChip
                icon={<Globe className="h-4 w-4 text-primary" />}
                label="Website"
                value="Visit"
                href={hotel.website}
              />
            )}
          </Reveal>
        )}

        {/* Rooms */}
        <section id="rooms" className="space-y-4 scroll-mt-24">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold font-headline">Rooms</h2>
            {roomTypes.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {roomTypes.length} {roomTypes.length === 1 ? 'option' : 'options'}
              </span>
            )}
          </div>
          <RoomsGrid rooms={roomTypes} hotelSlug={hotel.slug} singleHotelMode={false} />
        </section>

        {/* Reviews Section */}
        {reviewsEnabled && (
          <div className="space-y-8">
            <ReviewsDisplay reviews={reviews} title={`Reviews for ${hotel.name}`} />
            <ReviewForm agencyId={agency?.id || ''} hotelId={hotel.id} itemName={hotel.name} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-2 min-w-0">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="hover:opacity-80" target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
