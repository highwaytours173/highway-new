import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'before:absolute before:inset-0 before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:content-[""]',
        'dark:before:via-white/10',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
