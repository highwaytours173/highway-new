'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TourCard } from '@/components/tour-card';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-headline text-4xl font-bold text-primary mb-8">{t('wishlist.title')}</h1>

      {wishlistItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-semibold">{t('wishlist.empty')}</h2>
            <p className="text-muted-foreground">{t('wishlist.emptyDesc')}</p>
            <Button asChild>
              <Link href="/">{t('wishlist.exploreTours')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
