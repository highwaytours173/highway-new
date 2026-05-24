import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
      />

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-10 w-10 text-primary" />
      </div>

      <p className="font-mono text-sm font-semibold tracking-widest text-primary">404</p>
      <h1 className="mt-2 font-headline text-4xl font-bold md:text-5xl">
        We can&apos;t find that page
      </h1>
      <p className="mt-3 max-w-lg text-base text-muted-foreground">
        The page you&apos;re looking for has moved, sold out, or never existed. Let&apos;s get
        you back on the road.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back home
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/tours">
            <Search className="mr-2 h-4 w-4" />
            Browse tours
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid w-full max-w-md gap-3 text-left sm:grid-cols-2">
        <Link
          href="/hotels"
          className="rounded-xl border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <p className="text-sm font-semibold">Hotels</p>
          <p className="text-xs text-muted-foreground">Find a place to stay</p>
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <p className="text-sm font-semibold">Contact us</p>
          <p className="text-xs text-muted-foreground">We&apos;re here 24/7</p>
        </Link>
      </div>
    </main>
  );
}
