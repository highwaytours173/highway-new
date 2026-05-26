'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { hashIp } from '@/lib/supabase/chat-sessions';
import {
  checkBookingRateLimit,
  createBookingRequest,
} from '@/lib/supabase/booking-requests';
import { TourInputSchema, TourOutputSchema } from '@/types/tour-schemas';

const BookingRequestInputSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(200),
  contactPhone: z.string().trim().min(4).max(40),
  notes: z.string().max(2000).optional(),
  tourInput: TourInputSchema,
  tourOutput: TourOutputSchema,
});

export type BookingRequestActionInput = z.input<typeof BookingRequestInputSchema>;

export type BookingRequestActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; retryAfterSeconds?: number };

function clientIp(headerList: Headers): string {
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headerList.get('x-real-ip') ?? 'unknown';
}

export async function submitTailorMadeBookingRequest(
  input: BookingRequestActionInput
): Promise<BookingRequestActionResult> {
  const parsed = BookingRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid booking request.',
    };
  }

  const agency = await getCurrentAgency();
  if (!agency) {
    return { ok: false, error: 'Could not resolve the agency for this site.' };
  }

  const headerList = await headers();
  const ipHash = hashIp(clientIp(headerList));
  const userAgent = headerList.get('user-agent');

  const rate = checkBookingRateLimit(ipHash, agency.id);
  if (!rate.ok) {
    return {
      ok: false,
      error:
        "You've submitted a few booking requests already — give us a moment to reach out before sending another.",
      retryAfterSeconds: rate.retryAfterSeconds,
    };
  }

  try {
    const created = await createBookingRequest({
      agencyId: agency.id,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      notes: (parsed.data.notes ?? '').trim(),
      tourInput: parsed.data.tourInput,
      tourOutput: parsed.data.tourOutput,
      userAgent,
      ipHash,
    });
    return { ok: true, id: created.id };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to record your booking request. Please try again.',
    };
  }
}
