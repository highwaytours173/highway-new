'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={disabled || pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>({
    name: false,
    email: false,
    message: false,
  });

  const errors: FieldErrors = {
    name: !name.trim() ? 'Please enter your name.' : undefined,
    email: !email.trim()
      ? 'Please enter your email.'
      : !EMAIL_REGEX.test(email.trim())
        ? 'Enter a valid email address.'
        : undefined,
    message:
      !message.trim()
        ? 'Please write a short message.'
        : message.trim().length < 10
          ? 'Add a bit more detail (10+ characters).'
          : undefined,
  };

  const hasErrors = Boolean(errors.name || errors.email || errors.message);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (hasErrors) {
      e.preventDefault();
      setTouched({ name: true, email: true, message: true });
      return;
    }
  };

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
                <div
                  className="flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-900"
                  role="status"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <span>{t('contact.successMsg')}</span>
                </div>
              )}
              {sentError && (
                <div
                  className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-900"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span>{t('contact.errorMsg')}</span>
                </div>
              )}

              <form action={submitAction} onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact-name">
                      {t('contact.nameLabel')}
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder={t('contact.namePlaceholder')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      aria-invalid={touched.name && Boolean(errors.name)}
                      aria-describedby={touched.name && errors.name ? 'contact-name-err' : undefined}
                      className={cn(
                        touched.name && errors.name && 'border-red-400 focus-visible:ring-red-400'
                      )}
                      required
                    />
                    {touched.name && errors.name && (
                      <p
                        id="contact-name-err"
                        className="flex items-center gap-1.5 text-xs text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="contact-email">
                      {t('contact.emailLabel')}
                    </label>
                    <div className="relative">
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        aria-invalid={touched.email && Boolean(errors.email)}
                        aria-describedby={
                          touched.email && errors.email ? 'contact-email-err' : undefined
                        }
                        className={cn(
                          'pr-9',
                          touched.email && errors.email
                            ? 'border-red-400 focus-visible:ring-red-400'
                            : touched.email && !errors.email && 'border-green-400'
                        )}
                        required
                      />
                      {touched.email && !errors.email && email.length > 0 && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {touched.email && errors.email && (
                      <p
                        id="contact-email-err"
                        className="flex items-center gap-1.5 text-xs text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.email}
                      </p>
                    )}
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
                  <div className="flex items-baseline justify-between gap-2">
                    <label className="text-sm font-medium" htmlFor="contact-message">
                      {t('contact.messageLabel')}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {message.length}/1000
                    </span>
                  </div>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder={t('contact.messagePlaceholder')}
                    rows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                    aria-invalid={touched.message && Boolean(errors.message)}
                    aria-describedby={
                      touched.message && errors.message ? 'contact-message-err' : undefined
                    }
                    className={cn(
                      touched.message && errors.message && 'border-red-400 focus-visible:ring-red-400'
                    )}
                    required
                  />
                  {touched.message && errors.message && (
                    <p
                      id="contact-message-err"
                      className="flex items-center gap-1.5 text-xs text-red-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">{t('contact.consent')}</p>
                  <SubmitButton disabled={hasErrors} label={t('contact.sendBtn')} />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
