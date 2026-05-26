'use client';

import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
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
import { submitTailorMadeBookingRequest } from '@/app/(main)/tailor-made/actions';
import type { TourInput, TourOutput } from '@/types/tour-schemas';

interface BookingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourInput: TourInput;
  tourOutput: TourOutput;
  agencyName: string;
}

type Phase = 'form' | 'submitting' | 'success';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingRequestDialog({
  open,
  onOpenChange,
  tourInput,
  tourOutput,
  agencyName,
}: BookingRequestDialogProps) {
  const [phase, setPhase] = useState<Phase>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Fresh state every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setPhase('form');
    setError(null);
  }, [open]);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();
  const canSubmit =
    trimmedName.length >= 2 &&
    EMAIL_RE.test(trimmedEmail) &&
    trimmedPhone.length >= 4 &&
    !pending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setError(null);
    setPhase('submitting');
    startTransition(async () => {
      const result = await submitTailorMadeBookingRequest({
        contactName: trimmedName,
        contactEmail: trimmedEmail,
        contactPhone: trimmedPhone,
        notes: notes.trim() || undefined,
        tourInput,
        tourOutput,
      });
      if (!result.ok) {
        setError(result.error);
        setPhase('form');
        return;
      }
      setPhase('success');
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {phase === 'success' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Request sent!
              </DialogTitle>
              <DialogDescription>
                Thanks {trimmedName.split(/\s+/)[0] || 'there'} — {agencyName} has your
                itinerary and will reach out shortly via email or phone to finalise the
                booking.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request to book this itinerary</DialogTitle>
              <DialogDescription>
                Share how to reach you and {agencyName} will get back to confirm dates,
                price, and anything you&apos;d like to tweak.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="br-name">Full name</Label>
                <Input
                  id="br-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Mahmoud"
                  maxLength={120}
                  disabled={pending}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="br-email">Email</Label>
                <Input
                  id="br-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={200}
                  disabled={pending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="br-phone">Phone (with country code)</Label>
                <Input
                  id="br-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 100 555 0123"
                  maxLength={40}
                  disabled={pending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="br-notes">Anything we should know? (optional)</Label>
                <Textarea
                  id="br-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Best time to call, special requests, questions…"
                  rows={3}
                  maxLength={2000}
                  disabled={pending}
                />
              </div>

              {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-muted-foreground">
                We&apos;ll share the itinerary above with {agencyName} so they can pick up
                where you left off. No payment is taken at this step.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send booking request
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
