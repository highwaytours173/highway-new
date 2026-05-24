'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TourCard } from '@/components/tour-card';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ShareWishlistButton } from '@/components/share-wishlist-button';

type SortValue = 'recent' | 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';

const SORT_FILTER_THRESHOLD = 4;

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortValue>('recent');

  const visible = useMemo(() => {
    const startingPriceOf = (tour: (typeof wishlistItems)[number]): number | null => {
      const prices: number[] = [];
      for (const tier of tour.priceTiers ?? []) {
        if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
      }
      for (const pkg of tour.packages ?? []) {
        for (const tier of pkg.priceTiers ?? []) {
          if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
        }
      }
      return prices.length > 0 ? Math.min(...prices) : null;
    };

    const q = query.trim().toLowerCase();
    const list = wishlistItems.filter((tour) => {
      if (!q) return true;
      const hay = `${tour.name} ${tour.destination ?? ''} ${tour.description ?? ''}`.toLowerCase();
      return hay.includes(q);
    });

    if (sort === 'recent') return list;
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      if (sort === 'rating_desc') return (b.rating ?? 0) - (a.rating ?? 0);
      const pa = startingPriceOf(a) ?? Number.POSITIVE_INFINITY;
      const pb = startingPriceOf(b) ?? Number.POSITIVE_INFINITY;
      return sort === 'price_asc' ? pa - pb : pb - pa;
    });
    return sorted;
  }, [wishlistItems, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold">
              {t('wishlist.title')}
            </h1>
          </div>
          {wishlistItems.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {wishlistItems.length}{' '}
              {wishlistItems.length === 1 ? 'saved tour' : 'saved tours'}
            </p>
          )}
        </div>
        {wishlistItems.length > 0 && <ShareWishlistButton tours={wishlistItems} />}
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl">
          <CardContent className="space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <Heart className="h-10 w-10 text-red-400 dark:text-red-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{t('wishlist.empty')}</h2>
              <p className="mx-auto max-w-md text-muted-foreground">{t('wishlist.emptyDesc')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/tours">{t('wishlist.exploreTours')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/hotels">Browse hotels</Link>
              </Button>
            </div>
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Tap the heart on any tour card to save it here
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {wishlistItems.length >= SORT_FILTER_THRESHOLD && (
            <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_auto] shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter saved tours"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortValue)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm sm:w-56"
              >
                <option value="recent">Recently added</option>
                <option value="price_asc">Price (low to high)</option>
                <option value="price_desc">Price (high to low)</option>
                <option value="rating_desc">Top rated</option>
                <option value="name_asc">Name (A–Z)</option>
              </select>
            </div>
          )}

          {visible.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <p className="text-muted-foreground">No saved tours match &quot;{query}&quot;.</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setQuery('')}>
                Clear filter
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline">{visible.length} of {wishlistItems.length}</Badge>
                <Link href="/tours" className="font-medium text-primary hover:underline">
                  Add more →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
