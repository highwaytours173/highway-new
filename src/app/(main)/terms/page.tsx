import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('terms', {
    title: 'Terms & Conditions',
    description: 'Read our terms and conditions for using our travel services.',
  });
}

export default async function TermsPage() {
  let agencyName = 'Our Agency';

  try {
    const settings = await getAgencySettings();
    if (settings?.data?.agencyName) agencyName = settings.data.agencyName;
  } catch {
    // use defaults
  }

  return (
    <main className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <h1 className="text-3xl font-headline font-bold mb-8">Terms &amp; Conditions</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the services provided by {agencyName}, you agree to be bound by
            these Terms &amp; Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">2. Booking &amp; Reservations</h2>
          <p>
            All bookings are subject to availability and confirmation. A booking is only confirmed
            once you receive a written confirmation from {agencyName} and full payment (or the
            required deposit) has been received.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">3. Payments</h2>
          <p>
            Prices are displayed in the currency shown at the time of booking. {agencyName} reserves
            the right to adjust prices due to currency fluctuations, fuel surcharges, or changes in
            supplier costs before a booking is confirmed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">4. Cancellations &amp; Refunds</h2>
          <p>
            Cancellation policies vary by tour, hotel, and service. Please review the specific
            cancellation terms provided at the time of booking. Refunds, where applicable, will be
            processed within 14 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">5. Travel Insurance</h2>
          <p>
            We strongly recommend that all travellers obtain comprehensive travel insurance before
            departure. {agencyName} is not liable for losses arising from the absence of adequate
            insurance coverage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Limitation of Liability</h2>
          <p>
            {agencyName} acts as an intermediary between travellers and service providers (hotels,
            airlines, tour operators). We are not liable for any injury, loss, or damage arising
            from the services of third-party providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. Changes to Terms</h2>
          <p>
            {agencyName} reserves the right to update these Terms &amp; Conditions at any time.
            Continued use of our services constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">8. Contact</h2>
          <p>
            If you have questions about these terms, please reach out to us via our{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
