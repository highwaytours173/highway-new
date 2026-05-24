/**
 * Lightweight client-side classifier for checkout/booking errors.
 *
 * The booking server throws plain `Error` instances with descriptive
 * messages (no error codes). Until those grow typed kinds, we pattern-
 * match the message to drive richer toast UI on the client.
 *
 * Add new patterns by extending the matchers below — DO NOT add
 * server-side dependencies here; this module is safe to import in any
 * client component.
 */

export type CheckoutErrorKind =
  | 'sold_out'
  | 'hold_expired'
  | 'payment_unavailable'
  | 'card_declined'
  | 'network'
  | 'min_nights'
  | 'generic';

export interface CheckoutErrorClassification {
  kind: CheckoutErrorKind;
  /** Concise user-facing title (e.g. toast title). */
  title: string;
  /** Longer body suitable for a toast description or alert body. */
  description: string;
  /** Suggested next action label (for buttons / links). */
  actionLabel?: string;
  /** Suggested next action route. */
  actionHref?: string;
}

const RE = {
  unavailable: /(not available|unavailable|sold out|sold-out|no spots|no longer available)/i,
  hold: /(hold (has )?(expired|released)|cart hold|reservation hold)/i,
  payment: /(payment method.*unavailable|online.*not configured|kashier.*not configured)/i,
  card: /(card.*declined|payment.*declined|insufficient funds|payment.*failed)/i,
  network: /(network|timeout|fetch failed|failed to fetch|ECONNRESET|ETIMEDOUT|connection)/i,
  minNights: /(at least \d+ night|minimum stay|min.*night)/i,
};

export function classifyCheckoutError(error: unknown): CheckoutErrorClassification {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';

  if (RE.minNights.test(msg)) {
    return {
      kind: 'min_nights',
      title: 'Stay too short',
      description: msg,
      actionLabel: 'Adjust dates',
      actionHref: '/cart',
    };
  }

  if (RE.unavailable.test(msg)) {
    return {
      kind: 'sold_out',
      title: 'This option just sold out',
      description:
        msg.length < 160
          ? msg
          : 'One of the items in your cart is no longer available. Please remove it or pick different dates to continue.',
      actionLabel: 'Update cart',
      actionHref: '/cart',
    };
  }

  if (RE.hold.test(msg)) {
    return {
      kind: 'hold_expired',
      title: 'Your hold expired',
      description:
        'Your room hold has been released to other guests. Re-add the room — pricing and availability may have changed.',
      actionLabel: 'Refresh cart',
      actionHref: '/cart',
    };
  }

  if (RE.payment.test(msg)) {
    return {
      kind: 'payment_unavailable',
      title: 'Payment method unavailable',
      description:
        'The selected payment method is currently disabled. Please pick another method on the payment step.',
      actionLabel: 'Choose payment',
    };
  }

  if (RE.card.test(msg)) {
    return {
      kind: 'card_declined',
      title: 'Card declined',
      description:
        'Your bank declined the charge. Try a different card or pay cash on arrival to complete your booking.',
      actionLabel: 'Try again',
    };
  }

  if (RE.network.test(msg)) {
    return {
      kind: 'network',
      title: 'Connection lost',
      description:
        'We couldn\'t reach our servers. Check your internet and try again — your cart is saved.',
      actionLabel: 'Retry',
    };
  }

  return {
    kind: 'generic',
    title: 'Order didn\'t go through',
    description: msg || 'Something unexpected happened. Please try again, or contact support if it persists.',
    actionLabel: 'Try again',
  };
}
