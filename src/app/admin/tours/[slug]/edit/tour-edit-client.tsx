'use client';

import { TourForm, formSchema } from '@/components/admin/tour-form';
import { updateTour } from '@/lib/supabase/tours';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Tour } from '@/types';
import * as z from 'zod';

interface TourEditClientProps {
  tour: Tour;
  categories: string[];
  destinations: string[];
}

export function TourEditClient({ tour, categories, destinations }: TourEditClientProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdateTour = async (values: z.infer<typeof formSchema>) => {
    try {
      const transformedValues = {
        ...values,
        highlights: values.highlights?.map((h) => h.value).filter(Boolean),
        includes: values.includes?.map((i) => i.value).filter(Boolean),
        excludes: values.excludes?.map((e) => e.value).filter(Boolean),
      };
      await updateTour(tour.id, transformedValues as Omit<Tour, 'id'>);

      toast({
        title: 'Success',
        description: 'Tour updated successfully.',
      });

      router.push('/admin/tours');
      router.refresh();
    } catch (error) {
      console.error('Failed to update tour:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update tour. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <TourForm
      initialData={tour}
      onSubmit={handleUpdateTour}
      formType="edit"
      categories={categories}
      destinations={destinations}
    />
  );
}
