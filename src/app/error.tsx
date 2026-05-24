'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <main className="relative mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-destructive/10 via-transparent to-amber-500/10"
      />

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <p className="font-mono text-sm font-semibold tracking-widest text-destructive">ERROR</p>
      <h1 className="mt-2 font-headline text-4xl font-bold md:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-lg text-base text-muted-foreground">
        An unexpected error occurred. Try refreshing this page — if the problem persists, our
        team has been notified.
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground/70">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          <RotateCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back home
          </Link>
        </Button>
      </div>
    </main>
  );
}
