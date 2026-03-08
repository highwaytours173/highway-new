'use client';

import { HotelCard } from '@/components/hotel-card';
import { useLanguage } from '@/hooks/use-language';
import type { Hotel } from '@/types';

export function HotelsPageClient({ hotels }: { hotels: Hotel[] }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{t('hotels.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('hotels.subtitle')}</p>
      </div>

      {hotels.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t('hotels.noHotels')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}
