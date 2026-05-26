'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Handshake, Loader2, Send, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useChatSession, type ChatHistoryMessage } from '@/hooks/use-chat-session';
import { ChatMessage, ChatThinkingIndicator } from '@/components/concierge/chat-message';
import { ChatInput } from '@/components/concierge/chat-input';
import { sseFetch } from '@/lib/sse-fetch';
import { generateTailorMadeTourAction } from '@/app/actions';
import {
  TailorMadeChatPanel,
  type TailorMadeChatPanelHandle,
} from '@/components/tailor-made/tailor-made-chat-panel';
import { ItineraryDayCard } from '@/components/tailor-made/itinerary-day-card';
import { BookingRequestDialog } from '@/components/tailor-made/booking-request-dialog';
import { cn } from '@/lib/utils';
import type { TourInput, TourOutput } from '@/types/tour-schemas';

interface WalkthroughChatProps {
  agencyId: string;
  agencyName: string;
  agentName: string;
  questions: ResolvedQuestionForClient[];
  /** Number of required questions answered after which the "Generate now" button appears. */
  minRequiredForGenerate?: number;
}

export type ResolvedQuestionForClient = {
  id: string;
  prompt: string;
  field: string;
  type: 'date' | 'number' | 'multi_select' | 'single_select' | 'text';
  required: boolean;
  helperText?: string;
  resolvedOptions?: string[];
};

type WireEvent =
  | { type: 'session'; sessionId: string }
  | { type: 'delta'; chunk: string }
  | { type: 'input_ready'; tourInput: TourInput }
  | { type: 'input_invalid'; reason: string }
  | { type: 'done'; model: string }
  | { type: 'error'; message: string };

type Phase = 'collecting' | 'building' | 'result';

const SUGGESTED_OPENERS = [
  "I'd like a 7-day cultural trip in November",
  'Honeymoon, 5 days, Aswan and Luxor',
  'Family of 4, beach + history, 10 days',
];

export function WalkthroughChat({
  agencyId,
  agencyName,
  agentName,
  questions,
  minRequiredForGenerate = 5,
}: WalkthroughChatProps) {
  const { toast } = useToast();
  // Anchor changes each fresh walkthrough so old chats don't leak.
  const session = useChatSession({ kind: 'tailor-made', anchorHash: 'walkthrough' }, agencyId);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState<Phase>('collecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedTour, setGeneratedTour] = useState<TourOutput | null>(null);
  const [generatedTourInput, setGeneratedTourInput] = useState<TourInput | null>(null);
  const [tourAnchorId, setTourAnchorId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatPanelRef = useRef<TailorMadeChatPanelHandle | null>(null);

  // Greet on first mount if the conversation is empty.
  useEffect(() => {
    if (session.messages.length === 0 && questions.length > 0) {
      const first = questions[0];
      session.append({
        role: 'assistant',
        content: `Hi! I'm ${agentName}. I'll ask a few quick things and put together a custom plan for you. ${first.prompt}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoscroll on new messages / streaming.
  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [session.messages, pending]);

  // Compute progress purely from user-turn count (rough heuristic — exact
  // collection state lives server-side in the LLM context).
  const userTurns = session.messages.filter((m) => m.role === 'user').length;
  const totalQuestions = Math.max(1, questions.length);
  const progress = Math.min(100, Math.round((userTurns / totalQuestions) * 100));
  const canEscape = userTurns >= minRequiredForGenerate && phase === 'collecting';

  // Quick-pick chips are derived from whatever the AI just said, NOT a
  // userTurn-indexed spine position. The AI does clarifying follow-ups, so
  // turn count drifts from the spine; parsing the last message keeps chips
  // tied to what's actually being asked.
  const lastAssistantMessage = [...session.messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content.trim().length > 0);
  const inlineOptions =
    phase === 'collecting' && lastAssistantMessage
      ? extractInlineOptions(lastAssistantMessage.content)
      : [];

  const sendTurn = useCallback(
    async (text: string, options: { triggerGenerateNow?: boolean } = {}) => {
      const trimmed = text.trim();
      if (!trimmed && !options.triggerGenerateNow) return;
      if (pending) return;
      setErrorMessage(null);
      setInput('');

      // Append the visitor turn (or a synthetic one for the generate-now path).
      session.append({
        role: 'user',
        content: trimmed || '[generate my plan now]',
      });

      const wireMessages = [...session.messages, { role: 'user' as const, content: trimmed || '[generate my plan now]' }]
        .filter(
          (m): m is ChatHistoryMessage & { role: 'user' | 'assistant' } =>
            m.role === 'user' || m.role === 'assistant'
        )
        .map((m) => ({ role: m.role, content: m.content }));

      setPending(true);
      const placeholder = session.append({ role: 'assistant', content: '' });
      let textBuffer = '';
      let tourInputForGenerate: TourInput | null = null;
      let sawError = false;

      // Strip the JSON sentinel from any visible buffer — last-line defense
      // against the server leaking it (the server already strips it, but if
      // a future bug regresses we don't want raw JSON in the chat bubble).
      const scrubSentinel = (text: string): string => {
        const idx = text.indexOf('<READY>');
        return idx >= 0 ? text.slice(0, idx).trimEnd() : text;
      };

      const handleEvent = (event: WireEvent) => {
        switch (event.type) {
          case 'session':
            session.setServerSessionId(event.sessionId);
            break;
          case 'delta':
            textBuffer += event.chunk;
            session.replace(placeholder.id, { content: scrubSentinel(textBuffer) });
            break;
          case 'input_ready':
            tourInputForGenerate = event.tourInput;
            break;
          case 'input_invalid':
            // Non-fatal; LLM may retry on next turn.
            console.warn('Walkthrough input_invalid:', event.reason);
            break;
          case 'done':
            session.replace(placeholder.id, {
              content:
                scrubSentinel(textBuffer).trim() || 'Got it — putting your plan together…',
            });
            break;
          case 'error':
            sawError = true;
            session.replace(placeholder.id, {
              content: event.message,
              meta: { error: true },
            });
            setErrorMessage(event.message);
            break;
        }
      };

      try {
        await sseFetch<WireEvent>(
          '/api/tailor-made/walkthrough',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.serverSessionId ?? undefined,
              messages: wireMessages,
              triggerGenerateNow: options.triggerGenerateNow ?? false,
            }),
          },
          handleEvent
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error.';
        session.replace(placeholder.id, {
          content: message,
          meta: { error: true },
        });
        setErrorMessage(message);
        setPending(false);
        return;
      }

      setPending(false);

      // If the gateway captured a valid TourInput, transition to result.
      if (tourInputForGenerate && !sawError) {
        await generateAndShow(tourInputForGenerate);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending, session]
  );

  const generateAndShow = useCallback(async (tourInput: TourInput) => {
    setPhase('building');
    try {
      const response = await generateTailorMadeTourAction(tourInput);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to generate tour');
      }
      setGeneratedTourInput(tourInput);
      setGeneratedTour(response.data);
      setTourAnchorId(crypto.randomUUID());
      setPhase('result');
      toast({
        title: 'Your trip is ready!',
        description: 'Review the plan below and chat with us to refine it.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setErrorMessage(message);
      setPhase('collecting');
      toast({
        title: 'Could not build your plan',
        description: message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleSend = () => void sendTurn(input);
  const handleChipClick = (option: string) => void sendTurn(option);
  const handleGenerateNow = () => void sendTurn('I\'m ready — please generate my plan now.', { triggerGenerateNow: true });
  const handleStartOver = () => {
    if (!confirm('Start a fresh walkthrough? Your current plan will be cleared.')) return;
    session.clear();
    setGeneratedTour(null);
    setGeneratedTourInput(null);
    setTourAnchorId(null);
    setPhase('collecting');
    setErrorMessage(null);
  };

  const handleRequestBook = () => setBookingOpen(true);
  const handleNegotiate = () => {
    chatPanelRef.current?.prefillInput(
      `Can we discuss the price for this itinerary? Here's what would work for me: `
    );
  };

  // ── Result phase ─────────────────────────────────────────────────────
  if (phase === 'result' && generatedTour && generatedTourInput && tourAnchorId) {
    return (
      <div className="space-y-6 animate-slide-up">
        <GeneratedTourCard
          tour={generatedTour}
          onStartOver={handleStartOver}
          onRequestBook={handleRequestBook}
          onNegotiate={handleNegotiate}
        />
        <TailorMadeChatPanel
          ref={chatPanelRef}
          agencyId={agencyId}
          anchorId={tourAnchorId}
          itinerary={generatedTour}
          onItineraryRevised={(next) => {
            setGeneratedTour(next);
            toast({ title: 'Plan updated', description: 'Your trip has been revised.' });
          }}
        />
        <BookingRequestDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          tourInput={generatedTourInput}
          tourOutput={generatedTour}
          agencyName={agencyName}
        />
      </div>
    );
  }

  // ── Collecting / building phases ─────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Transcript */}
      <div
        ref={scrollerRef}
        className="min-h-[320px] max-h-[60vh] min-w-0 overflow-y-auto overflow-x-hidden space-y-3 rounded-2xl border bg-muted/20 p-4"
      >
        {session.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} agentName={agentName} />
        ))}
        {pending && <PendingPlaceholder messages={session.messages} agentName={agentName} />}
        {phase === 'building' && <BuildingIndicator agentName={agentName} />}
      </div>

      {/* Option chips parsed from the AI's most recent message — always match
          what was just asked, even when the AI does a clarifying follow-up. */}
      {inlineOptions.length > 0 && (
        <div className="space-y-1.5">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Quick picks
          </p>
          <div className="flex flex-wrap gap-1.5">
            {inlineOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleChipClick(opt)}
                disabled={pending}
                className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested openers when the chat is brand new */}
      {session.messages.length <= 1 && phase === 'collecting' && (
        <div className="space-y-1.5">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Or describe in your own words
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_OPENERS.map((opener) => (
              <button
                key={opener}
                type="button"
                onClick={() => handleChipClick(opener)}
                disabled={pending}
                className="rounded-full border border-dashed bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
              >
                {opener}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSend={handleSend}
        pending={pending || phase !== 'collecting'}
        placeholder="Type your answer, or pick a quick option…"
      />

      {errorMessage && (
        <p className="px-1 text-xs text-destructive">{errorMessage}</p>
      )}

      {/* Progress + escape hatch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bot className="h-3 w-3" />
            <span>
              {userTurns} of {totalQuestions} answered
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <Button
          type="button"
          size="sm"
          variant={canEscape ? 'default' : 'outline'}
          onClick={handleGenerateNow}
          disabled={!canEscape || pending}
          className={cn('shrink-0', !canEscape && 'opacity-60')}
        >
          {phase === 'building' ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Building…
            </>
          ) : (
            <>
              <Wand2 className="mr-1.5 h-4 w-4" />
              Generate my plan now
            </>
          )}
        </Button>
      </div>

      <p className="px-1 text-[10px] text-muted-foreground">
        Messages stay on this device. {!canEscape && `Answer at least ${minRequiredForGenerate} questions to generate your plan early.`}
      </p>
    </div>
  );
}

function PendingPlaceholder({
  messages,
  agentName,
}: {
  messages: ChatHistoryMessage[];
  agentName: string;
}) {
  const last = messages[messages.length - 1];
  const placeholderEmpty =
    last && last.role === 'assistant' && !last.content && (!last.toolCalls || last.toolCalls.length === 0);
  if (!placeholderEmpty) return null;
  return <ChatThinkingIndicator agentName={agentName} />;
}

function BuildingIndicator({ agentName }: { agentName: string }) {
  return (
    <div className="flex w-full justify-start animate-fade-in">
      <div className="flex max-w-[88%] flex-col gap-1 items-start">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>{agentName}</span>
        </div>
        <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3 shadow-sm">
          <span className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Building your custom plan…
          </span>
        </div>
      </div>
    </div>
  );
}

function GeneratedTourCard({
  tour,
  onStartOver,
  onRequestBook,
  onNegotiate,
}: {
  tour: TourOutput;
  onStartOver: () => void;
  onRequestBook: () => void;
  onNegotiate: () => void;
}) {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-primary">{tour.tourName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tour.summary}</p>
        </div>
        <div className="sm:text-right shrink-0">
          <p className="text-xl sm:text-2xl font-bold">
            {tour.totalPrice} {tour.currency}
          </p>
          <p className="text-xs text-muted-foreground">Estimated total</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-semibold">Inclusions</h4>
          <ul className="space-y-0.5 text-xs">
            {tour.inclusions.map((i, idx) => (
              <li key={idx}>• {i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-semibold">Transportation</h4>
          <p className="text-xs">{tour.transportationDetails}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Day by day itinerary</h3>
        {tour.itinerary.map((day) => (
          <ItineraryDayCard key={day.day} day={day} />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t pt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="lg" onClick={onRequestBook}>
            <Send className="mr-2 h-4 w-4" />
            Request to book
          </Button>
          <Button size="lg" variant="secondary" onClick={onNegotiate}>
            <Handshake className="mr-2 h-4 w-4" />
            Negotiate the price
          </Button>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onStartOver}>
            Plan another trip
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print plan
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pull the option list out of the AI's latest message. The system prompt
 * instructs the model to write "Options: A, B, or C" inline for select
 * questions, so this is a reliable anchor that tracks the current question
 * regardless of how many clarifying turns the model took.
 */
function extractInlineOptions(text: string): string[] {
  const match = text.match(/Options?\s*:\s*([^\n]+)/i);
  if (!match) return [];
  const tail = match[1].replace(/[.!?]+\s*$/, '').trim();
  if (!tail) return [];
  const parts = tail
    .split(/\s*(?:,|\bor\b|\band\b)\s*/i)
    .map((p) => p.replace(/^["'`(]+|["'`)]+$/g, '').trim())
    .filter((p) => p.length > 0 && p.length <= 80);
  // Drop trivial duplicates while preserving order.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out.slice(0, 12);
}
