import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Calendar, Users } from 'lucide-react';
import { findBookingForGuest } from '@/lib/supabase/guest-bookings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Your booking',
  robots: { index: false, follow: false },
};

interface BookingPageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function statusBadge(status: 'Confirmed' | 'Pending' | 'Cancelled') {
  if (status === 'Confirmed') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Confirmed
      </Badge>
    );
  }
  if (status === 'Cancelled') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200">
      <Clock className="h-3 w-3 mr-1" />
      Pending payment
    </Badge>
  );
}

export default async function GuestBookingPage({ params, searchParams }: BookingPageProps) {
  const { reference } = await params;
  const resolved = await searchParams;
  const email =
    typeof resolved.email === 'string' ? resolved.email : Array.isArray(resolved.email) ? resolved.email[0] : '';

  if (!email) {
    redirect(`/bookings?missing=1`);
  }

  const booking = await findBookingForGuest({ reference, email });

  if (!booking) {
    redirect(`/bookings?notfound=1`);
  }

  const items = booking.bookingItems ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Bookings', href: '/bookings' }, { label: 'Your booking' }]} />

      <Link
        href="/bookings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Look up a different booking
      </Link>

      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">{statusBadge(booking.status)}</div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold">
            Hi {booking.customerName.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s the booking we have on file for{' '}
            <span className="font-medium text-foreground">{booking.customerEmail}</span>.
          </p>
        </div>
        {booking.status === 'Pending' && booking.paymentMethod === 'online' && (
          <Button asChild size="lg">
            <Link href="/contact">Need help paying?</Link>
          </Button>
        )}
      </div>

      {/* Overview card */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="Booked on"
              value={
                booking.bookingDate
                  ? format(new Date(booking.bookingDate), 'PPP')
                  : '—'
              }
            />
            <Field
              icon={<Users className="h-4 w-4 text-primary" />}
              label="Payment"
              value={
                booking.paymentMethod === 'online'
                  ? 'Online card'
                  : booking.paymentMethod === 'cash'
                    ? 'Cash on arrival'
                    : '—'
              }
            />
            <Field
              icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
              label="Total paid / due"
              value={booking.totalPrice ? `$${booking.totalPrice.toFixed(2)}` : '—'}
            />
          </div>
          <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p>
              <span className="font-mono font-semibold text-foreground">{booking.id}</span> — keep this
              reference handy when contacting support.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <div className="space-y-3">
        <h2 className="font-headline text-xl font-semibold">What you booked</h2>
        {items.length === 0 ? (
          <Card className="rounded-2xl border bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No line items recorded for this booking. Contact support if this looks wrong.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <Card key={item.id ?? idx} className="rounded-2xl border bg-card">
                <CardContent className="p-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-semibold">
                      {item.tours?.name ?? item.upsellItems?.name ?? 'Item'}
                    </p>
                    {item.packageName && (
                      <p className="text-xs text-muted-foreground">{item.packageName}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {item.itemDate && <span>📅 {format(new Date(item.itemDate), 'PPP')}</span>}
                      {typeof item.adults === 'number' && item.adults > 0 && (
                        <span>👤 {item.adults} adult{item.adults === 1 ? '' : 's'}</span>
                      )}
                      {typeof item.children === 'number' && item.children > 0 && (
                        <span>👶 {item.children} children</span>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-primary shrink-0">
                    ${item.price != null ? item.price.toFixed(2) : '—'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Help */}
      <Card className="rounded-2xl border bg-muted/30">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Have questions about this booking? Our team is here 24/7.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
