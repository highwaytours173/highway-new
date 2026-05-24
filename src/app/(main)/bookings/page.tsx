import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Reveal } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Look up your booking',
  description:
    'Enter your booking reference and email to view your itinerary, status, and voucher.',
};

export default async function BookingLookupIndex({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const missing = resolved.missing === '1';
  const notFound = resolved.notfound === '1';

  async function lookupAction(formData: FormData) {
    'use server';
    const reference = String(formData.get('reference') || '').trim();
    const email = String(formData.get('email') || '').trim();
    if (!reference || !email) {
      redirect('/bookings?missing=1');
    }
    const target = `/bookings/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`;
    redirect(target);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
      <Reveal className="text-center mb-8 space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Find your booking</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter the reference from your confirmation email and the email used at checkout.
        </p>
      </Reveal>

      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-5">
          {(missing || notFound) && (
            <div
              role="alert"
              className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-100"
            >
              {missing
                ? 'Please fill in both fields to look up your booking.'
                : 'We couldn\'t find a booking with that reference and email. Double-check your confirmation email, or contact support if the problem persists.'}
            </div>
          )}

          <form action={lookupAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reference" className="text-sm font-medium">
                Booking reference
              </label>
              <Input
                id="reference"
                name="reference"
                placeholder="00000000-0000-0000-0000-000000000000"
                autoComplete="off"
                spellCheck={false}
                required
              />
              <p className="text-xs text-muted-foreground">
                A long ID that appears in your confirmation email subject line.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email used at checkout
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              View my booking
            </Button>
          </form>

          <div className="flex items-start gap-2 pt-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <span>
              Bookings are private. We only show details after the email and reference match.
            </span>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Lost your reference?{' '}
        <Link href="/contact" className="font-medium text-primary hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
