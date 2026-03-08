'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Luggage, PhoneCall } from 'lucide-react';
import { ServicesClient } from './services-client';
import { useLanguage } from '@/hooks/use-language';
import type { UpsellItem } from '@/types';

interface ServicesPageClientProps {
  services: UpsellItem[];
  heroImageUrl: string;
}

export function ServicesPageClient({ services, heroImageUrl }: ServicesPageClientProps) {
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
                {t('services.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t('services.title')}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                {t('services.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/cart">{t('services.viewCart')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tours">{t('services.browseTours')}</Link>
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
              <p className="text-base font-semibold">{t('services.airportPickup')}</p>
              <p className="text-sm text-muted-foreground">{t('services.airportPickupDesc')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('services.stayConnected')}</p>
              <p className="text-sm text-muted-foreground">{t('services.stayConnectedDesc')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Car className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('services.privateTransport')}</p>
              <p className="text-sm text-muted-foreground">{t('services.privateTransportDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {services.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">{t('services.noServices')}</p>
            <p className="text-sm text-muted-foreground">{t('services.noServicesDesc')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/tours">{t('services.browseTours')}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/contact">{t('services.requestService')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ServicesClient services={services} />
      )}
    </div>
  );
}
