import type { Metadata } from 'next';
import { LegalMarkdownPage } from '@/components/legal-markdown-page';
import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('terms', {
    title: 'Terms and Condition',
    description: 'Review the terms and conditions for using our services.',
  });
}

function buildFallbackTermsMarkdown(agencyName: string): string {
  return `# Terms and Condition

Welcome to ${agencyName}. By accessing or booking through our website, you agree to these terms.

## 1. Scope of Service
${agencyName} provides travel planning, booking facilitation, and customer support for tours, hotels, and related services.

## 2. Bookings and Confirmation
A booking is confirmed only after you receive written confirmation and complete the required payment.

## 3. Pricing and Payment
Quoted prices may change before confirmation due to supplier updates, taxes, or currency fluctuations.

## 4. Changes and Cancellations
Cancellation terms depend on each service provider. Refund timelines and fees are based on the selected booking policy.

## 5. Traveler Responsibilities
You are responsible for valid travel documents, visas, insurance, and compliance with local regulations.

## 6. Third-Party Providers
Some services are delivered by third-party providers. ${agencyName} is not liable for disruptions caused by those providers beyond our control.

## 7. Liability Limits
To the fullest extent permitted by law, ${agencyName} is not liable for indirect or consequential losses related to your travel experience.

## 8. Contact and Support
For any legal or booking-related question, contact us through our [contact page](/contact).
`;
}

export default async function TermsAndConditionPage() {
  let agencyName = 'Our Agency';
  let termsMarkdown = '';

  try {
    const settings = await getAgencySettings();
    agencyName = settings?.data?.agencyName?.trim() || agencyName;
    termsMarkdown = settings?.data?.legalPages?.termsAndConditionMarkdown?.trim() || '';
  } catch {
    // Use fallback content.
  }

  const content = termsMarkdown || buildFallbackTermsMarkdown(agencyName);

  return (
    <LegalMarkdownPage
      title="Terms and Condition"
      subtitle="Review the terms that govern bookings, payments, cancellations, and use of our travel services."
      markdown={content}
    />
  );
}
