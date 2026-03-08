'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Heart,
  Menu,
  ChevronDown,
  Globe,
  Check,
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { Language } from '@/hooks/use-language';
import type { Currency } from '@/hooks/use-currency';
import { useLanguage, languages } from '@/hooks/use-language';
import { useCurrency, currencies } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { getAgencySettings, AgencySettingsData } from '@/lib/supabase/agency-content';

type SettingsData = AgencySettingsData;

function normalizeNavHref(href: string | undefined | null) {
  const raw = String(href || '').trim();
  if (!raw) return '/';

  const lower = raw.toLowerCase();
  const withoutTrailingSlash = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;

  if (lower === '/#about' || lower === '#about' || lower === 'about') return '/about';
  if (lower === '/#services' || lower === '#services' || lower === 'services') return '/services';
  if (lower === '/#contact' || lower === '#contact' || lower === 'contact') return '/contact';
  if (lower === '/#tours' || lower === '#tours' || lower === 'tours') return '/tours';

  if (withoutTrailingSlash.startsWith('#')) return `/${withoutTrailingSlash}`;
  return withoutTrailingSlash;
}

function getNavHref(label: string, href: string) {
  const normalizedLabel = String(label || '')
    .trim()
    .toLowerCase();
  if (normalizedLabel === 'destination') return '/destination';
  return normalizeNavHref(href);
}

function TopBar({
  contactEmail,
  phoneNumber,
  address,
  socialMedia,
}: {
  contactEmail?: string;
  phoneNumber?: string;
  address?: string;
  socialMedia?: SettingsData['socialMedia'];
}) {
  return (
    <div className="bg-secondary text-secondary-foreground text-sm py-2 border-b">
      <div className="container flex justify-between items-center max-w-screen-2xl">
        <div className="flex items-center gap-6">
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 hover:text-primary"
            >
              <Mail className="w-4 h-4" />
              <span>{contactEmail}</span>
            </a>
          ) : null}
          {phoneNumber ? (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{phoneNumber}</span>
            </div>
          ) : null}
          {address ? (
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{address}</span>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          {socialMedia?.twitter ? (
            <a href={socialMedia.twitter} className="hover:text-primary" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
          ) : null}
          {socialMedia?.facebook ? (
            <a href={socialMedia.facebook} className="hover:text-primary" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
          ) : null}
          {socialMedia?.instagram ? (
            <a href={socialMedia.instagram} className="hover:text-primary" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LanguageCurrencySelector() {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex items-center gap-2 px-3 hover:bg-muted/50 transition-colors"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1 text-xs font-medium">
            <span>{currentLang?.flag}</span>
            <span className="mx-1 h-3 w-[1px] bg-border" />
            <span>{currency}</span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider px-2 py-1.5">
          {t('header.language')}
        </DropdownMenuLabel>
        <div className="grid grid-cols-1 gap-1 mb-2">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              className={cn(
                'flex items-center justify-between px-3 py-2 cursor-pointer rounded-md',
                language === lang.code
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {language === lang.code && <Check className="h-3.5 w-3.5" />}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">
          {t('header.currency')}
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1">
          {currencies.map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code as Currency)}
              className={cn(
                'flex items-center justify-center gap-1.5 px-2 py-2 cursor-pointer rounded-md text-xs',
                currency === curr.code
                  ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <span>{curr.symbol}</span>
              <span>{curr.code}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<{ data: SettingsData; logo_url?: string | null } | null>(
    null
  );

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = pathname === '/' && !isScrolled;

  const headerClasses = isTransparent
    ? 'bg-transparent'
    : isScrolled
      ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md'
      : 'bg-background';

  const navLinkClass = isTransparent
    ? 'font-medium text-white/90 transition-colors hover:text-white drop-shadow'
    : 'font-medium text-foreground transition-colors hover:text-primary';

  const iconClass = isTransparent ? 'text-white/90 hover:text-white' : 'text-foreground';

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getAgencySettings();
        if (!data) return;
        setSettings({
          data: (data.data || {}) as SettingsData,
          logo_url: data.logo_url || null,
        });
      } catch {
        // ignore
      }
    };
    loadSettings();
  }, []);

  const itemCount = isClient ? cartItems.length : 0;
  const wishlistItemCount = isClient ? wishlistItems.length : 0;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500`}>
      {!isTransparent && (
        <div className="hidden md:block">
          <TopBar
            contactEmail={settings?.data?.contactEmail}
            phoneNumber={settings?.data?.phoneNumber}
            address={settings?.data?.address}
            socialMedia={settings?.data?.socialMedia}
          />
        </div>
      )}
      {/* Egyptian accent bar */}
      {!isTransparent && (
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      )}
      <div className={`transition-all duration-500 ${headerClasses}`}>
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo
              logoUrl={settings?.logo_url ?? undefined}
              alt={settings?.data?.agencyName || 'Travel Agency'}
            />
            <div className="hidden sm:block">
              <span
                className={cn(
                  'font-headline text-xl md:text-2xl font-bold',
                  isTransparent ? 'text-white drop-shadow' : 'text-foreground'
                )}
              >
                {settings?.data?.agencyName || 'Travel Agency'}
              </span>
              {settings?.data?.tagline ? (
                <p
                  className={cn(
                    'text-[10px] md:text-xs',
                    isTransparent ? 'text-white/75' : 'text-muted-foreground'
                  )}
                >
                  {settings.data.tagline}
                </p>
              ) : null}
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {settings?.data?.navLinks && settings.data.navLinks.length > 0 ? (
              settings.data.navLinks.map((l) => (
                <Link
                  key={`${l.label}-${l.href}`}
                  href={getNavHref(l.label, l.href)}
                  className={navLinkClass}
                >
                  {l.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/" className={navLinkClass}>
                  {t('nav.home')}
                </Link>
                <Link href="/about" className={navLinkClass}>
                  {t('nav.about')}
                </Link>
                <Link href="/destination" className={navLinkClass}>
                  {t('nav.destination')}
                </Link>
                {settings?.data?.modules?.tours !== false ? (
                  <Link href="/tours" className={navLinkClass}>
                    {t('nav.tours')}
                  </Link>
                ) : null}
                {settings?.data?.modules?.hotels !== false ? (
                  <Link
                    href={settings?.data?.singleHotelMode ? '/hotels/default' : '/hotels'}
                    className={navLinkClass}
                  >
                    {settings?.data?.singleHotelMode ? t('nav.ourRooms') : t('nav.hotels')}
                  </Link>
                ) : null}
                <Link href="/services" className={navLinkClass}>
                  {t('nav.services')}
                </Link>
                {settings?.data?.modules?.blog !== false ? (
                  <Link href="/blog" className={navLinkClass}>
                    {t('nav.blog')}
                  </Link>
                ) : null}
                <Link href="/contact" className={navLinkClass}>
                  {t('nav.contact')}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <LanguageCurrencySelector />
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className={cn('h-5 w-5', iconClass)} />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/wishlist">
                <Heart className={cn('h-5 w-5 md:h-6 md:w-6', iconClass)} />
                {isClient && wishlistItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground">
                    {wishlistItemCount}
                  </span>
                )}
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className={cn('h-5 w-5 md:h-6 md:w-6', iconClass)} />
                {isClient && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>

            {/* H4.3 — click-to-call (mobile only) */}
            {settings?.data?.phoneNumber && (
              <Button variant="ghost" size="icon" className="lg:hidden" asChild>
                <a href={`tel:${settings.data.phoneNumber}`} aria-label="Call us">
                  <Phone className={cn('h-5 w-5', iconClass)} />
                </a>
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden ml-1">
                  <Menu className={cn('h-6 w-6', iconClass)} />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{t('header.menu')}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <nav className="flex flex-col gap-4">
                    {settings?.data?.navLinks && settings.data.navLinks.length > 0 ? (
                      settings.data.navLinks.map((l) => (
                        <Link
                          key={`${l.label}-${l.href}`}
                          href={getNavHref(l.label, l.href)}
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {l.label}
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link
                          href="/"
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {t('nav.home')}
                        </Link>
                        <Link
                          href="/about"
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {t('nav.about')}
                        </Link>
                        <Link
                          href="/destination"
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {t('nav.destination')}
                        </Link>
                        {settings?.data?.modules?.tours !== false ? (
                          <Link
                            href="/tours"
                            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {t('nav.tours')}
                          </Link>
                        ) : null}
                        {settings?.data?.modules?.hotels !== false ? (
                          <Link
                            href={settings?.data?.singleHotelMode ? '/hotels/default' : '/hotels'}
                            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {settings?.data?.singleHotelMode ? t('nav.ourRooms') : t('nav.hotels')}
                          </Link>
                        ) : null}
                        <Link
                          href="/services"
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {t('nav.services')}
                        </Link>
                        {settings?.data?.modules?.blog !== false ? (
                          <Link
                            href="/blog"
                            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {t('nav.blog')}
                          </Link>
                        ) : null}
                        <Link
                          href="/contact"
                          className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {t('nav.contact')}
                        </Link>
                      </>
                    )}
                  </nav>
                  <div className="flex flex-col gap-4 border-t pt-6">
                    {settings?.data?.phoneNumber && (
                      <a
                        href={`tel:${settings.data.phoneNumber}`}
                        className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{settings.data.phoneNumber}</span>
                      </a>
                    )}
                    {settings?.data?.contactEmail && (
                      <a
                        href={`mailto:${settings.data.contactEmail}`}
                        className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                      >
                        <Mail className="w-4 h-4" />
                        <span>{settings.data.contactEmail}</span>
                      </a>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
