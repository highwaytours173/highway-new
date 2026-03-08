'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PERIODS = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: 'All time', value: 'all' },
];

export function PeriodSelector({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '30') {
      params.delete('period'); // 30d is the default
    } else {
      params.set('period', value);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  };

  return (
    <div className="flex rounded-lg border overflow-hidden">
      {PERIODS.map((p) => (
        <Button
          key={p.value}
          variant={currentPeriod === p.value ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none border-r last:border-r-0 h-9 px-3 text-xs"
          onClick={() => handleSelect(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
