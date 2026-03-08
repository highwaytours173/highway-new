'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Ban, Users, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getTourAvailability,
  setDateAvailability,
  removeDateAvailability,
} from '@/lib/supabase/tour-availability';
import type { TourDateAvailability } from '@/types';

interface TourAvailabilityManagerProps {
  tourId: string;
}

export function TourAvailabilityManager({ tourId }: TourAvailabilityManagerProps) {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<TourDateAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [action, setAction] = useState<'block' | 'limit'>('block');
  const [spots, setSpots] = useState<string>('10');

  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTourAvailability(tourId);
      setAvailability(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load availability.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [tourId, toast]);

  useEffect(() => {
    if (tourId) {
      loadAvailability();
    }
  }, [tourId, loadAvailability]);

  const handleSave = async () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    setSaving(true);

    try {
      await setDateAvailability({
        tourId,
        date: dateStr,
        availableSpots: action === 'limit' ? parseInt(spots, 10) : null,
        isBlocked: action === 'block',
      });

      toast({ title: 'Saved', description: `Availability updated for ${dateStr}.` });
      await loadAvailability();
      setSelectedDate(undefined);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save availability.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (date: string) => {
    try {
      await removeDateAvailability(tourId, date);
      toast({ title: 'Removed', description: `Restrictions removed for ${date}.` });
      await loadAvailability();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove availability.',
        variant: 'destructive',
      });
    }
  };

  // Build modifier maps for calendar styling
  const blockedDates: Date[] = [];
  const limitedDates: Date[] = [];

  for (const entry of availability) {
    const d = new Date(entry.date + 'T00:00:00');
    if (entry.isBlocked) {
      blockedDates.push(d);
    } else if (entry.availableSpots !== null) {
      limitedDates.push(d);
    }
  }

  const modifiers = {
    blocked: blockedDates,
    limited: limitedDates,
  };

  const modifiersStyles: Record<string, React.CSSProperties> = {
    blocked: {
      backgroundColor: 'hsl(0 84% 60%)',
      color: 'white',
      borderRadius: '6px',
    },
    limited: {
      backgroundColor: 'hsl(45 93% 47%)',
      color: 'white',
      borderRadius: '6px',
    },
  };

  // Get entry for selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const selectedEntry = selectedDateStr
    ? availability.find((a) => a.date === selectedDateStr)
    : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Calendar</CardTitle>
          <CardDescription>
            Click a date to block it or set a capacity limit. Red = blocked, yellow = limited spots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
          />
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'hsl(0 84% 60%)' }} />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'hsl(45 93% 47%)' }} />
              <span>Limited spots</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>Selected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? `Configure: ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`
                : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? selectedEntry
                  ? selectedEntry.isBlocked
                    ? 'This date is currently blocked.'
                    : `Limited to ${selectedEntry.availableSpots} spots.`
                  : 'No restrictions set — unlimited availability.'
                : 'Click a date on the calendar to configure it.'}
            </CardDescription>
          </CardHeader>
          {selectedDate && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={action} onValueChange={(v) => setAction(v as 'block' | 'limit')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">
                      <span className="flex items-center gap-2">
                        <Ban className="h-4 w-4" /> Block this date
                      </span>
                    </SelectItem>
                    <SelectItem value="limit">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Set capacity limit
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action === 'limit' && (
                <div className="space-y-2">
                  <Label htmlFor="spots">Available Spots</Label>
                  <Input
                    id="spots"
                    type="number"
                    min={0}
                    value={spots}
                    onChange={(e) => setSpots(e.target.value)}
                    placeholder="e.g., 20"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedEntry ? 'Update' : 'Save'}
                </Button>
                {selectedEntry && (
                  <Button variant="outline" onClick={() => handleRemove(selectedDateStr!)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Existing rules list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Rules</CardTitle>
            <CardDescription>
              {availability.length === 0
                ? 'No date restrictions set. All dates are available with unlimited spots.'
                : `${availability.length} date${availability.length === 1 ? '' : 's'} with custom rules.`}
            </CardDescription>
          </CardHeader>
          {availability.length > 0 && (
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availability.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.date}</span>
                      {entry.isBlocked ? (
                        <Badge variant="destructive" className="text-xs">
                          <Ban className="mr-1 h-3 w-3" /> Blocked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="mr-1 h-3 w-3" /> {entry.availableSpots} spots
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(entry.date)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
