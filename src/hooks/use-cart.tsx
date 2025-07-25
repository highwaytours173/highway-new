"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Tour, CartItem } from '@/types';
import { useToast } from "@/hooks/use-toast"

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (tour: Tour, adults: number, children: number, date?: Date) => void;
  removeFromCart: (tourId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('wanderlust-hub-cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Could not load cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('wanderlust-hub-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Could not save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((tour: Tour, adults: number, children: number, date?: Date) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.tour.id === tour.id);
      if (existingItem) {
        toast({ title: "Already in Cart", description: `${tour.name} is already in your cart.` });
        return prevItems;
      }
      toast({ title: "Added to Cart", description: `${tour.name} has been added to your cart.` });
      return [...prevItems, { tour, quantity: adults + children, adults, children, date }];
    });
  }, [toast]);

  const removeFromCart = useCallback((tourId: string) => {
    let tourName: string | undefined;
    setCartItems(prevItems => {
        tourName = prevItems.find(item => item.tour.id === tourId)?.tour.name;
        return prevItems.filter(item => item.tour.id !== tourId)
    });
    
    if (tourName) {
      toast({ title: "Removed from Cart", description: `"${tourName}" has been removed from your cart.` });
    }
  }, [toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const totalPeople = (item.adults ?? 0) + (item.children ?? 0);
      const priceTier = item.tour.priceTiers.find(tier => 
        totalPeople >= tier.minPeople && (tier.maxPeople === null || totalPeople <= tier.maxPeople)
      ) || item.tour.priceTiers[item.tour.priceTiers.length - 1];
      
      const itemTotal = ((item.adults ?? 0) * priceTier.pricePerAdult) + ((item.children ?? 0) * priceTier.pricePerChild);
      return total + itemTotal;
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal }}>
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
