'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Download,
  Loader2,
  Ticket,
  XCircle,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getBookingById } from '@/lib/supabase/bookings';
import { useCart } from '@/hooks/use-cart';
import { useLanguage } from '@/hooks/use-language';

type PaymentState = 'checking' | 'confirmed' | 'cancelled' | 'pending' | 'unknown';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { t } = useLanguage();
  const [paymentState, setPaymentState] = useState<PaymentState>('checking');

  const merchantOrderId = useMemo(() => {
    return (
      searchParams.get('merchantOrderId') ||
      searchParams.get('merchantOrderID') ||
      searchParams.get('orderId') ||
      searchParams.get('orderID') ||
      null
    );
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    async function checkBookingStatus() {
      if (!merchantOrderId) {
        setPaymentState('unknown');
        return;
      }

      const booking = await getBookingById(merchantOrderId);
      if (cancelled) return;

      if (!booking) {
        setPaymentState('unknown');
        return;
      }

      if (booking.status === 'Confirmed') {
        setPaymentState('confirmed');
        clearCart();
        window.clearInterval(intervalId);
        return;
      }

      if (booking.status === 'Cancelled') {
        setPaymentState('cancelled');
        window.clearInterval(intervalId);
        return;
      }

      setPaymentState('pending');
    }

    void checkBookingStatus();

    if (merchantOrderId) {
      intervalId = window.setInterval(() => {
        void checkBookingStatus();
      }, 2000);
    }

    return () => {
      cancelled = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [merchantOrderId, clearCart]);

  const heroTitle =
    paymentState === 'confirmed'
      ? t('success.confirmed')
      : paymentState === 'cancelled'
        ? t('success.failed')
        : paymentState === 'pending'
          ? t('success.pending')
          : t('success.complete');

  const heroSubtitle =
    paymentState === 'confirmed'
      ? t('success.confirmedDesc')
      : paymentState === 'cancelled'
        ? t('success.failedDesc')
        : paymentState === 'pending'
          ? t('success.pendingDesc')
          : t('success.completeDesc');

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 py-10">
      <section className="relative overflow-hidden rounded-3xl border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                {t('success.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {heroTitle}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{heroSubtitle}</p>
            </div>
            <div className="grid w-full gap-3 sm:max-w-md sm:grid-cols-2">
              <Button asChild size="lg">
                <Link href="/tours">
                  {t('success.browseTours')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/destination">{t('success.exploreDestinations')}</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">{t('success.step1')}</p>
              <p className="text-sm text-muted-foreground">{t('success.stateCart')}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">{t('success.step2')}</p>
              <p className="text-sm text-muted-foreground">{t('success.stateCheckout')}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">{t('success.step3')}</p>
              <p className="text-sm text-muted-foreground">{t('success.stateConfirmation')}</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden rounded-3xl border bg-card">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {paymentState === 'confirmed' ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            ) : paymentState === 'cancelled' ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            <div className="space-y-0.5">
              <CardTitle className="text-2xl">
                {paymentState === 'confirmed'
                  ? t('success.paymentConfirmed')
                  : paymentState === 'cancelled'
                    ? t('success.paymentNotCompleted')
                    : t('success.processingPayment')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {merchantOrderId
                  ? `Booking ID: ${merchantOrderId}`
                  : 'Return to the cart if needed.'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
                <Ticket className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('success.bookingDetails')}</p>
                <p className="text-sm text-muted-foreground">{t('success.bookingDetailsSub')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
                <Compass className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('success.nextIdeas')}</p>
                <p className="text-sm text-muted-foreground">{t('success.nextIdeasSub')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('success.needHelp')}</p>
                <p className="text-sm text-muted-foreground">{t('success.needHelpSub')}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 sm:flex-row sm:justify-between">
          {paymentState === 'cancelled' ? (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/cart">{t('success.backToCart')}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/contact">{t('success.contactSupport')}</Link>
            </Button>
          )}

          {paymentState === 'confirmed' && merchantOrderId && (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={`/api/bookings/${merchantOrderId}/voucher`} download>
                <Download className="mr-2 h-4 w-4" />
                {t('success.downloadVoucher')}
              </a>
            </Button>
          )}

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              {t('success.continueExploring')} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
