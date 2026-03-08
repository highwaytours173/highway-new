import React from 'react';
import { TailorMadePageContent } from './tailor-made-content';
import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/supabase/agency-content';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('tailorMade', {
    title: 'Tailor Made',
    description: 'Build a custom itinerary based on your dates, preferences, and budget.',
  });
}

export default function TailorMadePage() {
  return <TailorMadePageContent />;
}
