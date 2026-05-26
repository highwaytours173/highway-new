'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TailorMadeOption } from '@/types/tailor-made';

interface SuggestOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Server-action fetcher; returns suggestions already filtered to exclude existing options. */
  fetchSuggestions: () => Promise<{ ok: true; data: string[] } | { ok: false; error: string }>;
  /** Called with the selected new options to merge into the parent list. */
  onApply: (selected: TailorMadeOption[]) => void;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || `opt-${Math.random().toString(36).slice(2, 8)}`
  );
}

export function SuggestOptionsDialog({
  open,
  onOpenChange,
  title,
  description,
  fetchSuggestions,
  onApply,
}: SuggestOptionsDialogProps) {
  const { toast } = useToast();
  const [loading, startLoading] = useTransition();
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSuggestions(null);
    setSelected(new Set());
    startLoading(async () => {
      const result = await fetchSuggestions();
      if (!result.ok) {
        toast({
          title: 'Could not load suggestions',
          description: result.error,
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }
      setSuggestions(result.data);
      // Pre-select all by default — admin can deselect any they don't want.
      setSelected(new Set(result.data));
    });
  }, [open, fetchSuggestions, onOpenChange, toast]);

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleApply = () => {
    if (!suggestions || selected.size === 0) {
      onOpenChange(false);
      return;
    }
    const picks: TailorMadeOption[] = Array.from(selected).map((label) => ({
      id: slugify(label),
      label,
    }));
    onApply(picks);
    toast({
      title: `Added ${picks.length} ${picks.length === 1 ? 'option' : 'options'}`,
      description: 'Remember to click Save changes when you\'re done.',
    });
    onOpenChange(false);
  };

  const allSelected = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return false;
    return suggestions.every((s) => selected.has(s));
  }, [suggestions, selected]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading || suggestions === null ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning your tour catalog…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Nothing new to suggest — your tour catalog already aligns with your current list.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {selected.size} of {suggestions.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (allSelected) setSelected(new Set());
                    else setSelected(new Set(suggestions));
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-lg border p-1.5">
                {suggestions.map((label) => (
                  <label
                    key={label}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={selected.has(label)}
                      onCheckedChange={() => toggle(label)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={loading || !suggestions || selected.size === 0}
          >
            Add {selected.size > 0 ? `${selected.size} ` : ''}
            {selected.size === 1 ? 'option' : 'options'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
