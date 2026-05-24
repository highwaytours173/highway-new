'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HotelCard } from '@/components/hotel-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Star, X } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import type { Hotel } from '@/types';

type SortValue = 'recommended' | 'rating_desc' | 'name_asc';

export function HotelsPageClient({ hotels }: { hotels: Hotel[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [minStars, setMinStars] = useState<number>(0);
  const [sort, setSort] = useState<SortValue>('recommended');

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const h of hotels) {
      if (h.city) set.add(h.city);
    }
    return Array.from(set).sort();
  }, [hotels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = hotels.filter((h) => {
      if (city && h.city !== city) return false;
      if (minStars > 0 && (h.starRating ?? 0) < minStars) return false;
      if (q) {
        const hay = `${h.name} ${h.city ?? ''} ${h.country ?? ''} ${h.description ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sort === 'rating_desc') {
      list.sort((a, b) => (b.starRating ?? 0) - (a.starRating ?? 0));
    } else if (sort === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [hotels, query, city, minStars, sort]);

  const activeFilterCount = [query, city, minStars > 0 ? '1' : ''].filter(Boolean).length;
  const clearAll = () => {
    setQuery('');
    setCity('');
    setMinStars(0);
    setSort('recommended');
  };

  return (
    <div>
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-b">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.05),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(0,0,0,0.05),transparent_40%)]"
        />
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl space-y-3 text-center mx-auto">
            {hotels.length > 0 && (
              <Badge variant="secondary" className="mb-1">
                <Building2 className="h-3 w-3 mr-1.5" />
                {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold font-headline">{t('hotels.title')}</h1>
            <p className="text-muted-foreground text-base md:text-lg">{t('hotels.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
        {/* Filters */}
        {hotels.length > 0 && (
          <div className="sticky top-[80px] md:top-[130px] z-20 rounded-2xl border bg-card/85 p-4 md:p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 space-y-2">
                <label className="text-sm font-medium" htmlFor="hotels-q">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hotels-q"
                    placeholder="Search by name, city, or description"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium" htmlFor="hotels-city">
                  City
                </label>
                <select
                  id="hotels-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">All cities</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium" htmlFor="hotels-stars">
                  Min stars
                </label>
                <select
                  id="hotels-stars"
                  value={minStars}
                  onChange={(e) => setMinStars(Number(e.target.value))}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value={0}>Any</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium" htmlFor="hotels-sort">
                  Sort
                </label>
                <select
                  id="hotels-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortValue)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating_desc">Top rated</option>
                  <option value="name_asc">Name (A–Z)</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                  <X className="h-4 w-4 mr-1.5" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Status row */}
        {hotels.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length} of {hotels.length}{' '}
            {hotels.length === 1 ? 'hotel' : 'hotels'}
          </div>
        )}

        {/* Results */}
        {hotels.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('hotels.noHotels')}</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;ll be adding stays soon. In the meantime, browse our curated tours.
            </p>
            <Button asChild>
              <Link href="/tours">Explore tours</Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">No hotels match your filters</h2>
            <p className="text-muted-foreground mb-4">
              Try clearing some filters or widening your search.
            </p>
            <Button type="button" variant="outline" onClick={clearAll}>
              <X className="h-4 w-4 mr-1.5" />
              Clear filters
            </Button>
          </div>
        ) : (
          <Stagger
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.07}
            amount={0.1}
          >
            {filtered.map((hotel) => (
              <StaggerItem key={hotel.id}>
                <HotelCard hotel={hotel} />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {/* Star rating legend / trust row */}
        {hotels.length > 0 && (
          <Reveal as="div" className="rounded-2xl border bg-muted/30 p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Verified partner hotels
            </span>
            <span>Best price guarantee</span>
            <span>Instant confirmation</span>
            <span>24/7 support</span>
          </Reveal>
        )}
      </div>
    </div>
  );
}
