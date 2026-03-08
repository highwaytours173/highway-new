'use client';

import { deletePromoCode } from '@/lib/supabase/promo-codes';
import { PromoCode } from '@/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useRouter } from 'next/navigation';

export function PromotionsClient({ initialData }: { initialData: PromoCode[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      await deletePromoCode(id);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to delete promo code.');
    }
  };

  return <DataTable columns={columns({ onDelete: handleDelete })} data={initialData} />;
}
