import { createServiceRoleClient } from '@/lib/supabase/server';
import type {
  BookingRequestStatus,
  TailorMadeBookingRequest,
} from '@/types/booking-request';
import type { TourInput, TourOutput } from '@/types/tour-schemas';

type Row = {
  id: string;
  agency_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  tour_input: unknown;
  tour_output: unknown;
  status: string;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
};

function rowToRequest(row: Row): TailorMadeBookingRequest {
  return {
    id: row.id,
    agencyId: row.agency_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    notes: row.notes ?? '',
    tourInput: row.tour_input as TourInput,
    tourOutput: row.tour_output as TourOutput,
    status: (row.status as BookingRequestStatus) ?? 'new',
    userAgent: row.user_agent,
    ipHash: row.ip_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateBookingRequestInput = {
  agencyId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  tourInput: TourInput;
  tourOutput: TourOutput;
  userAgent: string | null;
  ipHash: string | null;
};

export async function createBookingRequest(
  input: CreateBookingRequestInput
): Promise<TailorMadeBookingRequest> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('tailor_made_booking_requests')
    .insert({
      agency_id: input.agencyId,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      notes: input.notes,
      tour_input: input.tourInput,
      tour_output: input.tourOutput,
      user_agent: input.userAgent,
      ip_hash: input.ipHash,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to record booking request: ${error.message}`);
  }
  return rowToRequest(data as Row);
}

export async function listBookingRequestsForAgency(
  agencyId: string,
  options: { limit?: number; status?: BookingRequestStatus } = {}
): Promise<TailorMadeBookingRequest[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('tailor_made_booking_requests')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 100);

  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to load booking requests:', error.message);
    return [];
  }
  return (data as Row[]).map(rowToRequest);
}

export async function updateBookingRequestStatus(
  id: string,
  agencyId: string,
  status: BookingRequestStatus
): Promise<TailorMadeBookingRequest | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('tailor_made_booking_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('agency_id', agencyId)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update booking request: ${error.message}`);
  }
  if (!data) return null;
  return rowToRequest(data as Row);
}

/**
 * Best-effort rate-limit for the public booking endpoint. Caps per-IP
 * submissions per agency per hour to keep spam down without hitting Redis.
 * Same trade-offs as `chat-rate-limit.ts` (in-memory, per-process).
 */
const BOOKING_IP_WINDOW_MS = 60 * 60 * 1000;
const BOOKING_IP_MAX = 5;
const bookingIpCounters = new Map<string, { count: number; windowStart: number }>();

export function checkBookingRateLimit(
  ipHash: string | null,
  agencyId: string
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  if (!ipHash) return { ok: true };
  const key = `${ipHash}:${agencyId}`;
  const now = Date.now();
  const counter = bookingIpCounters.get(key);
  if (!counter || now - counter.windowStart >= BOOKING_IP_WINDOW_MS) {
    bookingIpCounters.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (counter.count + 1 > BOOKING_IP_MAX) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((counter.windowStart + BOOKING_IP_WINDOW_MS - now) / 1000)
      ),
    };
  }
  counter.count += 1;
  return { ok: true };
}
