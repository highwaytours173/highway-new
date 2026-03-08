'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToursClient } from './tours-client';
import { useLanguage } from '@/hooks/use-language';
import type { Tour } from '@/types';

interface ToursPageClientProps {
  sortedTours: Tour[];
  allTours: Tour[];
  q: string;
  destination: string;
  type: string;
  sort: string;
  travelDate: string;
  destinationOptions: string[];
  typeOptions: string[];
  hasLoadError: boolean;
}

function getSortLabel(value: string, t: (key: string) => string): string {
  switch (value) {
    case 'rating_desc':
      return t('tours.sortTopRated');
    case 'price_asc':
      return t('tours.sortPriceAsc');
    case 'price_desc':
      return t('tours.sortPriceDesc');
    case 'duration_asc':
      return t('tours.sortDurAsc');
    case 'duration_desc':
      return t('tours.sortDurDesc');
    case 'name_asc':
      return t('tours.sortNameAsc');
    default:
      return value;
  }
}

export function ToursPageClient({
  sortedTours,
  allTours,
  q,
  destination,
  type,
  sort,
  travelDate,
  destinationOptions,
  typeOptions,
  hasLoadError,
}: ToursPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold font-headline">{t('tours.title')}</h1>
          <p className="text-muted-foreground">{t('tours.subtitle')}</p>
        </div>

        <form
          method="get"
          className="rounded-2xl border bg-card p-4 md:p-6"
          aria-label="Filter tours"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium" htmlFor="tours-q">
                {t('tours.searchLabel')}
              </label>
              <Input
                id="tours-q"
                type="text"
                name="q"
                defaultValue={q}
                placeholder={t('tours.searchPlaceholder')}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium" htmlFor="tours-travel-date">
                {t('tours.travelDateLabel')}
              </label>
              <Input
                id="tours-travel-date"
                type="date"
                name="travelDate"
                defaultValue={travelDate}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium" htmlFor="tours-destination">
                {t('tours.destinationLabel')}
              </label>
              <select
                id="tours-destination"
                name="destination"
                defaultValue={destination}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{t('tours.allDestinations')}</option>
                {destinationOptions.length > 0 ? (
                  destinationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {t('tours.noDestinations')}
                  </option>
                )}
              </select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium" htmlFor="tours-type">
                {t('tours.typeLabel')}
              </label>
              <select
                id="tours-type"
                name="type"
                defaultValue={type}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{t('tours.allTypes')}</option>
                {typeOptions.length > 0 ? (
                  typeOptions.map((tp) => (
                    <option key={tp} value={tp}>
                      {tp}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {t('tours.noTypes')}
                  </option>
                )}
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium" htmlFor="tours-sort">
                {t('tours.sortLabel')}
              </label>
              <select
                id="tours-sort"
                name="sort"
                defaultValue={sort}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{t('tours.recommended')}</option>
                <option value="rating_desc">{t('tours.sortTopRated')}</option>
                <option value="price_asc">{t('tours.sortPriceAsc')}</option>
                <option value="price_desc">{t('tours.sortPriceDesc')}</option>
                <option value="duration_asc">{t('tours.sortDurAsc')}</option>
                <option value="duration_desc">{t('tours.sortDurDesc')}</option>
                <option value="name_asc">{t('tours.sortNameAsc')}</option>
              </select>
            </div>

            <div className="md:col-span-12 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button type="submit">{t('tours.apply')}</Button>
              <Button asChild type="button" variant="outline">
                <Link href="/tours">{t('tours.clear')}</Link>
              </Button>
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {t('tours.showing')} {sortedTours.length} {t('tours.of')} {allTours.length}{' '}
            {allTours.length === 1 ? t('tours.tour') : t('tours.tours')}
          </div>

          {(q || destination || type || sort || travelDate) && (
            <div className="flex flex-wrap gap-2">
              {q && (
                <Badge variant="secondary">
                  {t('tours.searchBadge')} {q}
                </Badge>
              )}
              {travelDate && (
                <Badge variant="secondary">
                  {t('tours.dateBadge')} {travelDate}
                </Badge>
              )}
              {destination && (
                <Badge variant="secondary">
                  {t('tours.destinationBadge')} {destination}
                </Badge>
              )}
              {type && (
                <Badge variant="secondary">
                  {t('tours.typeBadge')} {type}
                </Badge>
              )}
              {sort && (
                <Badge variant="secondary">
                  {t('tours.sortBadge')} {getSortLabel(sort, t)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {hasLoadError ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">{t('tours.unavailableTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('tours.unavailableDesc')}</p>
            <Button asChild>
              <Link href="/tours">{t('tours.retry')}</Link>
            </Button>
          </div>
        ) : sortedTours.length > 0 ? (
          <ToursClient tours={sortedTours} />
        ) : (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">{t('tours.noResults')}</h2>
            <p className="text-muted-foreground mb-6">{t('tours.noResultsDesc')}</p>
            <Button asChild>
              <Link href="/tours">{t('tours.clearFilters')}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
