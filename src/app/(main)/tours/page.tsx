import { getTours } from '@/lib/supabase/tours';
import { ToursPageClient } from './tours-page-client';
import type { Metadata } from 'next';
import { getAgencySettings, getPageMetadata } from '@/lib/supabase/agency-content';
import { getToursAvailableOnDate } from '@/lib/supabase/tour-availability';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const destination = typeof resolved?.destination === 'string' ? resolved.destination : '';
  const type = typeof resolved?.type === 'string' ? resolved.type : '';

  let agencyName = '';
  try {
    const settings = await getAgencySettings();
    agencyName = settings?.data?.agencyName || '';
  } catch {
    agencyName = '';
  }
  const brand = agencyName.trim() || 'our agency';

  if (destination || type) {
    let title = 'All Tours';
    let description = 'Browse our selection of tours and travel experiences.';

    if (destination) {
      title = `${destination} Tours`;
      description = `Find the best tours in ${destination}. Book your perfect ${destination} adventure with ${brand}.`;
    } else if (type) {
      title = `${type} Tours`;
      description = `Explore our ${type} tours. Unforgettable experiences await.`;
    }

    return {
      title,
      description,
    };
  }

  return getPageMetadata('tours', {
    title: 'Tours',
    description: 'Browse our selection of tours and travel experiences.',
  });
}

export default async function AllToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q : '';
  const destination =
    typeof resolvedSearchParams?.destination === 'string' ? resolvedSearchParams.destination : '';
  const type = typeof resolvedSearchParams?.type === 'string' ? resolvedSearchParams.type : '';
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : '';
  const travelDate =
    typeof resolvedSearchParams?.travelDate === 'string' ? resolvedSearchParams.travelDate : '';
  const settings = await getAgencySettings();
  const destinationOptions = settings?.data?.tourDestinations ?? [];
  const typeOptions = settings?.data?.tourCategories ?? [];

  let tours = [] as Awaited<ReturnType<typeof getTours>>;
  let hasLoadError = false;
  try {
    tours = await getTours({ q, destination, type });
  } catch {
    tours = [];
    hasLoadError = true;
  }

  // Filter by travel date availability
  if (travelDate && tours.length > 0) {
    try {
      const availableTourIds = await getToursAvailableOnDate(
        travelDate,
        tours.map((t) => t.id)
      );
      // Keep tours that either have no restriction or are explicitly available
      if (availableTourIds !== null) {
        tours = tours.filter((t) => availableTourIds.includes(t.id));
      }
    } catch {
      // If availability check fails, show all tours
    }
  }

  let allTours = tours;
  try {
    allTours = await getTours();
  } catch {
    allTours = tours;
  }

  const getMinAdultPrice = (tour: {
    priceTiers?: Array<{ pricePerAdult: number }>;
    packages?: Array<{ priceTiers: Array<{ pricePerAdult: number }> }>;
  }) => {
    const prices: number[] = [];
    for (const tier of tour.priceTiers ?? []) {
      if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
    }
    for (const pkg of tour.packages ?? []) {
      for (const tier of pkg.priceTiers ?? []) {
        if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
      }
    }
    if (prices.length === 0) return Number.POSITIVE_INFINITY;
    return Math.min(...prices);
  };

  const sortedTours = [...tours];
  switch (sort) {
    case 'price_asc':
      sortedTours.sort((a, b) => getMinAdultPrice(a) - getMinAdultPrice(b));
      break;
    case 'price_desc':
      sortedTours.sort((a, b) => getMinAdultPrice(b) - getMinAdultPrice(a));
      break;
    case 'duration_asc':
      sortedTours.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
      break;
    case 'duration_desc':
      sortedTours.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
      break;
    case 'rating_desc':
      sortedTours.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case 'name_asc':
      sortedTours.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return (
    <ToursPageClient
      sortedTours={sortedTours}
      allTours={allTours}
      q={q}
      destination={destination}
      type={type}
      sort={sort}
      travelDate={travelDate}
      destinationOptions={destinationOptions}
      typeOptions={typeOptions}
      hasLoadError={hasLoadError}
    />
  );
}
