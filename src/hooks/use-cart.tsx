'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { validatePromoCode } from '@/lib/supabase/promo-codes';
import type { Tour, CartItem, UpsellItem, PromoCode } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  promoCode: PromoCode | null;
  addToCart: (
    product: Tour | UpsellItem,
    productType: 'tour' | 'upsell',
    adults?: number,
    children?: number,
    date?: Date,
    quantity?: number,
    packageId?: string,
    packageName?: string
  ) => void;
  removeFromCart: (productId: string, productType: 'tour' | 'upsell', packageId?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const host = typeof window === 'undefined' ? 'app' : window.location.host;
    const CART_STORAGE_KEY = `${host}-cart`;
    const PROMO_STORAGE_KEY = `${host}-promo`;
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (storedPromo) {
        setPromoCode(JSON.parse(storedPromo));
      }
    } catch (error) {
      console.error('Could not load cart from localStorage', error);
    }
  }, []);

  useEffect(() => {
    const host = typeof window === 'undefined' ? 'app' : window.location.host;
    const CART_STORAGE_KEY = `${host}-cart`;
    const PROMO_STORAGE_KEY = `${host}-promo`;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      if (promoCode) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promoCode));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Could not save cart to localStorage', error);
    }
  }, [cartItems, promoCode]);

  const addToCart = useCallback(
    (
      product: Tour | UpsellItem,
      productType: 'tour' | 'upsell',
      adults?: number,
      children?: number,
      date?: Date,
      quantity?: number,
      packageId?: string,
      packageName?: string
    ) => {
      let toastMessage: { title: string; description: string } | null = null;
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) =>
            item.product.id === product.id &&
            item.productType === productType &&
            // If packages are used, treat different packages as different items
            (item.packageId ?? 'base') === (packageId ?? 'base')
        );
        if (existingItem) {
          toastMessage = {
            title: 'Already in Cart',
            description: `${product.name} ${packageName ? `(${packageName})` : ''} is already in your cart.`,
          };
          return prevItems;
        }
        toastMessage = {
          title: 'Added to Cart',
          description: `${product.name} ${packageName ? `(${packageName})` : ''} has been added to your cart.`,
        };
        return [
          ...prevItems,
          { product, productType, adults, children, date, quantity, packageId, packageName },
        ];
      });
      if (toastMessage) {
        toast(toastMessage);
      }
    },
    [toast]
  );

  const removeFromCart = useCallback(
    (productId: string, productType: 'tour' | 'upsell', packageId?: string) => {
      let productName: string | undefined;
      setCartItems((prevItems) => {
        const itemToRemove = prevItems.find(
          (item) =>
            item.product.id === productId &&
            item.productType === productType &&
            (item.packageId ?? 'base') === (packageId ?? 'base')
        );
        if (itemToRemove) {
          productName = itemToRemove.product.name;
        }
        return prevItems.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.productType === productType &&
              (item.packageId ?? 'base') === (packageId ?? 'base')
            )
        );
      });

      if (productName) {
        toast({
          title: 'Removed from Cart',
          description: `"${productName}" has been removed from your cart.`,
        });
      }
    },
    [toast]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      if (item.productType === 'tour') {
        const tour = item.product as Tour;
        const totalPeople = (item.adults ?? 0) + (item.children ?? 0);

        // Find specific package if selected
        const selectedPackage =
          item.packageId && tour.packages
            ? tour.packages.find((p) => p.id === item.packageId)
            : null;

        // Use package tiers if available, otherwise fallback to tour tiers
        const tiers = selectedPackage ? selectedPackage.priceTiers : tour.priceTiers;

        if (!tiers || tiers.length === 0) return total;

        const priceTier =
          tiers.find(
            (tier) =>
              totalPeople >= tier.minPeople &&
              (tier.maxPeople === null || totalPeople <= tier.maxPeople)
          ) || tiers[tiers.length - 1];

        const itemTotal =
          (item.adults ?? 0) * priceTier.pricePerAdult +
          (item.children ?? 0) * priceTier.pricePerChild;
        return total + itemTotal;
      } else if (item.productType === 'upsell') {
        const upsellItem = item.product as UpsellItem;
        const variant =
          item.packageId && upsellItem.variants
            ? upsellItem.variants.find((v) => v.id === item.packageId)
            : undefined;
        const price = variant?.price ?? upsellItem.price;
        return total + price * (item.quantity ?? 1);
      }
      return total;
    }, 0);
  }, [cartItems]);

  const getDiscountAmount = useCallback(() => {
    if (!promoCode) return 0;
    const subtotal = getCartTotal();

    // Check minimum order amount
    if (promoCode.minOrderAmount && subtotal < promoCode.minOrderAmount) {
      return 0;
    }

    let discount = 0;
    if (promoCode.type === 'percentage') {
      discount = (subtotal * promoCode.value) / 100;
      if (promoCode.maxDiscountAmount && discount > promoCode.maxDiscountAmount) {
        discount = promoCode.maxDiscountAmount;
      }
    } else {
      discount = promoCode.value;
    }

    // Ensure discount doesn't exceed subtotal
    return Math.min(discount, subtotal);
  }, [promoCode, getCartTotal]);

  const getFinalTotal = useCallback(() => {
    return getCartTotal() - getDiscountAmount();
  }, [getCartTotal, getDiscountAmount]);

  const applyPromoCode = useCallback(
    async (code: string) => {
      try {
        const subtotal = getCartTotal();
        const promo = await validatePromoCode(code, subtotal);
        setPromoCode(promo);
        toast({
          title: 'Promo Code Applied',
          description: `Discount of ${promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`} applied!`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Invalid Promo Code',
          description: error instanceof Error ? error.message : 'Could not apply promo code.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [getCartTotal, toast]
  );

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your cart.',
    });
  }, [toast]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        promoCode,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        applyPromoCode,
        removePromoCode,
        getDiscountAmount,
        getFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
