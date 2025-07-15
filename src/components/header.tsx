"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, ArrowRight, Mail, Phone, MapPin, Twitter, Facebook, Instagram } from 'lucide-react';
import { useCart } from '@/hooks/use-cart.tsx';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

function TopBar() {
  return (
    <div className="bg-slate-100 text-slate-600 text-sm py-2 border-b">
      <div className="container flex justify-between items-center max-w-screen-2xl">
        <div className="flex items-center gap-6">
          <a href="mailto:demo@example.com" className="flex items-center gap-2 hover:text-primary">
            <Mail className="w-4 h-4" />
            <span>demo@example.com</span>
          </a>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+990 123 456 789</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>15/K, Dhaka London City, LOT</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary"><Twitter className="w-4 h-4" /></a>
          <a href="#" className="hover:text-primary"><Facebook className="w-4 h-4" /></a>
          <a href="#" className="hover:text-primary"><Instagram className="w-4 h-4" /></a>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { cartItems } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = isClient ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  const headerClasses = isScrolled 
    ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md' 
    : 'bg-background';

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300`}>
      <TopBar />
      <div className={`transition-all duration-300 ${headerClasses}`}>
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo />
            <div>
              <span className="font-headline text-2xl font-bold text-foreground">Turmet</span>
              <p className="text-xs text-muted-foreground">Explore The World</p>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">Home</Link>
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-primary">About Us</Link>
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-primary">Destination</Link>
            <Link href="/#tours" className="font-medium text-foreground transition-colors hover:text-primary">Tour</Link>
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-primary">Services</Link>
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-primary">Blog</Link>
            <Link href="#" className="font-medium text-foreground transition-colors hover:text-primary">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5 text-foreground" />
                  <span className="sr-only">Search</span>
              </Button>
              <Button variant="ghost" size="icon" asChild className="relative">
                  <Link href="/cart">
                  <ShoppingCart className="h-6 w-6 text-foreground" />
                  {isClient && itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {itemCount}
                      </span>
                  )}
                  <span className="sr-only">Shopping Cart</span>
                  </Link>
              </Button>
              <Button>
                Request a Quote <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
