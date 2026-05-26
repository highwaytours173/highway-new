'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { draftWalkthroughWithAi } from '@/app/admin/ai/tailor-made/actions';
import type { WalkthroughQuestion } from '@/types/tailor-made';

interface DraftWalkthroughDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, applying replaces the existing script entirely. */
  hasExistingQuestions: boolean;
  onApply: (questions: WalkthroughQuestion[]) => void;
}

export function DraftWalkthroughDialog({
  open,
  onOpenChange,
  hasExistingQuestions,
  onApply,
}: DraftWalkthroughDialogProps) {
  const { toast } = useToast();
  const [tone, setTone] = useState('');
  const [notes, setNotes] = useState('');
  const [drafting, startDraft] = useTransition();
  const [draft, setDraft] = useState<WalkthroughQuestion[] | null>(null);

  // Reset state when the dialog opens.
  useEffect(() => {
    if (!open) return;
    setTone('');
    setNotes('');
    setDraft(null);
  }, [open]);

  const handleDraft = () => {
    startDraft(async () => {
      const result = await draftWalkthroughWithAi({ tone, notes });
      if (!result.ok) {
        toast({
          title: 'Could not draft',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      setDraft(result.questions);
    });
  };

  const handleApply = () => {
    if (!draft) return;
    onApply(draft);
    onOpenChange(false);
    toast({
      title: 'Draft applied',
      description: `${draft.length} question${draft.length === 1 ? '' : 's'} loaded. Don't forget to save.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Draft walkthrough with AI
          </DialogTitle>
          <DialogDescription>
            AI will write a fresh question script based on your option lists. You can review
            before replacing your current questions.
          </DialogDescription>
        </DialogHeader>

        {!draft ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="draft-tone">Tone (optional)</Label>
              <Input
                id="draft-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. luxury, family-friendly, adventurous, no-frills"
                maxLength={200}
                disabled={drafting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="draft-notes">Anything specific to cover? (optional)</Label>
              <Textarea
                id="draft-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. ask about dietary needs, mention we specialise in Nile cruises"
                rows={3}
                maxLength={600}
                disabled={drafting}
              />
              <p className="text-[11px] text-muted-foreground">{notes.length}/600</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <p className="text-xs text-muted-foreground">
              Preview — {draft.length} question{draft.length === 1 ? '' : 's'}. Applying will{' '}
              {hasExistingQuestions ? (
                <strong className="text-destructive">replace your current script</strong>
              ) : (
                <strong>set this as your script</strong>
              )}
              .
            </p>
            <ol className="space-y-1.5 rounded-lg border bg-muted/20 p-2">
              {draft.map((q, idx) => (
                <li key={q.id} className="rounded-md border bg-background p-2.5 text-sm">
                  <p>
                    <span className="font-mono text-[11px] text-muted-foreground mr-1.5">
                      {idx + 1}.
                    </span>
                    <span className="font-medium">{q.prompt}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{q.field}</span>
                    <span>·</span>
                    <span>{q.type}</span>
                    <span>·</span>
                    <span>{q.required ? 'Required' : 'Optional'}</span>
                    {q.optionsSource && (
                      <>
                        <span>·</span>
                        <span>from {q.optionsSource}</span>
                      </>
                    )}
                  </div>
                  {q.helperText && (
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {q.helperText}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        <DialogFooter>
          {!draft ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={drafting}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleDraft} disabled={drafting}>
                {drafting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Drafting…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Draft script
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                Discard & redraft
              </Button>
              <Button type="button" onClick={handleApply}>
                {hasExistingQuestions ? 'Replace script' : 'Use this script'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
