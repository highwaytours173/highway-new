import type { Metadata } from 'next';
import { LegalMarkdownPage } from '@/components/legal-markdown-page';
import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('privacy', {
    title: 'Policy and Security',
    description: 'Learn how we protect your privacy, payment data, and account security.',
  });
}

function buildFallbackPolicyMarkdown(agencyName: string): string {
  return `# Policy and Security

At ${agencyName}, protecting your data and payment information is a core responsibility.

## 1. Data We Collect
We collect information needed to deliver your booking experience, including contact details, itinerary preferences, and transaction records.

## 2. Why We Process Data
Your data is used to confirm bookings, coordinate with suppliers, provide support, and improve service quality.

## 3. Security Controls
We use secure connections, access controls, and trusted platforms to reduce unauthorized access risks.

## 4. Payment Protection
Online payments are processed through approved payment gateways. We do not store full card details on our platform.

## 5. Sharing with Partners
Data is shared only with essential service providers (such as hotels or transport operators) required to fulfill your booking.

## 6. Retention and Deletion
We retain data only as long as needed for operations, legal obligations, and dispute resolution.

## 7. Your Rights
You can request access, correction, or deletion of your personal data where applicable by contacting us.

## 8. Security Incident Response
If a significant security incident occurs, we will investigate promptly and notify affected parties when required by law.

## 9. Contact
Questions about this policy can be submitted through our [contact page](/contact).
`;
}

export default async function PolicySecurityPage() {
  let agencyName = 'Our Agency';
  let policyMarkdown = '';

  try {
    const settings = await getAgencySettings();
    agencyName = settings?.data?.agencyName?.trim() || agencyName;
    policyMarkdown = settings?.data?.legalPages?.policySecurityMarkdown?.trim() || '';
  } catch {
    // Use fallback content.
  }

  const content = policyMarkdown || buildFallbackPolicyMarkdown(agencyName);

  return (
    <LegalMarkdownPage
      title="Policy and Security"
      subtitle="Understand how we collect, process, and protect your personal data and payment information."
      markdown={content}
    />
  );
}
