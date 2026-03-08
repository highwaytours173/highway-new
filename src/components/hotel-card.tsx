'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Hotel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, ArrowRight, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BLUR_DATA_URL } from '@/lib/blur-data-url';
import { useLanguage } from '@/hooks/use-language';

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

export function HotelCard({ hotel, className }: HotelCardProps) {
  const { t } = useLanguage();
  const imageUrl = Array.isArray(hotel.images) && hotel.images.length > 0 ? hotel.images[0] : null;

  const location = [hotel.city, hotel.country].filter(Boolean).join(', ');

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Link href={`/hotels/${hotel.slug}`} className="block h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Building2 className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />

        {location && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/90 text-gray-800 backdrop-blur"
          >
            <MapPin className="mr-1.5 h-3 w-3" />
            {location}
          </Badge>
        )}

        {typeof hotel.starRating === 'number' && hotel.starRating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-yellow-400/90 px-2 py-1 text-xs font-bold text-black backdrop-blur">
            <Star className="h-3 w-3 fill-current" />
            <span>{hotel.starRating}</span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link href={`/hotels/${hotel.slug}`} className="block">
            <h3 className="line-clamp-1 text-lg font-bold transition-colors group-hover:text-primary">
              {hotel.name}
            </h3>
          </Link>
          {hotel.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{hotel.description}</p>
          )}
        </div>

        <div className="mt-auto pt-2">
          <Button asChild className="w-full gap-2 group-hover:bg-primary/90">
            <Link href={`/hotels/${hotel.slug}`}>
              {t('hotel.viewDetails')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
