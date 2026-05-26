'use client';

import { useMemo } from 'react';
import { Calendar, Lightbulb, MapPin, MessageCircle, Shuffle, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { z } from 'zod';
import type { ItineraryDaySchema } from '@/types/tour-schemas';

type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

interface ItineraryDayCardProps {
  day: ItineraryDay;
  /** Optional className for the outer wrapper (e.g. spacing tweaks). */
  className?: string;
}

type TabKey = 'tips' | 'restaurants' | 'alternates' | 'local';

interface TabSpec {
  key: TabKey;
  label: string;
  icon: typeof Lightbulb;
  has: boolean;
}

export function ItineraryDayCard({ day, className }: ItineraryDayCardProps) {
  const tabs = useMemo<TabSpec[]>(() => {
    const list: TabSpec[] = [
      {
        key: 'tips',
        label: 'Tips',
        icon: Lightbulb,
        has: Boolean(
          (day.whatToBring && day.whatToBring.length > 0) ||
            day.culturalNotes ||
            day.whyWePickedThis
        ),
      },
      {
        key: 'restaurants',
        label: 'Eat',
        icon: Utensils,
        has: Boolean(day.restaurantPicks && day.restaurantPicks.length > 0),
      },
      {
        key: 'alternates',
        label: 'Alternates',
        icon: Shuffle,
        has: Boolean(day.alternativeOptions && day.alternativeOptions.length > 0),
      },
      {
        key: 'local',
        label: 'Local',
        icon: MessageCircle,
        has: Boolean(day.localPhrases && day.localPhrases.length > 0),
      },
    ];
    return list.filter((t) => t.has);
  }, [day]);

  const defaultTab = tabs[0]?.key;

  return (
    <article
      className={cn(
        'border-l-4 border-primary py-2 pl-4 pr-3 rounded-r-md bg-card/40',
        className
      )}
    >
      <header className="flex items-baseline gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Day {day.day}
        </span>
        <h4 className="font-bold leading-tight">{day.title}</h4>
      </header>

      <p className="mt-1 text-sm text-muted-foreground">{day.description}</p>

      <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
        <FactRow icon={Calendar} label="Activities">
          {day.activities.join(' · ')}
        </FactRow>
        {isMeaningfulAccommodation(day.accommodation) && (
          <FactRow icon={MapPin} label="Stay">
            {day.accommodation}
          </FactRow>
        )}
        <FactRow icon={Utensils} label="Meals">
          {day.meals.length > 0 ? day.meals.join(', ') : '—'}
        </FactRow>
      </dl>

      {tabs.length > 0 && defaultTab && (
        <Tabs defaultValue={defaultTab} className="mt-3">
          <div className="-mx-1 overflow-x-auto">
            <TabsList className="h-8 bg-muted/40 p-0.5 mx-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger
                    key={t.key}
                    value={t.key}
                    className="h-7 px-2.5 text-[11px] data-[state=active]:bg-background"
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {tabs.some((t) => t.key === 'tips') && (
            <TabsContent value="tips" className="mt-2 space-y-2 text-xs">
              {day.whyWePickedThis && (
                <Block heading="Why we picked this">{day.whyWePickedThis}</Block>
              )}
              {day.whatToBring && day.whatToBring.length > 0 && (
                <Block heading="What to bring">
                  <ul className="list-disc pl-4 space-y-0.5">
                    {day.whatToBring.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </Block>
              )}
              {day.culturalNotes && (
                <Block heading="Cultural notes">{day.culturalNotes}</Block>
              )}
            </TabsContent>
          )}

          {tabs.some((t) => t.key === 'restaurants') && day.restaurantPicks && (
            <TabsContent value="restaurants" className="mt-2 space-y-1.5 text-xs">
              {day.restaurantPicks.map((pick, idx) => (
                <div key={idx} className="rounded border bg-background p-2">
                  <p className="font-semibold">{pick.name}</p>
                  <p className="text-muted-foreground">{pick.note}</p>
                </div>
              ))}
            </TabsContent>
          )}

          {tabs.some((t) => t.key === 'alternates') && day.alternativeOptions && (
            <TabsContent value="alternates" className="mt-2 space-y-1.5 text-xs">
              {day.alternativeOptions.map((alt, idx) => (
                <div key={idx} className="rounded border bg-background p-2">
                  <p className="font-semibold">{alt.label}</p>
                  <p className="text-muted-foreground">{alt.description}</p>
                </div>
              ))}
            </TabsContent>
          )}

          {tabs.some((t) => t.key === 'local') && day.localPhrases && (
            <TabsContent value="local" className="mt-2 space-y-1 text-xs">
              {day.localPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-baseline gap-x-2 rounded border bg-background p-2"
                >
                  <p className="font-semibold">{phrase.phrase}</p>
                  <p className="text-muted-foreground">{phrase.translation}</p>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}
    </article>
  );
}

/**
 * "Self-arranged" / empty / dash-only values mean the agency doesn't book
 * accommodation for this trip — don't show the Stay line at all in that case.
 */
function isMeaningfulAccommodation(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === '—' || trimmed === '-') return false;
  return !trimmed.startsWith('self-arranged') && !trimmed.startsWith('self arranged');
}

function FactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
      <p>
        <strong className="font-semibold">{label}:</strong>{' '}
        <span className="text-muted-foreground">{children}</span>
      </p>
    </div>
  );
}

function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="rounded border bg-background p-2">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {heading}
      </p>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}
