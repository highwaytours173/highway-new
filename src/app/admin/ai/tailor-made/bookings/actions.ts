'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { checkAgencyAccess } from '@/lib/supabase/agency-users';
import {
  listBookingRequestsForAgency,
  updateBookingRequestStatus,
} from '@/lib/supabase/booking-requests';
import type {
  BookingRequestStatus,
  TailorMadeBookingRequest,
} from '@/types/booking-request';

export type ListBookingsResult =
  | { ok: true; requests: TailorMadeBookingRequest[] }
  | { ok: false; error: string };

export async function listBookingRequestsAction(): Promise<ListBookingsResult> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, error: 'Unauthorized.' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, error: 'Agency context not found.' };

  const requests = await listBookingRequestsForAgency(agency.id, { limit: 200 });
  return { ok: true, requests };
}

export type UpdateBookingStatusResult =
  | { ok: true; request: TailorMadeBookingRequest }
  | { ok: false; error: string };

const ALLOWED_STATUSES: ReadonlyArray<BookingRequestStatus> = [
  'new',
  'contacted',
  'closed',
  'spam',
];

export async function updateBookingStatusAction(
  id: string,
  status: BookingRequestStatus
): Promise<UpdateBookingStatusResult> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, error: 'Unauthorized.' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, error: 'Agency context not found.' };

  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status.' };
  }

  try {
    const updated = await updateBookingRequestStatus(id, agency.id, status);
    if (!updated) {
      return { ok: false, error: 'Booking request not found.' };
    }
    revalidatePath('/admin/ai/tailor-made/bookings');
    return { ok: true, request: updated };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update status.',
    };
  }
}
