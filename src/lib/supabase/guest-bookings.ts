'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/utils';
import type { Booking } from '@/types';

/**
 * Public guest-facing booking lookup.
 *
 * Returns a booking ONLY when BOTH the reference id AND the customer email
 * match. Email comparison is case-insensitive + trimmed. The check uses the
 * service-role client to bypass RLS but is gated on the email match — a
 * stolen booking reference alone is not sufficient to view the booking.
 *
 * Scope: cross-agency safe — the public booking page does not need an
 * agency filter because the reference id is already unique across agencies
 * (UUID primary key), and the email match prevents cross-customer leaks.
 */
export async function findBookingForGuest(params: {
  reference: string;
  email: string;
}): Promise<Booking | null> {
  const reference = params.reference?.trim();
  const email = params.email?.trim().toLowerCase();
  if (!reference || !email) return null;

  // Basic UUID-shape guard — bookings.id is a UUID. Reject obviously bad
  // inputs early to avoid pointless DB calls and accidental fuzzy matches.
  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference);
  if (!looksLikeUuid) return null;

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, booking_items(*, tours(name, slug, packages), upsell_items(name, price))'
    )
    .eq('id', reference)
    .maybeSingle();

  if (error) {
    console.error('guest booking lookup error:', error);
    return null;
  }
  if (!data) return null;

  const customerEmail = String(
    (data as Record<string, unknown>).customer_email ?? ''
  )
    .trim()
    .toLowerCase();
  if (customerEmail !== email) {
    // Email mismatch — DO NOT leak existence by giving distinct error codes.
    return null;
  }

  return toCamelCase(data) as Booking;
}
