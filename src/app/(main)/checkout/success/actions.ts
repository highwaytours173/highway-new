'use server';

import { createAdminClient } from '@/lib/supabase/agency-users';
import { getCurrentAgencyId } from '@/lib/supabase/agencies';
import { verifyKashierSignature } from '@/lib/kashier';
import { updateBookingStatus } from '@/lib/supabase/bookings';
import type { Booking } from '@/types';

type FinalizeInput = {
  merchantOrderId: string;
  paymentStatus?: string | null;
  signature?: string | null;
  /** Either an array (already split) or a CSV string of keys. */
  signatureKeys?: string[] | string | null;
  /** All raw query params from the redirect, used to compute the signature payload. */
  params?: Record<string, string | null | undefined>;
};

type FinalizeResult = {
  status: Booking['status'] | 'unknown';
  changed: boolean;
  reason?: string;
};

const POSITIVE_STATUSES = new Set(['SUCCESS', 'PAID', 'APPROVED', 'CAPTURED']);
const NEGATIVE_STATUSES = new Set(['FAILED', 'FAILURE', 'CANCELLED', 'CANCELED', 'DECLINED']);

function mapStatus(raw?: string | null): Booking['status'] | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (POSITIVE_STATUSES.has(upper)) return 'Confirmed';
  if (NEGATIVE_STATUSES.has(upper)) return 'Cancelled';
  return null;
}

function parseSignatureKeys(input: FinalizeInput['signatureKeys']): string[] | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return input.map((k) => String(k)).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return null;
}

/**
 * Finalize a Kashier redirect on the checkout success page.
 *
 * Strategy:
 * 1. If the redirect URL carries a `signature` + `signatureKeys`, verify them.
 *    On signature mismatch, return without changing status.
 * 2. Map `paymentStatus` to a booking status (only Confirmed/Cancelled).
 * 3. Only update when the booking is currently in `Pending` (never downgrade
 *    a Confirmed booking, never overwrite a Cancelled one).
 *
 * Webhook is still the source of truth in production; this exists so users
 * are not stuck on "Processing payment" when the webhook is delayed or not
 * reachable (e.g. local development).
 */
export async function finalizeKashierRedirect(input: FinalizeInput): Promise<FinalizeResult> {
  if (!input.merchantOrderId) {
    return { status: 'unknown', changed: false, reason: 'missing_order_id' };
  }

  const target = mapStatus(input.paymentStatus);
  if (!target) {
    return { status: 'unknown', changed: false, reason: 'unmapped_payment_status' };
  }

  // Optional signature verification when Kashier returns one in the redirect.
  if (input.signature) {
    const keys = parseSignatureKeys(input.signatureKeys);
    if (keys && keys.length > 0 && input.params) {
      const data: Record<string, unknown> = {};
      for (const key of keys) {
        data[key] = input.params[key] ?? '';
      }
      const verification = await verifyKashierSignature({
        signature: input.signature,
        signatureKeys: keys,
        data,
      });
      if (!verification.ok) {
        return { status: 'unknown', changed: false, reason: 'signature_mismatch' };
      }
    }
  }

  const supabase = await createAdminClient();
  const agencyId = await getCurrentAgencyId();

  const { data: existing, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', input.merchantOrderId)
    .eq('agency_id', agencyId)
    .maybeSingle();

  if (fetchErr || !existing) {
    return { status: 'unknown', changed: false, reason: 'booking_not_found' };
  }

  const currentStatus = existing.status as Booking['status'];

  // Idempotent: if already in target state, no change needed.
  if (currentStatus === target) {
    return { status: currentStatus, changed: false };
  }

  // Never downgrade a Confirmed booking back to Cancelled via redirect.
  if (currentStatus === 'Confirmed') {
    return { status: currentStatus, changed: false, reason: 'already_confirmed' };
  }

  // Only finalize from Pending. If somehow Cancelled, leave it.
  if (currentStatus !== 'Pending') {
    return { status: currentStatus, changed: false, reason: 'not_pending' };
  }

  await updateBookingStatus(input.merchantOrderId, target);
  return { status: target, changed: true };
}
