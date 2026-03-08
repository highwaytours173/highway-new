import { redirect } from 'next/navigation';
import { createContactMessage } from '@/lib/supabase/contact-messages';
import type { Metadata } from 'next';
import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import { ContactClient } from './contact-client';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('contact', {
    title: 'Contact',
    description: 'Get in touch with us to plan your next trip.',
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const sent = resolved.sent === '1';
  const sentError = resolved.sent === '0';

  let agencyName = '';
  let phoneNumber = '';
  let contactEmail = '';
  let address = '';
  let heroImageUrl =
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=70';
  let cardImageUrl =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=70';

  try {
    const settings = await getAgencySettings();
    if (settings && settings.data) {
      agencyName = settings.data.agencyName ?? agencyName;
      phoneNumber = settings.data.phoneNumber ?? phoneNumber;
      contactEmail = settings.data.contactEmail ?? contactEmail;
      address = settings.data.address ?? address;
      heroImageUrl = settings.data.images?.contactHeroUrl || heroImageUrl;
      cardImageUrl = settings.data.images?.contactCardImageUrl || cardImageUrl;
    }
  } catch {}

  const displayAgencyName =
    typeof agencyName === 'string' && agencyName.trim().length > 0 ? agencyName : 'Travel Agency';

  async function submit(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      redirect('/contact?sent=0');
    }

    await createContactMessage({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    });

    redirect('/contact?sent=1');
  }

  return (
    <ContactClient
      sent={sent}
      sentError={sentError}
      agencyName={displayAgencyName}
      contactEmail={contactEmail}
      phoneNumber={phoneNumber}
      address={address}
      heroImageUrl={heroImageUrl}
      cardImageUrl={cardImageUrl}
      submitAction={submit}
    />
  );
}
