import React, { Suspense } from "react";
import { getTours } from "@/lib/supabase/tours";
import { TourCard } from "@/components/tour-card";

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResultsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResultsContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q as string) || "";
  const destination = (resolvedSearchParams.destination as string) || "";
  const type = (resolvedSearchParams.type as string) || "";

  const tours = await getTours();

  const filteredTours = tours.filter((tour) => {
    const matchesQuery = query
      ? tour.name?.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesDestination = destination
      ? tour.destination?.toLowerCase() === destination.toLowerCase()
      : true;
    const matchesType = type
      ? Array.isArray(tour.type) && tour.type.some((t) => t.toLowerCase() === type.toLowerCase())
      : true;
    return matchesQuery && matchesDestination && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Search Results</h1>
      <div className="mb-8">
        <p className="text-lg">Showing results for:</p>
        <ul className="list-disc list-inside">
          {query && (
            <li>
              Query: <strong>{query}</strong>
            </li>
          )}
          {destination && (
            <li>
              Destination: <strong>{destination}</strong>
            </li>
          )}
          {type && (
            <li>
              Type: <strong>{type}</strong>
            </li>
          )}
        </ul>
      </div>

      {filteredTours.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">No tours found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn&apos;t find any tours matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
