import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { getTours } from '@/lib/supabase/tours';
import { Badge } from '@/components/ui/badge';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import type { Tour } from '@/types';

interface SimilarToursSectionProps {
  currentTour: Tour;
  limit?: number;
}

export async function SimilarToursSection({ currentTour, limit = 4 }: SimilarToursSectionProps) {
  const fetchSize = Math.max(limit + 2, 6);

  let candidates: Tour[] = [];
  try {
    if (currentTour.destination) {
      candidates = await getTours({
        destination: currentTour.destination,
        limit: fetchSize,
        skipTranslation: false,
      });
    }
    if (candidates.length <= 1) {
      const fallback = await getTours({ limit: fetchSize, skipTranslation: false });
      const seen = new Set(candidates.map((t) => t.id));
      for (const t of fallback) {
        if (!seen.has(t.id)) {
          candidates.push(t);
          seen.add(t.id);
        }
      }
    }
  } catch {
    return null;
  }

  const similar = candidates.filter((t) => t.id !== currentTour.id).slice(0, limit);

  if (similar.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-2">
      <Reveal className="mb-6 flex items-baseline justify-between gap-3">
        <h2 className="font-headline text-2xl md:text-3xl font-bold">You might also like</h2>
        <Link
          href={
            currentTour.destination
              ? `/tours?destination=${encodeURIComponent(currentTour.destination)}`
              : '/tours'
          }
          className="text-sm font-medium text-primary hover:underline"
        >
          See all
        </Link>
      </Reveal>

      <Stagger
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        staggerDelay={0.07}
        amount={0.1}
      >
        {similar.map((tour) => {
          const image = Array.isArray(tour.images) && tour.images.length > 0 ? tour.images[0] : null;
          const startingPrice = (() => {
            const prices: number[] = [];
            for (const tier of tour.priceTiers ?? []) {
              if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
            }
            for (const pkg of tour.packages ?? []) {
              for (const tier of pkg.priceTiers ?? []) {
                if (typeof tier?.pricePerAdult === 'number') prices.push(tier.pricePerAdult);
              }
            }
            return prices.length > 0 ? Math.min(...prices) : null;
          })();

          return (
            <StaggerItem key={tour.id}>
            <Link
              href={`/tours/${tour.slug}`}
              className="group block h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {image ? (
                  <Image
                    src={image}
                    alt={tour.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
                {tour.destination && (
                  <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 bg-white/90 text-gray-800 backdrop-blur dark:bg-black/70 dark:text-white"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {tour.destination}
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                  {tour.name}
                </h3>
                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  {tour.duration ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {tour.duration} days
                    </span>
                  ) : (
                    <span />
                  )}
                  {startingPrice != null && (
                    <span className="font-semibold text-primary">
                      From ${startingPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                  View details
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
