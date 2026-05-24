'use client';

import { useState } from 'react';
import { Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import type { Tour } from '@/types';

/**
 * SaveSharedWishlistButton — adds every tour from a shared wishlist URL to
 * the current visitor's local wishlist. Skips duplicates and shows a
 * confirmation state once done.
 */
export function SaveSharedWishlistButton({ tours }: { tours: Tour[] }) {
  const { wishlistItems, addToWishlist } = useWishlist();
  const [saved, setSaved] = useState(false);

  if (tours.length === 0) return null;

  const alreadyHave = new Set(wishlistItems.map((t) => t.id));
  const remaining = tours.filter((t) => !alreadyHave.has(t.id));

  const handleSave = () => {
    for (const tour of remaining) {
      addToWishlist(tour);
    }
    setSaved(true);
  };

  if (saved || remaining.length === 0) {
    return (
      <Button type="button" variant="secondary" size="sm" disabled className="gap-1.5">
        <Check className="h-4 w-4" />
        Saved to wishlist
      </Button>
    );
  }

  return (
    <Button type="button" size="sm" onClick={handleSave} className="gap-1.5">
      <Heart className="h-4 w-4" />
      Save {remaining.length} to my wishlist
    </Button>
  );
}
