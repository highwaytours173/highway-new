'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

type DestinationCard = {
  name: string;
  count: number;
  imageUrl?: string;
};

interface DestinationClientProps {
  cards: DestinationCard[];
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  destinationDescriptions: Record<string, string>;
}

function buildToursUrl(destination: string) {
  const params = new URLSearchParams({ destination });
  return `/tours?${params.toString()}`;
}

export function DestinationClient({
  cards,
  heroImageUrl,
  heroTitle,
  heroSubtitle,
  destinationDescriptions,
}: DestinationClientProps) {
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
                {t('destination.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {heroTitle}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{heroSubtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/tours">{t('destination.exploreTours')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tailor-made">{t('destination.tailorTrip')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.length > 0 ? (
          cards.map((d) => {
            const href = buildToursUrl(d.name);
            return (
              <Card
                key={d.name}
                className="group overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  {d.imageUrl ? (
                    <Image
                      src={d.imageUrl}
                      alt={d.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      data-ai-hint={`${d.name} egypt`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <MapPin className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <Badge className="bg-background/90 text-foreground hover:bg-background">
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      {d.name}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/80 text-gray-800 hover:bg-white">
                      {d.count} {d.count === 1 ? t('destination.tour') : t('destination.tours')}
                    </Badge>
                  </div>
                </div>

                <CardContent className="flex items-center justify-between gap-4 p-6">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold leading-snug">{d.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {destinationDescriptions[d.name] ?? `${t('destination.browseIn')} ${d.name}.`}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="shrink-0">
                    <Link href={href}>
                      {t('destination.explore')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="rounded-3xl border bg-card">
            <CardContent className="p-10 text-center">
              <p className="text-lg font-semibold">{t('destination.noDestinations')}</p>
              <p className="mt-2 text-muted-foreground">{t('destination.noDestinationsDesc')}</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
