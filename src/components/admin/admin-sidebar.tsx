'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Home,
  Globe,
  Calendar,
  Settings,
  UserCircle,
  Users,
  Newspaper,
  LayoutDashboard,
  Tag,
  Mail,
  Percent,
  LogOut,
  MessageCircle,
  Building2,
  Star,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User } from '@supabase/supabase-js';
import { AgencySettings } from '@/types/agency';

// const menuItems = [
//   { href: "/admin/dashboard", label: "Dashboard", icon: Home },
//   { href: "/admin/tours", label: "Tours", icon: Globe },
//   { href: "/admin/bookings", label: "Bookings", icon: Calendar },
//   { href: "/admin/customers", label: "Customers", icon: Users },
//   { href: "/admin/blog", label: "Blog", icon: Newspaper },
//   {
//     href: "/admin/home-page-editor",
//     label: "Home Page Editor",
//     icon: LayoutDashboard,
//   },
//   { href: "/admin/upsell-items", label: "Upsell Items", icon: Tag },
//   { href: "/admin/promotions", label: "Promotions", icon: Percent },
//   { href: "/admin/contact-messages", label: "Contact Messages", icon: Mail },
//   { href: "/admin/settings", label: "Settings", icon: Settings },
// ];

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/admin/tours')) return 'Tours';
  if (pathname.startsWith('/admin/bookings')) return 'Bookings';
  if (pathname.startsWith('/admin/hotels/bookings')) return 'Hotel Bookings';
  if (pathname.startsWith('/admin/hotels/rooms')) return 'Room Types';
  if (pathname.startsWith('/admin/hotels/availability')) return 'Availability & Rates';
  if (pathname.startsWith('/admin/hotels')) return 'Hotels Dashboard';
  if (pathname.startsWith('/admin/customers')) return 'Customers';
  if (pathname.startsWith('/admin/blog')) return 'Blog';
  if (pathname.startsWith('/admin/home-page-editor')) return 'Home Page Editor';
  if (pathname.startsWith('/admin/upsell-items')) return 'Upsell Items';
  if (pathname.startsWith('/admin/promotions')) return 'Promotions';
  if (pathname.startsWith('/admin/reviews')) return 'Reviews';
  if (pathname.startsWith('/admin/contact-messages')) return 'Contact Messages';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  return 'Admin';
};

export function AdminSidebar({
  user,
  handleSignOut,
  children,
  settings,
  pendingBookingsCount,
}: {
  user: User;
  handleSignOut: () => void;
  children: React.ReactNode;
  settings?: AgencySettings;
  pendingBookingsCount?: number;
}) {
  const pathname = usePathname();

  // Filter menu items based on settings.modules
  const modules = settings?.modules || {
    blog: true,
    upsell: true,
    contact: true,
    tours: true,
    hotels: true,
  };

  // Menu items grouped by category
  const groups = [
    {
      label: 'Overview',
      items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: Home }],
    },
    {
      label: 'Management',
      items: [
        { href: '/admin/tours', label: 'Tours', icon: Globe },
        { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { href: '/admin/customers', label: 'Customers', icon: Users },
        { href: '/admin/reviews', label: 'Reviews', icon: Star },
      ],
    },
    {
      label: 'Hotels',
      items: [
        { href: '/admin/hotels', label: 'Hotels Dashboard', icon: Building2 },
        { href: '/admin/hotels/rooms', label: 'Room Types', icon: LayoutDashboard },
        { href: '/admin/hotels/availability', label: 'Availability', icon: Calendar },
        { href: '/admin/hotels/bookings', label: 'Bookings', icon: Calendar },
      ],
    },
    {
      label: 'Content',
      items: [
        { href: '/admin/blog', label: 'Blog', icon: Newspaper },
        { href: '/admin/home-page-editor', label: 'Home Page Editor', icon: LayoutDashboard },
        { href: '/admin/upsell-items', label: 'Upsell Items', icon: Tag },
        { href: '/admin/promotions', label: 'Promotions', icon: Percent },
      ],
    },
    {
      label: 'System',
      items: [
        { href: '/admin/contact-messages', label: 'Contact Messages', icon: Mail },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const shouldShowItem = (label: string) => {
    if (label === 'Blog' && modules.blog === false) return false;
    if (label === 'Upsell Items' && modules.upsell === false) return false;
    if (label === 'Contact Messages' && modules.contact === false) return false;
    if (label === 'Reviews' && modules.reviews === false) return false;
    if (label === 'Tours' && modules.tours === false) return false;
    if (
      (label === 'Hotels Dashboard' ||
        label === 'Room Types' ||
        label === 'Availability' ||
        label === 'Bookings') &&
      modules.hotels === false
    )
      return false;
    return true;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-1 py-2">
            <Logo />
            <div className="flex flex-col">
              <span className="font-headline text-lg font-semibold text-foreground">Tourista</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => {
            const visibleItems = group.items.filter((item) => shouldShowItem(item.label));
            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const isPendingBookings =
                        item.href === '/admin/bookings' &&
                        !!pendingBookingsCount &&
                        pendingBookingsCount > 0;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            href={item.href}
                            isActive={pathname.startsWith(item.href)}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                            {isPendingBookings && (
                              <Badge
                                variant="destructive"
                                className="ml-auto h-5 min-w-5 px-1 text-xs"
                              >
                                {pendingBookingsCount}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="truncate text-lg font-semibold">{getPageTitle(pathname)}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="Admin" />
                  <AvatarFallback>
                    <UserCircle />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="https://wa.me/201095280572"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-full flex items-center"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
