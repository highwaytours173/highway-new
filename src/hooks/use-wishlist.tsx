'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { Tour } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlistItems: Tour[];
  addToWishlist: (tour: Tour) => void;
  removeFromWishlist: (tourId: string) => void;
  isInWishlist: (tourId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<Tour[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const host = typeof window === 'undefined' ? 'app' : window.location.host;
    const WISHLIST_STORAGE_KEY = `${host}-wishlist`;
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error('Could not load wishlist from localStorage', error);
    }
  }, []);

  useEffect(() => {
    const host = typeof window === 'undefined' ? 'app' : window.location.host;
    const WISHLIST_STORAGE_KEY = `${host}-wishlist`;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Could not save wishlist to localStorage', error);
    }
  }, [wishlistItems]);

  const addToWishlist = useCallback(
    (tour: Tour) => {
      setWishlistItems((prevItems) => {
        if (prevItems.some((item) => item.id === tour.id)) {
          return prevItems;
        }
        toast({
          title: 'Added to Wishlist',
          description: `${tour.name} has been added to your wishlist.`,
        });
        return [...prevItems, tour];
      });
    },
    [toast]
  );

  const removeFromWishlist = useCallback(
    (tourId: string) => {
      let tourName: string | undefined;
      setWishlistItems((prevItems) => {
        tourName = prevItems.find((item) => item.id === tourId)?.name;
        return prevItems.filter((item) => item.id !== tourId);
      });

      if (tourName) {
        toast({
          title: 'Removed from Wishlist',
          description: `${tourName} has been removed from your wishlist.`,
        });
      }
    },
    [toast]
  );

  const isInWishlist = (tourId: string) => {
    return wishlistItems.some((item) => item.id === tourId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
