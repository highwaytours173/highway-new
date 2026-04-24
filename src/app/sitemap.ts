import type { MetadataRoute } from 'next';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { getTours } from '@/lib/supabase/tours';
import { getPublicHotels } from '@/lib/supabase/hotels';
import { getPosts } from '@/lib/supabase/blog';

function toBaseUrl(agency: Awaited<ReturnType<typeof getCurrentAgency>>): string {
  const raw =
    agency?.domain?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return url.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agency = await getCurrentAgency().catch(() => null);
  const base = toBaseUrl(agency);
  const modules = agency?.settings?.modules;

  const now = new Date().toISOString();

  // Static pages always present
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    {
      url: `${base}/terms-and-condition`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${base}/policy-security`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Tours
  let tourRoutes: MetadataRoute.Sitemap = [];
  if (modules?.tours !== false) {
    staticRoutes.push({
      url: `${base}/tours`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    });

    const tours = await getTours().catch(() => []);
    tourRoutes = tours
      .filter((t) => t.slug)
      .map((tour) => ({
        url: `${base}/tours/${tour.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  }

  // Hotels
  let hotelRoutes: MetadataRoute.Sitemap = [];
  if (modules?.hotels !== false) {
    staticRoutes.push({
      url: `${base}/hotels`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    });

    const hotels = await getPublicHotels().catch(() => []);
    hotelRoutes = hotels
      .filter((h) => h.slug)
      .map((hotel) => ({
        url: `${base}/hotels/${hotel.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  }

  // Blog
  let blogRoutes: MetadataRoute.Sitemap = [];
  if (modules?.blog !== false) {
    staticRoutes.push({
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    const posts = await getPosts().catch(() => []);
    blogRoutes = posts
      .filter((p) => p.slug && p.status === 'Published')
      .map((post) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? post.createdAt ?? now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  }

  return [...staticRoutes, ...tourRoutes, ...hotelRoutes, ...blogRoutes];
}
