import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Inbox,
  Mail,
  Percent,
  Sparkles,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type FeedItemKind = 'booking' | 'review' | 'contact' | 'promo-expiring';

interface FeedItem {
  kind: FeedItemKind;
  title: string;
  subtitle?: string;
  timestamp: string; // ISO
  href: string;
  /** Optional severity tint. */
  severity?: 'neutral' | 'warning' | 'positive';
}

interface ThisWeekFeedProps {
  bookings?: { id: string; customerName: string; bookingDate: string; status: string }[];
  reviews?: {
    id: string;
    customerName: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }[];
  contactMessages?: {
    id: string;
    name: string;
    subject?: string | null;
    status: 'new' | 'read' | 'archived';
    createdAt: string;
  }[];
  expiringPromos?: { id: string; code: string; expiresAt?: string }[];
  /** ISO; default = 7 days ago */
  since?: string;
}

const ICONS: Record<FeedItemKind, React.ComponentType<{ className?: string }>> = {
  booking: Calendar,
  review: Star,
  contact: Mail,
  'promo-expiring': Percent,
};

const KIND_LABEL: Record<FeedItemKind, string> = {
  booking: 'Booking',
  review: 'Review',
  contact: 'Message',
  'promo-expiring': 'Promo expiring',
};

/**
 * ThisWeekFeed — unified actionable inbox for the admin dashboard.
 *
 * Surfaces what changed in the last 7 days across multiple sections so the
 * agency owner doesn't have to hunt across Bookings, Reviews, Contact
 * Messages, and Promotions to know what needs attention.
 *
 * Server component — takes already-fetched arrays and merges them by
 * timestamp. Caller is responsible for limiting upstream query sizes.
 */
export function ThisWeekFeed({
  bookings = [],
  reviews = [],
  contactMessages = [],
  expiringPromos = [],
  since,
}: ThisWeekFeedProps) {
  const cutoff = since ? new Date(since) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const promoCutoff = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const items: FeedItem[] = [];

  for (const b of bookings) {
    const t = b.bookingDate ? new Date(b.bookingDate) : null;
    if (!t || t < cutoff) continue;
    items.push({
      kind: 'booking',
      title: `${b.customerName} placed a booking`,
      subtitle: b.status === 'Pending' ? 'Awaiting confirmation' : b.status,
      timestamp: b.bookingDate,
      href: `/admin/bookings/${b.id}`,
      severity: b.status === 'Pending' ? 'warning' : 'positive',
    });
  }

  for (const r of reviews) {
    const t = r.createdAt ? new Date(r.createdAt) : null;
    if (!t || t < cutoff) continue;
    items.push({
      kind: 'review',
      title: `${r.customerName} left a ${r.rating}-star review`,
      subtitle: r.status === 'pending' ? 'Needs moderation' : r.status,
      timestamp: r.createdAt,
      href: '/admin/reviews',
      severity: r.status === 'pending' ? 'warning' : 'neutral',
    });
  }

  for (const m of contactMessages) {
    const t = m.createdAt ? new Date(m.createdAt) : null;
    if (!t || t < cutoff) continue;
    if (m.status !== 'new') continue;
    items.push({
      kind: 'contact',
      title: m.subject ? `${m.name}: "${m.subject}"` : `New message from ${m.name}`,
      subtitle: 'Unread',
      timestamp: m.createdAt,
      href: '/admin/contact-messages',
      severity: 'warning',
    });
  }

  for (const p of expiringPromos) {
    if (!p.expiresAt) continue;
    const exp = new Date(p.expiresAt);
    if (exp <= new Date() || exp > promoCutoff) continue;
    items.push({
      kind: 'promo-expiring',
      title: `Promo "${p.code}" expires soon`,
      subtitle: `In ${formatDistanceToNow(exp)}`,
      timestamp: p.expiresAt,
      href: '/admin/promotions',
      severity: 'warning',
    });
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const visible = items.slice(0, 8);
  const pendingCount = items.filter((i) => i.severity === 'warning').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">This week</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {items.length} {items.length === 1 ? 'update' : 'updates'}
            </Badge>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="inline-flex items-center gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              {pendingCount} need{pendingCount === 1 ? 's' : ''} attention
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">All caught up</p>
            <p className="text-xs text-muted-foreground">
              No new activity in the last 7 days. Check back later.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {visible.map((item, idx) => {
              const Icon = ICONS[item.kind];
              return (
                <li key={`${item.kind}-${idx}-${item.timestamp}`}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 py-3 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded-lg"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        item.severity === 'warning' && 'bg-amber-100 text-amber-700',
                        item.severity === 'positive' && 'bg-green-100 text-green-700',
                        (!item.severity || item.severity === 'neutral') &&
                          'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span>{KIND_LABEL[item.kind]}</span>
                        {item.subtitle && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{item.subtitle}</span>
                          </>
                        )}
                        <span aria-hidden>·</span>
                        <span>
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
