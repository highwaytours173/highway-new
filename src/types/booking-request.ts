import type { TourInput, TourOutput } from '@/types/tour-schemas';

export type BookingRequestStatus = 'new' | 'contacted' | 'closed' | 'spam';

export type TailorMadeBookingRequest = {
  id: string;
  agencyId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  tourInput: TourInput;
  tourOutput: TourOutput;
  status: BookingRequestStatus;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export const BOOKING_STATUS_LABELS: Record<BookingRequestStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
  spam: 'Spam',
};
