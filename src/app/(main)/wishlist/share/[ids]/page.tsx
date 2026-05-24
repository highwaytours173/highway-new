import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { getTours } from '@/lib/supabase/tours';
import { TourCard } from '@/components/tour-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { SaveSharedWishlistButton } from '@/components/save-shared-wishlist-button';

export const metadata: Metadata = {
  title: 'Shared wishlist',
  description: 'A friend has shared their travel wishlist with you.',
};

interface SharedWishlistPageProps {
  params: Promise<{ ids: string }>;
}

const MAX_IDS = 24;

function decodeIds(raw: string): string[] {
  const decoded = decodeURIComponent(raw);
  return decoded
    .split(/[,.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_IDS);
}

export default async function SharedWishlistPage({ params }: SharedWishlistPageProps) {
  const { ids: rawIds } = await params;
  const ids = decodeIds(rawIds);

  const tours = await getTours({ skipTranslation: false });
  // Preserve the order in the URL so the share looks like the sender intended.
  const idSet = new Set(ids);
  const filtered = tours.filter((t) => idSet.has(t.id));
  const ordered = ids
    .map((id) => filtered.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-8">
      <Breadcrumbs items={[{ label: 'Wishlist', href: '/wishlist' }, { label: 'Shared' }]} />

      <Reveal className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-300">
          <Heart className="h-7 w-7 fill-current" />
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">A shared wishlist</h1>
        <p className="text-muted-foreground">
          Someone curated these tours for you. Tap any card to view details, or save them all
          to your own wishlist to plan together.
        </p>
      </Reveal>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <h2 className="font-headline text-xl font-semibold mb-2">
            None of these tours are available right now
          </h2>
          <p className="text-muted-foreground mb-4">
            The shared list may be outdated or the tours have been removed. Browse our full catalog
            to find similar trips.
          </p>
          <Button asChild>
            <Link href="/tours">Browse tours</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {ordered.length} tour{ordered.length === 1 ? '' : 's'} from the shared list
            </p>
            <div className="flex flex-wrap gap-2">
              <SaveSharedWishlistButton tours={ordered} />
              <Button asChild variant="ghost" size="sm">
                <Link href="/wishlist">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  My wishlist
                </Link>
              </Button>
            </div>
          </div>

          <Stagger
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.06}
            amount={0.1}
          >
            {ordered.map((tour) => (
              <StaggerItem key={tour.id}>
                <TourCard tour={tour} />
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}
    </div>
  );
}
