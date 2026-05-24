import Link from 'next/link';
import Image from 'next/image';
import type { Tour } from '@/types';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, MapPin, Star, Heart, ArrowRight, Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URL } from '@/lib/blur-data-url';
import { TiltCard, MagneticWrap } from '@/components/motion';

export type TourAvailabilityStatus =
  | { status: 'available' }
  | { status: 'limited'; spots?: number }
  | { status: 'soldout' }
  | { status: 'unrestricted' };

interface TourCardProps {
  tour: Tour;
  availabilityStatus?: TourAvailabilityStatus;
  compareEnabled?: boolean;
  compareSelected?: boolean;
  onToggleCompare?: (tourId: string) => void;
  compareDisabled?: boolean;
}

export function TourCard({
  tour,
  availabilityStatus,
  compareEnabled = false,
  compareSelected = false,
  onToggleCompare,
  compareDisabled = false,
}: TourCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const isFavorited = isInWishlist(tour.id);

  const imageUrl = Array.isArray(tour.images) && tour.images.length > 0 ? tour.images[0] : null;

  const startingPrice = (() => {
    const prices: number[] = [];
    for (const tier of tour.priceTiers ?? []) {
      if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
    }
    for (const pkg of tour.packages ?? []) {
      for (const tier of pkg.priceTiers ?? []) {
        if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
      }
    }
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    return Number.isFinite(min) ? min : null;
  })();

  const durationLabel = `${tour.duration} ${t('featured.duration')}`;
  const ratingLabel =
    typeof tour.rating === 'number' && Number.isFinite(tour.rating) && tour.rating > 0
      ? tour.rating.toFixed(1)
      : t('tour.new');

  const isSoldOut = availabilityStatus?.status === 'soldout';
  const isLimited = availabilityStatus?.status === 'limited';
  const category = Array.isArray(tour.type) ? tour.type[0] : undefined;

  const snippet = (() => {
    const desc = (tour.description ?? '').trim();
    if (!desc) return '';
    return desc.length > 140 ? `${desc.slice(0, 137)}…` : desc;
  })();

  const firstHighlight = Array.isArray(tour.highlights) ? tour.highlights[0] : undefined;

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isFavorited) {
      removeFromWishlist(tour.id);
    } else {
      addToWishlist(tour);
    }
  };

  const handleCompareChange = (next: boolean | 'indeterminate') => {
    if (!onToggleCompare) return;
    if (next === 'indeterminate') return;
    onToggleCompare(tour.id);
  };

  const renderAvailabilityBadge = () => {
    if (!availabilityStatus) return null;
    if (availabilityStatus.status === 'available') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-200">
          {t('tours.availabilityAvailable')}
        </span>
      );
    }
    if (availabilityStatus.status === 'limited') {
      const label =
        typeof availabilityStatus.spots === 'number'
          ? t('tours.availabilityFewLeftCount').replace(
              '{{count}}',
              String(availabilityStatus.spots)
            )
          : t('tours.availabilityFewLeft');
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          {label}
        </span>
      );
    }
    if (availabilityStatus.status === 'soldout') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {t('tours.availabilitySoldOut')}
        </span>
      );
    }
    return null;
  };

  return (
    <TiltCard maxTilt={4} className="h-full">
    <Card
      className={cn(
        'group h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
        isSoldOut && 'opacity-90',
        compareSelected && 'ring-2 ring-primary'
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Link href={`/tours/${tour.slug}`} className="relative block h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={tour.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint={`${tour.destination} ${(Array.isArray(tour.type) ? tour.type[0] : '') || 'travel'}`}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              priority={false}
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0" />
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-white/90 text-gray-800 backdrop-blur dark:bg-black/70 dark:text-white"
        >
          <MapPin className="h-3 w-3 mr-1.5" />
          {tour.destination}
        </Badge>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 text-gray-800 backdrop-blur hover:bg-white dark:bg-black/70 dark:text-white dark:hover:bg-black/80',
            isFavorited && 'text-red-600 bg-red-50 hover:bg-red-50 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-950/60'
          )}
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isFavorited}
          type="button"
        >
          <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
        </Button>
        {compareEnabled && (
          <label
            className={cn(
              'absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur dark:bg-black/70 dark:text-white',
              compareDisabled && !compareSelected && 'opacity-60'
            )}
          >
            <Checkbox
              checked={compareSelected}
              disabled={compareDisabled && !compareSelected}
              onCheckedChange={handleCompareChange}
              aria-label={t('tours.compareAdd')}
            />
            {compareSelected ? t('tours.compareSelected') : t('tours.compareAdd')}
          </label>
        )}
      </div>

      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {durationLabel}
            </span>
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {renderAvailabilityBadge()}
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{ratingLabel}</span>
            </div>
          </div>
        </div>

        <h3 className="font-headline text-lg font-semibold leading-snug">
          <Link
            href={`/tours/${tour.slug}`}
            className="line-clamp-2 transition-colors hover:text-primary"
            title={tour.name}
          >
            {tour.name}
          </Link>
        </h3>

        {snippet && (
          <p className="line-clamp-2 text-sm text-muted-foreground" title={tour.description}>
            {snippet}
          </p>
        )}

        {firstHighlight && (
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              <span className="line-clamp-1 max-w-[200px]">{firstHighlight}</span>
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{t('featured.from')}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">
                {startingPrice != null ? format(startingPrice) : t('tour.contactUs')}
              </span>
              {startingPrice != null && (
                <span className="text-xs text-muted-foreground">{t('tour.perPerson')}</span>
              )}
            </div>
            {startingPrice != null && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 dark:text-green-400 cursor-help"
                      tabIndex={0}
                      aria-label="Pricing details"
                    >
                      All-in price
                      <Info className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    Taxes and service fees are included in the displayed price.
                    No surprise charges at checkout.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <MagneticWrap strength={0.15} radius={70}>
            <Button
              asChild
              variant={isSoldOut ? 'ghost' : isLimited ? 'default' : 'outline'}
              className={cn('shrink-0', isSoldOut && 'opacity-70 pointer-events-none')}
              aria-disabled={isSoldOut}
            >
              <Link href={`/tours/${tour.slug}`}>
                {isSoldOut ? t('tours.availabilitySoldOut') : t('tours.details')}{' '}
                {!isSoldOut && <ArrowRight className="ml-2 h-4 w-4" />}
              </Link>
            </Button>
          </MagneticWrap>
        </div>
      </CardContent>
    </Card>
    </TiltCard>
  );
}
