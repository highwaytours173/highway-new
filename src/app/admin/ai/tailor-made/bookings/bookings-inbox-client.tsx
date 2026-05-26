'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Inbox, Loader2, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listBookingRequestsAction,
  updateBookingStatusAction,
} from './actions';
import {
  BOOKING_STATUS_LABELS,
  type BookingRequestStatus,
  type TailorMadeBookingRequest,
} from '@/types/booking-request';

const STATUS_VARIANT: Record<BookingRequestStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  contacted: 'secondary',
  closed: 'outline',
  spam: 'destructive',
};

const STATUS_FILTERS: ReadonlyArray<BookingRequestStatus | 'all'> = [
  'all',
  'new',
  'contacted',
  'closed',
  'spam',
];

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BookingsInboxClient() {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [requests, setRequests] = useState<TailorMadeBookingRequest[]>([]);
  const [filter, setFilter] = useState<BookingRequestStatus | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listBookingRequestsAction();
      if (cancelled) return;
      if (result.ok) {
        setRequests(result.requests);
      } else {
        toast({
          title: 'Failed to load booking requests',
          description: result.error,
          variant: 'destructive',
        });
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const visible = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  const counts = useMemo(() => {
    const out: Record<BookingRequestStatus | 'all', number> = {
      all: requests.length,
      new: 0,
      contacted: 0,
      closed: 0,
      spam: 0,
    };
    for (const r of requests) {
      out[r.status] += 1;
    }
    return out;
  }, [requests]);

  const handleStatusChange = (id: string, status: BookingRequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  if (!loaded) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading requests…
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No booking requests yet</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            When a visitor likes a generated itinerary and hits &quot;Request to book&quot;,
            their contact details land here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === s
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
            )}
          >
            {s === 'all' ? 'All' : BOOKING_STATUS_LABELS[s]}{' '}
            <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No requests with status &quot;{filter}&quot;.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((req) => (
            <BookingRow
              key={req.id}
              request={req}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BookingRowProps {
  request: TailorMadeBookingRequest;
  onStatusChange: (id: string, status: BookingRequestStatus) => void;
}

function BookingRow({ request, onStatusChange }: BookingRowProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatus = (status: BookingRequestStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatusAction(request.id, status);
      if (!result.ok) {
        toast({
          title: 'Could not update status',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      onStatusChange(request.id, status);
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{request.contactName}</CardTitle>
              <Badge variant={STATUS_VARIANT[request.status]}>
                {BOOKING_STATUS_LABELS[request.status]}
              </Badge>
            </div>
            <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <a
                  href={`mailto:${request.contactEmail}`}
                  className="hover:underline"
                >
                  {request.contactEmail}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <a href={`tel:${request.contactPhone}`} className="hover:underline">
                  {request.contactPhone}
                </a>
              </span>
              <span className="text-muted-foreground/80">
                {formatTimestamp(request.createdAt)}
              </span>
            </CardDescription>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Select
              value={request.status}
              onValueChange={(v) => handleStatus(v as BookingRequestStatus)}
              disabled={pending}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm font-medium">
          {request.tourOutput.tourName}{' '}
          <span className="text-muted-foreground font-normal">
            — {request.tourOutput.totalPrice} {request.tourOutput.currency}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {request.tourInput.duration} days · {request.tourInput.participants} pax ·{' '}
          {request.tourInput.region.join(', ')}
        </p>

        {request.notes && (
          <div className="mt-2 rounded-md border bg-muted/30 p-2 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Visitor note
            </p>
            <p className="mt-0.5 whitespace-pre-wrap">{request.notes}</p>
          </div>
        )}

        <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <ChevronDown
                className={cn(
                  'mr-1 h-3 w-3 transition-transform',
                  open && 'rotate-180'
                )}
              />
              {open ? 'Hide itinerary details' : 'Show itinerary details'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ItineraryDigest request={request} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ItineraryDigest({ request }: { request: TailorMadeBookingRequest }) {
  const { tourInput, tourOutput } = request;
  return (
    <div className="space-y-3 rounded-md border bg-muted/10 p-3 text-xs">
      <div>
        <p className="font-semibold mb-1">Brief</p>
        <ul className="grid gap-0.5 sm:grid-cols-2">
          <li>
            <strong>Dates:</strong> {tourInput.travelDates.arrival} →{' '}
            {tourInput.travelDates.departure}
          </li>
          <li>
            <strong>Budget:</strong> {tourInput.budget.amount} {tourInput.budget.currency}/pp
          </li>
          <li>
            <strong>Accommodation:</strong> {tourInput.accommodation}
          </li>
          <li>
            <strong>Interests:</strong>{' '}
            {tourInput.interests.length > 0 ? tourInput.interests.join(', ') : '—'}
          </li>
          <li>
            <strong>Inclusions:</strong>{' '}
            {tourInput.inclusions.length > 0 ? tourInput.inclusions.join(', ') : '—'}
          </li>
        </ul>
        {tourInput.customPreferences && (
          <p className="mt-1">
            <strong>Custom:</strong> {tourInput.customPreferences}
          </p>
        )}
      </div>

      <div>
        <p className="font-semibold mb-1">Itinerary ({tourOutput.itinerary.length} days)</p>
        <ol className="space-y-1">
          {tourOutput.itinerary.map((day) => (
            <li key={day.day}>
              <strong>Day {day.day}:</strong> {day.title}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
