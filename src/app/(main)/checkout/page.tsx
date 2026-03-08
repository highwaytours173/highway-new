'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { useLanguage } from '@/hooks/use-language';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createBooking } from '@/lib/supabase/bookings';
import { buildKashierHppUrl } from '@/lib/kashier';
import { format } from 'date-fns';
import { type Tour, type UpsellItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, Zap, RefreshCw, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getAgencySettings } from '@/lib/supabase/agency-content';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number is required.')
    .regex(/^\+?[0-9\s\-()]*$/, 'Invalid phone number format.'),
  nationality: z.string().min(2, 'Nationality is required.'),
  paymentMethod: z.enum(['cash', 'online']),
});

type PaymentMethod = z.infer<typeof formSchema>['paymentMethod'];

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getDiscountAmount, getFinalTotal, promoCode } = useCart();
  const { format: formatPrice } = useCurrency();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [paymentConfig, setPaymentConfig] = useState<{
    cash: boolean;
    online: boolean;
    defaultMethod: PaymentMethod;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      nationality: '',
      paymentMethod: 'online',
    },
  });

  const paymentMethodsEnabled = useMemo(() => {
    let cash = paymentConfig?.cash ?? true;
    let online = paymentConfig?.online ?? true;
    const defaultMethod = paymentConfig?.defaultMethod ?? 'online';

    if (!cash && !online) {
      cash = true;
      online = true;
    }

    const fallbackDefault: PaymentMethod =
      defaultMethod === 'cash' ? (cash ? 'cash' : 'online') : online ? 'online' : 'cash';

    return {
      cash,
      online,
      defaultMethod: fallbackDefault,
    };
  }, [paymentConfig]);

  useEffect(() => {
    let cancelled = false;

    async function loadPaymentMethods() {
      try {
        const settings = await getAgencySettings();

        if (cancelled) return;

        const paymentMethods = settings?.data?.paymentMethods;
        const cash = paymentMethods?.cash ?? true;
        const online = paymentMethods?.online ?? true;
        const defaultMethod: PaymentMethod =
          paymentMethods?.defaultMethod === 'cash' || paymentMethods?.defaultMethod === 'online'
            ? paymentMethods.defaultMethod
            : 'online';

        const normalizedCash = cash || (!cash && !online);
        const normalizedOnline = online || (!cash && !online);

        const nextDefault: PaymentMethod =
          defaultMethod === 'cash'
            ? normalizedCash
              ? 'cash'
              : 'online'
            : normalizedOnline
              ? 'online'
              : 'cash';

        setPaymentConfig({
          cash: normalizedCash,
          online: normalizedOnline,
          defaultMethod: nextDefault,
        });

        form.setValue('paymentMethod', nextDefault, { shouldValidate: true });
      } catch {
        if (cancelled) return;
      }
    }

    void loadPaymentMethods();

    return () => {
      cancelled = true;
    };
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add items to your cart before placing an order.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const bookingId = await createBooking({
        customerName: values.name,
        customerEmail: values.email,
        phoneNumber: values.phoneNumber,
        nationality: values.nationality,
        cartItems: cartItems,
        paymentMethod: values.paymentMethod,
        promoCode: promoCode?.code,
      });

      if (values.paymentMethod === 'cash') {
        toast({
          title: 'Booking Confirmed',
          description: 'Your booking has been placed successfully.',
        });
        window.location.href = `/checkout/success?merchantOrderId=${encodeURIComponent(bookingId)}`;
        return;
      }

      toast({
        title: 'Redirecting to Payment',
        description: 'Complete your payment to confirm the booking.',
      });

      const paymentUrl = await buildKashierHppUrl({
        merchantOrderId: bookingId,
        amount: getFinalTotal(),
        customer: {
          name: values.name,
          email: values.email,
          mobile: values.phoneNumber,
        },
      });

      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'There was an error placing your order. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl py-10">
        <Card className="overflow-hidden rounded-3xl border bg-card">
          <CardContent className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                {t('checkout.badge')}
              </Badge>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">{t('checkout.emptyCart')}</h1>
                <p className="text-muted-foreground">{t('checkout.emptyDesc')}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/tours">{t('checkout.exploreTours')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/cart">{t('checkout.backToCart')}</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{t('checkout.secureBooking')}</p>
                  <p className="text-sm text-muted-foreground">{t('checkout.secureBookingDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCheckoutItemKey = (item: (typeof cartItems)[number]) =>
    `${item.productType}-${item.product.id}-${item.packageId ?? 'base'}`;

  const getItemSummary = (item: (typeof cartItems)[number]) => {
    let itemTotal = 0;
    let productDescription = '';
    let productImage = '';

    if (item.productType === 'tour') {
      const tour = item.product as Tour;
      productImage = tour.images?.[0] || '/placeholder.png';
      productDescription = `${item.adults ?? 0} Adults, ${item.children ?? 0} Children`;
      if (item.packageName) productDescription += ` • ${item.packageName}`;
      if (item.date) productDescription += ` • ${format(new Date(item.date), 'PPP')}`;

      const totalPeople = (item.adults ?? 0) + (item.children ?? 0);
      let priceTiers = tour.priceTiers || [];
      if (item.packageId && tour.packages) {
        const selectedPackage = tour.packages.find((p) => p.id === item.packageId);
        if (selectedPackage) priceTiers = selectedPackage.priceTiers;
      }
      const priceTier =
        priceTiers.find(
          (tier) =>
            totalPeople >= tier.minPeople &&
            (tier.maxPeople === null || totalPeople <= tier.maxPeople)
        ) || priceTiers[priceTiers.length - 1];
      if (priceTier) {
        itemTotal =
          (item.adults ?? 0) * priceTier.pricePerAdult +
          (item.children ?? 0) * priceTier.pricePerChild;
      }
    } else if (item.productType === 'upsell') {
      const upsellItem = item.product as UpsellItem;
      productImage = upsellItem.imageUrl || '/placeholder-upsell.png';
      productDescription = upsellItem.description || 'Additional Service';
      const variant =
        item.packageId && upsellItem.variants
          ? upsellItem.variants.find((v) => v.id === item.packageId)
          : undefined;
      const price = variant?.price ?? upsellItem.price;
      itemTotal = price * (item.quantity ?? 1);
    }

    return {
      itemTotal,
      productName: item.product.name,
      productDescription,
      productImage,
    };
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                {t('checkout.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t('checkout.title')}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                {t('checkout.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="outline">
                <Link href="/cart">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('checkout.backToCart')}
                </Link>
              </Button>
              <div className="flex items-center gap-2 rounded-2xl border bg-background/70 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('checkout.secureCheckout')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">{t('checkout.step1')}</p>
              <p className="text-sm text-muted-foreground">{t('checkout.stateCart')}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">{t('checkout.step2')}</p>
              <p className="text-sm text-muted-foreground">{t('checkout.stateCheckout')}</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">{t('checkout.step3')}</p>
              <p className="text-sm text-muted-foreground">{t('checkout.stateConfirmation')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden rounded-3xl border bg-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                <CardHeader>
                  <CardTitle>{t('checkout.customerInfo')}</CardTitle>
                  <CardDescription>{t('checkout.customerInfoDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>{t('checkout.fullName')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>{t('checkout.emailAddress')}</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>{t('checkout.phoneNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>{t('checkout.nationality')}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., American, Egyptian" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 space-y-3">
                        <FormLabel>{t('checkout.paymentMethod')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid gap-3 sm:grid-cols-2"
                          >
                            {paymentMethodsEnabled.cash ? (
                              <label
                                htmlFor="payment-cash"
                                className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4"
                              >
                                <RadioGroupItem value="cash" id="payment-cash" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {t('checkout.cashLabel')}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {t('checkout.cashDesc')}
                                  </p>
                                </div>
                              </label>
                            ) : null}
                            {paymentMethodsEnabled.online ? (
                              <label
                                htmlFor="payment-online"
                                className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4"
                              >
                                <RadioGroupItem value="online" id="payment-online" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {t('checkout.onlineLabel')}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {t('checkout.onlineDesc')}
                                  </p>
                                </div>
                              </label>
                            ) : null}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t bg-muted/20">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('checkout.placeOrder')}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {t('checkout.agreement')}
                  </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card className="overflow-hidden rounded-3xl border bg-card">
            <CardHeader>
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
              <CardDescription>
                {cartItems.length} item{cartItems.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const summary = getItemSummary(item);
                  return (
                    <div
                      key={getCheckoutItemKey(item)}
                      className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border">
                          <Image
                            src={summary.productImage}
                            alt={summary.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold leading-snug">{summary.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {summary.productDescription}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">{formatPrice(summary.itemTotal)}</p>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('checkout.subtotal')}</span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                {promoCode ? (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {t('checkout.discount')} ({promoCode.code})
                    </span>
                    <span>-{formatPrice(getDiscountAmount())}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('checkout.taxesFees')}</span>
                  <span className="text-muted-foreground">{t('checkout.taxesCalc')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4 text-lg font-bold">
              <span>{t('checkout.total')}</span>
              <span>{formatPrice(getFinalTotal())}</span>
            </CardFooter>
          </Card>

          {/* Trust badges */}
          <div className="rounded-3xl border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('checkout.whyBookWith')}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('checkout.securePayment')}</p>
                  <p className="text-xs text-muted-foreground">{t('checkout.securePaymentDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('checkout.verifiedAgency')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('checkout.verifiedAgencyDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                  <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('checkout.instantConfirm')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('checkout.instantConfirmDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('checkout.flexibleBooking')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('checkout.flexibleBookingDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
