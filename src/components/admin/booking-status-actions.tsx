'use client';

import { useState } from 'react';
import {
  resendBookingConfirmationEmail,
  updateBookingStatus,
} from '@/lib/supabase/bookings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Copy, Loader2, Mail, XCircle } from 'lucide-react';

interface BookingStatusActionsProps {
  bookingId: string;
  currentStatus: 'Confirmed' | 'Pending' | 'Cancelled';
  /** Optional customer email — exposes a "Copy email" quick action. */
  customerEmail?: string;
  /** Optional phone — exposes a "Copy phone" quick action. */
  customerPhone?: string;
}

/**
 * BookingStatusActions — primary in-page toolbar on the booking detail
 * page. Beyond the three status transitions it also exposes:
 *
 *   - Resend confirmation email (any non-pending booking)
 *   - Copy customer email / phone (one-tap clipboard for support replies)
 *
 * Each action is independent and toasts its own outcome. No bulk actions
 * here — those live on the bookings list page.
 */
export function BookingStatusActions({
  bookingId,
  currentStatus,
  customerEmail,
  customerPhone,
}: BookingStatusActionsProps) {
  const [pendingAction, setPendingAction] = useState<
    'confirm' | 'cancel' | 'pending' | 'resend' | null
  >(null);
  const { toast } = useToast();

  const handleStatusUpdate = async (
    status: 'Confirmed' | 'Pending' | 'Cancelled',
    key: 'confirm' | 'cancel' | 'pending'
  ) => {
    setPendingAction(key);
    try {
      await updateBookingStatus(bookingId, status);
      toast({
        title: 'Status updated',
        description: `Booking moved to ${status}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Couldn\'t update status',
        description: 'Please try again or reach out to support.',
        variant: 'destructive',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleResendEmail = async () => {
    setPendingAction('resend');
    try {
      await resendBookingConfirmationEmail(bookingId);
      toast({
        title: 'Confirmation email sent',
        description: customerEmail
          ? `Delivered to ${customerEmail}.`
          : 'The customer will receive the confirmation shortly.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Couldn\'t send the email',
        description:
          error instanceof Error
            ? error.message
            : 'Check your email settings under Settings › Email Notifications.',
        variant: 'destructive',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied`, description: value });
    } catch {
      toast({ title: `Couldn’t copy ${label.toLowerCase()}`, variant: 'destructive' });
    }
  };

  const loading = pendingAction !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus !== 'Confirmed' && (
        <Button
          onClick={() => handleStatusUpdate('Confirmed', 'confirm')}
          disabled={loading}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          {pendingAction === 'confirm' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Confirm
        </Button>
      )}
      {currentStatus !== 'Cancelled' && (
        <Button
          onClick={() => handleStatusUpdate('Cancelled', 'cancel')}
          disabled={loading}
          variant="destructive"
        >
          {pendingAction === 'cancel' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Cancel
        </Button>
      )}
      {currentStatus !== 'Pending' && (
        <Button
          onClick={() => handleStatusUpdate('Pending', 'pending')}
          disabled={loading}
          variant="outline"
        >
          {pendingAction === 'pending' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Clock className="mr-2 h-4 w-4" />
          )}
          Mark pending
        </Button>
      )}

      {/* Email action is gated on Confirmed status, matching server behaviour. */}
      {currentStatus === 'Confirmed' && (
        <Button onClick={handleResendEmail} disabled={loading} variant="outline">
          {pendingAction === 'resend' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Resend email
        </Button>
      )}

      {customerEmail && (
        <Button
          onClick={() => handleCopy(customerEmail, 'Email')}
          disabled={loading}
          variant="ghost"
          size="sm"
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copy email
        </Button>
      )}
      {customerPhone && (
        <Button
          onClick={() => handleCopy(customerPhone, 'Phone')}
          disabled={loading}
          variant="ghost"
          size="sm"
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Copy phone
        </Button>
      )}
    </div>
  );
}
