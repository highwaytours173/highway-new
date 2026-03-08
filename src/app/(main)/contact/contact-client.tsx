'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface ContactClientProps {
  sent: boolean;
  sentError: boolean;
  agencyName: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  heroImageUrl: string;
  cardImageUrl: string;
  submitAction: (formData: FormData) => Promise<void>;
}

export function ContactClient({
  sent,
  sentError,
  agencyName,
  contactEmail,
  phoneNumber,
  address,
  heroImageUrl,
  cardImageUrl,
  submitAction,
}: ContactClientProps) {
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
                {t('contact.badge')}
              </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t('contact.badge')} {agencyName}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                {t('contact.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/tours">{t('contact.exploreTours')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/services">{t('contact.viewServices')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card className="rounded-3xl">
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('contact.details')}</p>
                <p className="text-xl font-semibold tracking-tight">{t('contact.quickWays')}</p>
              </div>
              <div className="space-y-3">
                {contactEmail ? (
                  <div className="flex items-start gap-3 rounded-2xl border bg-background/60 p-4">
                    <Mail className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('contact.email')}</p>
                      <a
                        className="text-sm text-muted-foreground hover:text-primary"
                        href={`mailto:${contactEmail}`}
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                ) : null}
                {phoneNumber ? (
                  <div className="flex items-start gap-3 rounded-2xl border bg-background/60 p-4">
                    <Phone className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('contact.phone')}</p>
                      <a
                        className="text-sm text-muted-foreground hover:text-primary"
                        href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                      >
                        {phoneNumber}
                      </a>
                    </div>
                  </div>
                ) : null}
                {address ? (
                  <div className="flex items-start gap-3 rounded-2xl border bg-background/60 p-4">
                    <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('contact.address')}</p>
                      <p className="text-sm text-muted-foreground">{address}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start gap-3 rounded-2xl border bg-background/60 p-4">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t('contact.hours')}</p>
                    <p className="text-sm text-muted-foreground">{t('contact.hoursValue')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl">
            <div className="relative h-56 w-full">
              <Image
                src={cardImageUrl}
                alt="Travel planning"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-sm font-medium text-white/80">{t('contact.responseTime')}</p>
                <p className="text-lg font-semibold text-white">{t('contact.responseValue')}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="rounded-3xl">
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('contact.sendMessage')}
                </p>
                <p className="text-2xl font-semibold tracking-tight">{t('contact.howHelp')}</p>
                <p className="text-sm text-muted-foreground">{t('contact.formHint')}</p>
              </div>

              {sent && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-900">
                  {t('contact.successMsg')}
                </div>
              )}
              {sentError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
                  {t('contact.errorMsg')}
                </div>
              )}

              <form action={submitAction} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact-name">
                      {t('contact.nameLabel')}
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder={t('contact.namePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact-email">
                      {t('contact.emailLabel')}
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact-phone">
                      {t('contact.phoneLabel')}
                    </label>
                    <Input id="contact-phone" name="phone" placeholder="+20..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact-subject">
                      {t('contact.subjectLabel')}
                    </label>
                    <Input
                      id="contact-subject"
                      name="subject"
                      placeholder={t('contact.subjectPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="contact-message">
                    {t('contact.messageLabel')}
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder={t('contact.messagePlaceholder')}
                    rows={7}
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">{t('contact.consent')}</p>
                  <Button type="submit" className="w-full sm:w-auto">
                    {t('contact.sendBtn')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
