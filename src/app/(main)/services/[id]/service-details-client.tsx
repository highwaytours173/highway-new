'use client';

import * as React from 'react';
import type { UpsellItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@/hooks/use-currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, PlusCircle, ShoppingBag } from 'lucide-react';

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ServiceDetailsClient({ service }: { service: UpsellItem }) {
  const { addToCart, cartItems } = useCart();
  const { format } = useCurrency();
  const variants = React.useMemo(() => service.variants ?? [], [service.variants]);
  const [selectedVariantKey, setSelectedVariantKey] = React.useState<string | undefined>(() => {
    const first = (service.variants ?? [])[0];
    return first ? (first.id ?? first.name) : undefined;
  });

  const selectedVariant = React.useMemo(() => {
    if (!selectedVariantKey) return undefined;
    return variants.find((v) => (v.id ?? v.name) === selectedVariantKey) ?? variants[0];
  }, [selectedVariantKey, variants]);

  const displayPrice = selectedVariant?.price ?? service.price ?? 0;
  const isInCart = cartItems.some((c) => {
    if (c.productType !== 'upsell') return false;
    if (c.product.id !== service.id) return false;
    return (c.packageId ?? 'base') === (selectedVariantKey ?? 'base');
  });

  const canAdd = service.isActive && !isInCart;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/services">
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">View cart</Link>
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <div className="relative h-64 w-full overflow-hidden md:h-80">
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 960px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
            <Badge className="bg-background/90 text-foreground hover:bg-background">
              {formatUsd(displayPrice)}
            </Badge>
            {!service.isActive ? (
              <Badge variant="secondary" className="bg-background/90">
                Unavailable
              </Badge>
            ) : null}
          </div>
        </div>

        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{service.name}</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {service.description ||
                'Add this service to make your trip smoother and more comfortable.'}
            </p>
          </div>

          {variants.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose a variant</p>
              <select
                value={selectedVariantKey ?? ''}
                onChange={(e) => setSelectedVariantKey(e.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              >
                {variants.map((v) => (
                  <option key={v.id ?? v.name} value={v.id ?? v.name}>
                    {v.name} • {format(v.price ?? 0)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Total shown updates based on your selection.
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className={cn('w-full')}
              disabled={!canAdd}
              onClick={() =>
                addToCart(
                  service,
                  'upsell',
                  undefined,
                  undefined,
                  undefined,
                  1,
                  selectedVariantKey,
                  selectedVariant?.name
                )
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {isInCart ? 'In cart' : 'Add to cart'}
            </Button>

            {isInCart ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart">Go to cart</Link>
              </Button>
            ) : service.isActive ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/services">Keep browsing</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/contact?service=${encodeURIComponent(service.name)}`}>
                  Request availability
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
