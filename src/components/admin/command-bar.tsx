'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  CreditCard,
  Globe,
  Home,
  LayoutDashboard,
  Mail,
  Newspaper,
  Percent,
  Plus,
  Search,
  Settings,
  Star,
  Tag,
  Users,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminLanguage } from '@/hooks/use-admin-language';

/**
 * Custom event name fired by triggers to toggle the global command bar.
 *
 * Decoupling triggers from the host lets us mount the dialog ONCE per
 * layout but render any number of opener buttons across header/sidebar/
 * mobile menu without each instance fighting for the ⌘K listener.
 */
const TOGGLE_EVENT = 'tourista:admin:command-bar:toggle';

type Entry = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Optional secondary search terms separated by space. */
  keywords?: string;
};

/**
 * AdminCommandBarHost — mount EXACTLY ONCE per admin layout. Hosts the
 * CommandDialog and registers the global ⌘K keyboard shortcut + the
 * `tourista:admin:command-bar:toggle` custom event.
 *
 * Trigger buttons (`<AdminCommandBarTrigger>`) elsewhere in the app
 * dispatch the toggle event; the host responds.
 */
export function AdminCommandBarHost() {
  const router = useRouter();
  const { t } = useAdminLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onToggle = () => setOpen((prev) => !prev);
    document.addEventListener('keydown', onKey);
    window.addEventListener(TOGGLE_EVENT, onToggle as EventListener);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(TOGGLE_EVENT, onToggle as EventListener);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const sections: { label: string; items: Entry[] }[] = [
    {
      label: 'Overview',
      items: [
        { label: t('admin.dashboard'), href: '/admin/dashboard', icon: Home, keywords: 'home stats' },
      ],
    },
    {
      label: 'Inventory',
      items: [
        { label: t('admin.tours'), href: '/admin/tours', icon: Globe, keywords: 'trips packages' },
        {
          label: t('admin.hotelsDashboard'),
          href: '/admin/hotels',
          icon: Building2,
          keywords: 'properties stays',
        },
        {
          label: t('admin.roomTypes'),
          href: '/admin/hotels/rooms',
          icon: LayoutDashboard,
          keywords: 'rooms',
        },
        { label: t('admin.upsellItems'), href: '/admin/upsell-items', icon: Tag, keywords: 'addons extras' },
      ],
    },
    {
      label: 'Operations',
      items: [
        {
          label: t('admin.bookings'),
          href: '/admin/bookings',
          icon: Calendar,
          keywords: 'orders sales reservations',
        },
        {
          label: t('admin.hotelBookings'),
          href: '/admin/hotels/bookings',
          icon: Calendar,
          keywords: 'stays reservations',
        },
        { label: t('admin.customers'), href: '/admin/customers', icon: Users, keywords: 'guests users' },
        { label: t('admin.reviews'), href: '/admin/reviews', icon: Star, keywords: 'ratings feedback' },
        {
          label: t('admin.contactMessages'),
          href: '/admin/contact-messages',
          icon: Mail,
          keywords: 'inbox enquiries',
        },
      ],
    },
    {
      label: 'Pricing & Inventory',
      items: [
        {
          label: t('admin.pricingRules'),
          href: '/admin/hotels/pricing-rules',
          icon: Percent,
          keywords: 'rates seasons surcharges',
        },
        {
          label: t('admin.availability'),
          href: '/admin/hotels/availability',
          icon: Calendar,
          keywords: 'inventory rates',
        },
        {
          label: t('admin.promotions'),
          href: '/admin/promotions',
          icon: Percent,
          keywords: 'promo codes discounts coupons',
        },
      ],
    },
    {
      label: 'Content',
      items: [
        {
          label: t('admin.homePageEditor'),
          href: '/admin/home-page-editor',
          icon: LayoutDashboard,
          keywords: 'hero sections layout',
        },
        { label: t('admin.blog'), href: '/admin/blog', icon: Newspaper, keywords: 'posts articles' },
      ],
    },
    {
      label: 'Setup',
      items: [
        {
          label: t('admin.settings'),
          href: '/admin/settings',
          icon: Settings,
          keywords: 'branding logo theme payments currency email SEO modules',
        },
      ],
    },
  ];

  const actions: Entry[] = [
    { label: 'New tour', href: '/admin/tours/new', icon: Plus, keywords: 'create add' },
    { label: 'New blog post', href: '/admin/blog/new', icon: Plus, keywords: 'create add' },
    { label: 'New promo code', href: '/admin/promotions/new', icon: Plus, keywords: 'create add discount' },
    {
      label: 'Open public site',
      href: '/',
      icon: Globe,
      keywords: 'visit website live storefront',
    },
    {
      label: 'Find a booking (guest)',
      href: '/bookings',
      icon: CreditCard,
      keywords: 'lookup reference',
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, settings…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {sections.map((section, idx) => (
          <div key={section.label}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={section.label}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.keywords ?? ''}`}
                  onSelect={() => go(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {actions.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.keywords ?? ''}`}
              onSelect={() => go(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

interface AdminCommandBarTriggerProps {
  variant?: 'icon' | 'search-pill';
  className?: string;
}

/**
 * AdminCommandBarTrigger — lightweight opener button. Mount as many as
 * you like (header icon, sidebar pill, mobile menu, etc). Dispatches the
 * toggle event that the single `<AdminCommandBarHost>` listens for.
 */
export function AdminCommandBarTrigger({
  variant = 'search-pill',
  className,
}: AdminCommandBarTriggerProps) {
  const open = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(TOGGLE_EVENT));
  };

  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={open}
        className={cn('h-9 w-9', className)}
        aria-label="Open command bar"
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={open}
      className={cn(
        'h-9 w-full justify-start gap-2 px-3 text-sm font-normal text-muted-foreground',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left truncate">Quick search…</span>
      <CommandShortcut className="ml-auto">⌘K</CommandShortcut>
    </Button>
  );
}
