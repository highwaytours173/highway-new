import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('environmental', {
    title: 'Environmental Policy',
    description: 'Our commitment to sustainable and responsible travel practices.',
  });
}

export default async function EnvironmentalPage() {
  let agencyName = 'Our Agency';

  try {
    const settings = await getAgencySettings();
    if (settings?.agency_name) agencyName = settings.agency_name;
  } catch {
    // use defaults
  }

  return (
    <main className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <h1 className="text-3xl font-headline font-bold mb-8">Environmental Policy</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Our Commitment</h2>
          <p>{agencyName} is committed to minimising the environmental impact of travel while maximising positive contributions to the communities and ecosystems we visit.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Sustainable Partnerships</h2>
          <p>We partner with hotels, tour operators, and transport providers who demonstrate responsible environmental practices, including waste reduction, energy efficiency, and community engagement.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Carbon Awareness</h2>
          <p>We encourage travellers to consider lower-carbon transport options where feasible and provide information about carbon offset programmes for flights and long-distance travel.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Respect for Local Communities</h2>
          <p>Our tours are designed to benefit local economies. We promote cultural sensitivity, fair trade, and support for locally owned businesses and guides.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Wildlife &amp; Nature</h2>
          <p>We do not promote or support activities that exploit or harm wildlife. Our nature-based tours follow responsible wildlife viewing guidelines and support conservation efforts.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Continuous Improvement</h2>
          <p>{agencyName} regularly reviews its environmental practices and works to improve sustainability across all operations. We welcome feedback from our travellers and partners.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">Get Involved</h2>
          <p>Have suggestions on how we can be more sustainable? We&apos;d love to hear from you via our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
        </section>
      </div>
    </main>
  );
}
