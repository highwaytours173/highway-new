'use client';

import { Lock, CheckCircle2, Zap, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const badges = [
  {
    icon: Lock,
    colorClass: 'bg-green-100 dark:bg-green-900/30',
    iconColorClass: 'text-green-600 dark:text-green-400',
    titleKey: 'checkout.securePayment',
    descKey: 'checkout.securePaymentDesc',
  },
  {
    icon: CheckCircle2,
    colorClass: 'bg-blue-100 dark:bg-blue-900/30',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
    titleKey: 'checkout.verifiedAgency',
    descKey: 'checkout.verifiedAgencyDesc',
  },
  {
    icon: Zap,
    colorClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColorClass: 'text-yellow-600 dark:text-yellow-400',
    titleKey: 'checkout.instantConfirm',
    descKey: 'checkout.instantConfirmDesc',
  },
  {
    icon: RefreshCw,
    colorClass: 'bg-purple-100 dark:bg-purple-900/30',
    iconColorClass: 'text-purple-600 dark:text-purple-400',
    titleKey: 'checkout.flexibleBooking',
    descKey: 'checkout.flexibleBookingDesc',
  },
] as const;

/**
 * TrustBadges — reusable trust signal component for checkout.
 *
 * variant="full"    → vertical list with icons, used in the Order Summary sidebar
 * variant="compact" → compact horizontal strip, used above the Place Order button
 */
export function TrustBadges({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const { t } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 py-1">
        {badges.map(({ icon: Icon, iconColorClass, titleKey }) => (
          <div key={titleKey} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className={`h-3.5 w-3.5 ${iconColorClass}`} />
            <span>{t(titleKey)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card p-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('checkout.whyBookWith')}
      </p>
      <div className="space-y-3">
        {badges.map(({ icon: Icon, colorClass, iconColorClass, titleKey, descKey }) => (
          <div key={titleKey} className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
            >
              <Icon className={`h-4 w-4 ${iconColorClass}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{t(titleKey)}</p>
              <p className="text-xs text-muted-foreground">{t(descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
