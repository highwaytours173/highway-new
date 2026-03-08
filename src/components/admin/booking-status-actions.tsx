'use client';

import { useState } from 'react';
import { updateBookingStatus } from '@/lib/supabase/bookings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BookingStatusActionsProps {
  bookingId: string;
  currentStatus: 'Confirmed' | 'Pending' | 'Cancelled';
}

export function BookingStatusActions({ bookingId, currentStatus }: BookingStatusActionsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (status: 'Confirmed' | 'Pending' | 'Cancelled') => {
    setLoading(true);
    try {
      await updateBookingStatus(bookingId, status);
      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${status}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus !== 'Confirmed' && (
        <Button
          onClick={() => handleStatusUpdate('Confirmed')}
          disabled={loading}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Confirm Booking
        </Button>
      )}
      {currentStatus !== 'Cancelled' && (
        <Button
          onClick={() => handleStatusUpdate('Cancelled')}
          disabled={loading}
          variant="destructive"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Cancel Booking
        </Button>
      )}
      {currentStatus !== 'Pending' && (
        <Button onClick={() => handleStatusUpdate('Pending')} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Clock className="mr-2 h-4 w-4" />
          )}
          Mark as Pending
        </Button>
      )}
    </div>
  );
}
