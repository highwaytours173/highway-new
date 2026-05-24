'use client';

import type { Tour } from '@/types';
import { TourCard, type TourAvailabilityStatus } from '@/components/tour-card';
import { Stagger, StaggerItem } from '@/components/motion';

interface ToursClientProps {
  tours: Tour[];
  availabilityStatusByTourId?: Record<string, TourAvailabilityStatus>;
  compareEnabled?: boolean;
  selectedCompareIds?: string[];
  onToggleCompare?: (tourId: string) => void;
  compareLimit?: number;
}

export function ToursClient({
  tours,
  availabilityStatusByTourId,
  compareEnabled = false,
  selectedCompareIds = [],
  onToggleCompare,
  compareLimit = 3,
}: ToursClientProps) {
  const limitReached = selectedCompareIds.length >= compareLimit;
  return (
    <Stagger
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      staggerDelay={0.06}
      amount={0.1}
    >
      {tours.map((tour) => {
        const selected = selectedCompareIds.includes(tour.id);
        return (
          <StaggerItem key={tour.id}>
            <TourCard
              tour={tour}
              availabilityStatus={availabilityStatusByTourId?.[tour.id]}
              compareEnabled={compareEnabled}
              compareSelected={selected}
              onToggleCompare={onToggleCompare}
              compareDisabled={limitReached}
            />
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
