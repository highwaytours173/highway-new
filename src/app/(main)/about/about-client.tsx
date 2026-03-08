'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Headphones, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface AboutClientProps {
  agencyName: string;
  aboutUs: string;
  tagline: string;
  heroImageUrl: string;
  sideImageUrl: string;
}

export function AboutClient({
  agencyName,
  aboutUs,
  tagline,
  heroImageUrl,
  sideImageUrl,
}: AboutClientProps) {
  const { t } = useLanguage();

  const aboutParagraphs = aboutUs
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

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
                {t('about.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t('about.badge')} {agencyName}
              </h1>
              {tagline ? (
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{tagline}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/tours">{t('about.exploreTours')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">{t('about.contactUs')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <Card className="rounded-3xl">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t('about.ourStory')}</p>
              <h2 className="font-headline text-2xl font-semibold tracking-tight md:text-3xl">
                {t('about.storyHeading')}
              </h2>
            </div>
            <div className="prose prose-neutral max-w-none dark:prose-invert">
              {aboutParagraphs.length > 0 ? (
                aboutParagraphs.map((p, idx) => <p key={idx}>{p}</p>)
              ) : (
                <p>{t('about.noContent')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              src={sideImageUrl}
              alt="Traveler looking at a scenic view"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          </div>
          <CardContent className="relative flex h-full flex-col justify-end gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/80">{t('about.whatYouGet')}</p>
              <p className="text-2xl font-semibold tracking-tight text-white">
                {t('about.experience')}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-white/80">{t('about.localExpertise')}</p>
                <p className="text-base font-semibold text-white">{t('about.trustedGuides')}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-white/80">{t('about.flexiblePlans')}</p>
                <p className="text-base font-semibold text-white">{t('about.builtAroundYou')}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-white/80">{t('about.transparentPricing')}</p>
                <p className="text-base font-semibold text-white">{t('about.noSurprises')}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-white/80">{t('about.support')}</p>
                <p className="text-base font-semibold text-white">{t('about.supportHours')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('about.curatedItineraries')}</p>
              <p className="text-sm text-muted-foreground">{t('about.curatedDesc')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('about.reliableLogistics')}</p>
              <p className="text-sm text-muted-foreground">{t('about.logisticsDesc')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">{t('about.humanFirst')}</p>
              <p className="text-sm text-muted-foreground">{t('about.humanFirstDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-3xl lg:col-span-3">
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t('about.howWeWork')}</p>
              <h2 className="font-headline text-2xl font-semibold tracking-tight md:text-3xl">
                {t('about.simpleHeading')}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('about.step1Label')}</p>
                <p className="mt-1 text-base font-semibold">{t('about.step1Label')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('about.step1Desc')}</p>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('about.step2Label')}</p>
                <p className="mt-1 text-base font-semibold">{t('about.step2Label')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('about.step2Desc')}</p>
              </div>
              <div className="rounded-2xl border bg-background/60 p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('about.step3Label')}</p>
                <p className="mt-1 text-base font-semibold">{t('about.step3Label')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('about.step3Desc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl lg:col-span-2">
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">{t('about.easyTrips')}</p>
                <p className="text-sm text-muted-foreground">{t('about.easyTripsDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Headphones className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">{t('about.supportShows')}</p>
                <p className="text-sm text-muted-foreground">{t('about.supportShowsDesc')}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">{t('about.readyToPlan')}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/tours">{t('about.browseToursBtn')}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/contact">{t('about.getQuote')}</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
