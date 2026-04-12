'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useSettings } from '@/components/providers/settings-provider';

type SettingsData = {
  agencyName?: string;
  phoneNumber?: string;
  contactEmail?: string;
  address?: string;
  aboutUs?: string;
  tagline?: string;
  navLinks?: { label: string; href: string }[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
};

function normalizeNavHref(href: string | undefined | null) {
  const raw = String(href || '').trim();
  if (!raw) return '/';

  const lower = raw.toLowerCase();
  const withoutTrailingSlash = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;

  if (lower === '/#about' || lower === '#about' || lower === 'about') return '/about';
  if (lower === '/#services' || lower === '#services' || lower === 'services') return '/services';
  if (lower === '/#contact' || lower === '#contact' || lower === 'contact') return '/contact';
  if (lower === '/#tours' || lower === '#tours' || lower === 'tours') return '/tours';

  if (withoutTrailingSlash.startsWith('#')) return `/${withoutTrailingSlash}`;
  return withoutTrailingSlash;
}

function NewsletterForm({ t }: { t: (key: string) => string }) {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to actual newsletter service
    setSubscribed(true);
    setEmail('');
  };

  if (subscribed) {
    return <p className="text-sm text-green-400">✓ Thanks! We&apos;ll be in touch.</p>;
  }

  return (
    <form className="space-y-3" onSubmit={handleSubscribe}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('footer.emailPlaceholder')}
        className="bg-white text-gray-900 border-0 rounded-lg"
        required
      />
      <Button type="submit" className="w-full rounded-lg">
        {t('footer.subscribeBtn')} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const settings = useSettings();

  const agencyName = settings?.data?.agencyName || 'Travel Agency';
  const tagline = settings?.data?.tagline || '';
  const contactEmail = settings?.data?.contactEmail || '';
  const phoneNumber = settings?.data?.phoneNumber || '';
  const address = settings?.data?.address || '';

  return (
    <footer className="bg-[#181E29] text-gray-300">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Logo, Newsletter, Socials */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Logo logoUrl={settings?.logo_url ?? undefined} alt={agencyName} />
              <div>
                <span className="font-headline text-2xl font-bold text-white">{agencyName}</span>
                {tagline ? <p className="text-xs text-gray-400">{tagline}</p> : null}
              </div>
            </Link>
            <h3 className="font-headline font-semibold text-white">
              {t('footer.subscribeNewsletter')}
            </h3>
            <p className="text-sm">{t('footer.subscribeDesc')}</p>
            <NewsletterForm t={t} />
            <div className="flex space-x-3 pt-2">
              {settings?.data?.socialMedia?.facebook ? (
                <a
                  href={settings.data.socialMedia.facebook}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              ) : null}
              {settings?.data?.socialMedia?.twitter ? (
                <a
                  href={settings.data.socialMedia.twitter}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              ) : null}
              {settings?.data?.socialMedia?.linkedin ? (
                <a
                  href={settings.data.socialMedia.linkedin}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              ) : null}
              {settings?.data?.socialMedia?.instagram ? (
                <a
                  href={settings.data.socialMedia.instagram}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-primary hover:bg-primary hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Column 2: Quick Links (from settings if available) */}
          <div>
            <h3 className="font-headline font-semibold text-white mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-10 after:h-0.5 after:bg-primary">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {settings?.data?.navLinks && settings.data.navLinks.length > 0 ? (
                settings.data.navLinks.slice(0, 6).map((l) => (
                  <li key={`${l.label}-${l.href}`}>
                    <Link
                      href={normalizeNavHref(l.href)}
                      className="hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/" className="hover:text-primary transition-colors">
                      {t('nav.home')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-primary transition-colors">
                      {t('nav.about')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-primary transition-colors">
                      {t('nav.blog')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="hover:text-primary transition-colors">
                      {t('nav.services')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/tours" className="hover:text-primary transition-colors">
                      {t('nav.tours')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-headline font-semibold text-white mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-10 after:h-0.5 after:bg-primary">
              {t('footer.services')}
            </h3>
            <p className="text-sm text-gray-400 mb-4">{t('footer.exploreServices')}</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 hover:text-primary transition-colors"
            >
              {t('footer.viewServices')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="font-headline font-semibold text-white mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-10 after:h-0.5 after:bg-primary">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-4">
              {address ? (
                <li className="flex items-start gap-3">
                  <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-md bg-primary text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span>{address}</span>
                </li>
              ) : null}
              {contactEmail ? (
                <li className="flex items-start gap-3">
                  <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-md bg-primary text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span>{contactEmail}</span>
                </li>
              ) : null}
              {phoneNumber ? (
                <li className="flex items-start gap-3">
                  <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-md bg-primary text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <a href={`tel:${phoneNumber}`} className="hover:text-primary transition-colors">
                    {phoneNumber}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {agencyName}. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-primary">
              {t('footer.terms')}
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              {t('footer.privacy')}
            </Link>
            <Link href="/environmental" className="hover:text-primary">
              {t('footer.environmental')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
