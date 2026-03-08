import { getTours } from '@/lib/supabase/tours';
import type { Metadata } from 'next';
import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import { DestinationClient } from './destination-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('destination', {
    title: 'Destinations',
    description: 'Explore destinations and find the perfect tour for your next adventure.',
  });
}

type DestinationCard = {
  name: string;
  count: number;
  imageUrl?: string;
};

const defaultDestinationFallbackImages: Record<string, string> = {
  Cairo:
    'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=2400&q=70',
  Giza: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=70',
  Alexandria:
    'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=2400&q=70',
  Luxor:
    'https://images.unsplash.com/photo-1699115823831-cf1329dfc58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxhZHZlbnR1cmUlMjB0cmF2ZWx8ZW58MHx8fHwxNzUyNjIyOTA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  Aswan:
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=70',
  Hurghada:
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=70',
  'Sharm El Sheikh':
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2400&q=70',
  'Siwa Oasis':
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=70',
};

function normalizeDestination(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function isPreferredCoverImageUrl(url: string) {
  if (!url) return false;
  const normalized = url.trim();
  return normalized.includes('/storage/v1/object/public/');
}

export default async function DestinationPage() {
  const destinationFallbackImages: Record<string, string> = {
    ...defaultDestinationFallbackImages,
  };
  const destinationOverrideImages: Record<string, string> = {};
  const destinationDescriptions: Record<string, string> = {};
  let heroImageUrl = defaultDestinationFallbackImages.Cairo;
  let heroTitle = 'Explore Egypt’s main regions';
  let heroSubtitle = 'Pick a region to see available tours, highlights, and experiences.';
  let preferredDestinationOrder: string[] = [];

  try {
    const settings = await getAgencySettings();
    const images = settings?.data?.images;
    if (images?.destinationHeroUrl) {
      heroImageUrl = images.destinationHeroUrl;
    }
    if (Array.isArray(images?.destinationFallbackImages)) {
      for (const entry of images.destinationFallbackImages) {
        if (!entry?.destination || !entry?.imageUrl) continue;
        const normalizedDestination = normalizeDestination(entry.destination);
        destinationFallbackImages[normalizedDestination] = entry.imageUrl;
        destinationOverrideImages[normalizedDestination] = entry.imageUrl;
      }
    }
    const destinationPage = settings?.data?.destinationPage;
    if (typeof destinationPage?.heroTitle === 'string' && destinationPage.heroTitle.trim()) {
      heroTitle = destinationPage.heroTitle.trim();
    }
    if (typeof destinationPage?.heroSubtitle === 'string' && destinationPage.heroSubtitle.trim()) {
      heroSubtitle = destinationPage.heroSubtitle.trim();
    }
    if (Array.isArray(destinationPage?.cards)) {
      for (const entry of destinationPage.cards) {
        if (!entry?.destination || typeof entry.destination !== 'string') continue;
        if (!entry?.description || typeof entry.description !== 'string') continue;
        const key = normalizeDestination(entry.destination);
        const description = entry.description.trim();
        if (!key || !description) continue;
        destinationDescriptions[key] = description;
      }
    }
    if (Array.isArray(settings?.data?.tourDestinations)) {
      preferredDestinationOrder = Array.from(
        new Set(
          settings.data.tourDestinations
            .filter((d) => typeof d === 'string')
            .map((d) => normalizeDestination(d))
            .filter(Boolean)
        )
      );
    }
  } catch {}

  let cards: DestinationCard[] = [];
  try {
    const tours = await getTours();
    const byDestination = new Map<
      string,
      { count: number; coverUrl?: string; coverScore: number }
    >();

    for (const t of tours) {
      const raw = typeof t.destination === 'string' ? t.destination : '';
      const name = raw ? normalizeDestination(raw) : '';
      if (!name) continue;

      const existing = byDestination.get(name) ?? {
        count: 0,
        coverUrl: undefined,
        coverScore: -1,
      };
      existing.count += 1;

      const imageCandidate =
        Array.isArray(t.images) && typeof t.images[0] === 'string' ? t.images[0] : undefined;
      const score = typeof t.rating === 'number' ? t.rating : 0;
      if (
        imageCandidate &&
        isPreferredCoverImageUrl(imageCandidate) &&
        score >= existing.coverScore
      ) {
        existing.coverUrl = imageCandidate;
        existing.coverScore = score;
      }

      byDestination.set(name, existing);
    }

    if (preferredDestinationOrder.length > 0) {
      cards = preferredDestinationOrder.map((name) => {
        const entry = byDestination.get(name);
        return {
          name,
          count: entry?.count ?? 0,
          imageUrl:
            destinationOverrideImages[name] ?? entry?.coverUrl ?? destinationFallbackImages[name],
        };
      });
    } else {
      cards = Array.from(byDestination.entries())
        .map(([name, v]) => ({
          name,
          count: v.count,
          imageUrl:
            destinationOverrideImages[name] ?? v.coverUrl ?? destinationFallbackImages[name],
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }
  } catch {
    cards =
      preferredDestinationOrder.length > 0
        ? preferredDestinationOrder.map((name) => ({
            name,
            count: 0,
            imageUrl: destinationFallbackImages[name],
          }))
        : [];
  }

  return (
    <DestinationClient
      cards={cards}
      heroImageUrl={heroImageUrl}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      destinationDescriptions={destinationDescriptions}
    />
  );
}
