'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Luggage, PhoneCall } from 'lucide-react';
import { ServicesClient } from '../services/services-client';
import { useLanguage } from '@/hooks/use-language';
import type { UpsellItem } from '@/types';

interface UpsellPageClientProps {
  items: UpsellItem[];
  heroImageUrl: string;
}

export function UpsellPageClient({ items, heroImageUrl }: UpsellPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-card">
        <div className="absolute inset-0">
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover opacity-25"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                {t('upsell.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t('upsell.title')}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                {t('upsell.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/cart">{t('upsell.viewCart')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tours">{t('upsell.browseTours')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Luggage className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('upsell.airportTransfer')}</p>
              <p className="text-sm text-muted-foreground">{t('upsell.airportTransferDesc')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('upsell.simCards')}</p>
              <p className="text-sm text-muted-foreground">{t('upsell.simCardsDesc')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Car className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('upsell.privateCar')}</p>
              <p className="text-sm text-muted-foreground">{t('upsell.privateCarDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {items.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">{t('upsell.noExtras')}</p>
            <p className="text-sm text-muted-foreground">{t('upsell.noExtrasDesc')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/contact?service=SIM%20Card">{t('upsell.requestSim')}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/contact?service=Airport%20Transfer">
                  {t('upsell.requestTransfer')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/contact?service=Private%20Driver">{t('upsell.requestDriver')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ServicesClient
          services={items}
          showTypeFilter
          badgeLabel={t('upsell.badge')}
          title={t('upsell.pickWhat')}
          description={t('upsell.filterDesc')}
          searchPlaceholder={t('upsell.searchPlaceholder')}
        />
      )}
    </div>
  );
}
