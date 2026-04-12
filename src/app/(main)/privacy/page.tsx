import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('privacy', {
    title: 'Privacy Policy',
    description: 'Learn how we collect, use, and protect your personal information.',
  });
}

export default async function PrivacyPage() {
  let agencyName = 'Our Agency';

  try {
    const settings = await getAgencySettings();
    if (settings?.agency_name) agencyName = settings.agency_name;
  } catch {
    // use defaults
  }

  return (
    <main className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <h1 className="text-3xl font-headline font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
          <p>{agencyName} collects personal information that you provide when making a booking, contacting us, or subscribing to our newsletter. This may include your name, email address, phone number, payment details, and travel preferences.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
          <p>We use your information to process bookings, communicate about your travel plans, improve our services, and send promotional offers (only with your consent). We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">3. Data Sharing</h2>
          <p>We may share your information with trusted service providers (hotels, airlines, tour operators) solely to fulfil your bookings. We also use secure payment processors to handle transactions.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">4. Cookies</h2>
          <p>Our website uses cookies to enhance your browsing experience and analyse site traffic. You can manage cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Security</h2>
          <p>{agencyName} employs industry-standard security measures to protect your personal information, including encrypted connections (TLS/SSL) and secure data storage.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us via our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. Changes to This Policy</h2>
          <p>{agencyName} may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on our website.</p>
        </section>
      </div>
    </main>
  );
}
