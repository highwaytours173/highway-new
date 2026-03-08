'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronRight, Sparkles, X } from 'lucide-react';
import { dismissOnboarding } from '@/app/admin/dashboard/actions';

export type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
};

interface GettingStartedProps {
  steps: OnboardingStep[];
}

export function GettingStarted({ steps }: GettingStartedProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const completedCount = steps.filter((s) => s.completed).length;
  const allDone = completedCount === steps.length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const handleDismiss = () => {
    setDismissed(true);
    startTransition(async () => {
      await dismissOnboarding();
    });
  };

  if (dismissed) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Getting Started</CardTitle>
            {allDone ? (
              <Badge variant="default" className="text-xs">
                All done!
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{steps.length} complete
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            onClick={handleDismiss}
            disabled={isPending}
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {allDone
            ? "Your agency is fully set up. You're ready to take bookings!"
            : 'Complete these steps to get your agency up and running.'}
        </CardDescription>
        <Progress value={progress} className="mt-2 h-1.5" />
      </CardHeader>

      <CardContent className="pb-3">
        <ol className="space-y-2">
          {steps.map((step, index) => (
            <li key={step.id}>
              <a
                href={step.completed ? undefined : step.href}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  step.completed
                    ? 'border-transparent bg-muted/40 text-muted-foreground'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5'
                }`}
                aria-disabled={step.completed}
              >
                <span className="shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={`font-medium leading-tight ${
                      step.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    <span className="mr-1 text-muted-foreground">{index + 1}.</span>
                    {step.label}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{step.description}</span>
                </span>
                {!step.completed && (
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </a>
            </li>
          ))}
        </ol>
      </CardContent>

      {allDone && (
        <CardFooter>
          <Button onClick={handleDismiss} disabled={isPending} className="w-full">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            I&apos;m ready — dismiss this guide
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
