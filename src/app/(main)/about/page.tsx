import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import type { Metadata } from 'next';
import { AboutClient } from './about-client';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('about', {
    title: 'About',
    description: 'Learn more about our team, values, and travel expertise.',
  });
}

export default async function AboutPage() {
  let agencyName = '';
  let aboutUs = '';
  let tagline = '';
  let heroImageUrl =
    'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=2400&q=70';
  let sideImageUrl =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=70';

  try {
    const settings = await getAgencySettings();
    if (settings && settings.data) {
      agencyName = settings.data.agencyName ?? agencyName;
      aboutUs = settings.data.aboutUs ?? aboutUs;
      tagline = settings.data.tagline ?? tagline;
      heroImageUrl = settings.data.images?.aboutHeroUrl || heroImageUrl;
      sideImageUrl = settings.data.images?.aboutSideImageUrl || sideImageUrl;
    }
  } catch {}

  const displayAgencyName =
    typeof agencyName === 'string' && agencyName.trim().length > 0 ? agencyName : 'Travel Agency';

  return (
    <AboutClient
      agencyName={displayAgencyName}
      aboutUs={aboutUs}
      tagline={tagline}
      heroImageUrl={heroImageUrl}
      sideImageUrl={sideImageUrl}
    />
  );
}
