import { z } from 'zod';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import {
  bumpChatSession,
  getOrCreateChatSession,
  hashIp,
} from '@/lib/supabase/chat-sessions';
import {
  RATE_LIMIT_MESSAGES,
  checkChatRateLimits,
} from '@/lib/ai/chat-rate-limit';
import { redactPii } from '@/lib/ai/redact-pii';
import { runWalkthroughTurn, type WalkthroughEvent } from '@/lib/ai/walkthrough';
import type { ChatMessage } from '@/types/ai-chat';
import type { TourInput } from '@/types/tour-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_HISTORY_MESSAGES = 30;

const bodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .min(1)
    .max(MAX_HISTORY_MESSAGES),
  triggerGenerateNow: z.boolean().optional(),
});

// Wire-format events for the visitor's WalkthroughChat client.
type WireEvent =
  | { type: 'session'; sessionId: string }
  | { type: 'delta'; chunk: string }
  | { type: 'input_ready'; tourInput: TourInput }
  | { type: 'input_invalid'; reason: string }
  | { type: 'done'; model: string }
  | { type: 'error'; message: string };

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function sseEncode(event: WireEvent): Uint8Array {
  const line = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  return new TextEncoder().encode(line);
}

function jsonError(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await request.json();
    parsed = bodySchema.parse(raw);
  } catch (error) {
    return jsonError(400, {
      error: 'invalid_request',
      message: error instanceof Error ? error.message : 'invalid body',
    });
  }

  const agency = await getCurrentAgency();
  if (!agency) return jsonError(400, { error: 'agency_unresolved' });
  if (!agency.aiEnabled) return jsonError(403, { error: 'ai_disabled' });

  const ipHash = hashIp(getClientIp(request));
  const userAgent = request.headers.get('user-agent');
  const session = await getOrCreateChatSession({
    sessionId: parsed.sessionId,
    agencyId: agency.id,
    surface: 'tailor-made',
    ipHash,
    userAgent,
  });

  const limit = await checkChatRateLimits({
    sessionId: session.id,
    ipHash,
    agencyId: agency.id,
  });
  if (!limit.ok) {
    return new Response(
      JSON.stringify({
        error: limit.reason,
        message: RATE_LIMIT_MESSAGES[limit.reason],
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(limit.retryAfterSeconds),
        },
      }
    );
  }

  // PII redaction on user messages.
  const sanitizedMessages: ChatMessage[] = parsed.messages.map((m) =>
    m.role === 'user' ? { ...m, content: redactPii(m.content) } : m
  );

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const safeEnqueue = (event: WireEvent) => {
        if (closed) return;
        try {
          controller.enqueue(sseEncode(event));
        } catch {
          closed = true;
        }
      };

      safeEnqueue({ type: 'session', sessionId: session.id });

      const forward = (event: WalkthroughEvent) => {
        switch (event.type) {
          case 'delta':
            safeEnqueue({ type: 'delta', chunk: event.chunk });
            break;
          case 'input_ready':
            safeEnqueue({ type: 'input_ready', tourInput: event.tourInput });
            break;
          case 'input_invalid':
            safeEnqueue({ type: 'input_invalid', reason: event.reason });
            break;
        }
      };

      try {
        const result = await runWalkthroughTurn({
          agencyId: agency.id,
          agencyName: agency.name,
          sessionId: session.id,
          messages: sanitizedMessages,
          triggerGenerateNow: parsed.triggerGenerateNow ?? false,
          onEvent: forward,
        });
        await bumpChatSession(session.id);
        safeEnqueue({ type: 'done', model: result.model });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        safeEnqueue({ type: 'error', message });
      } finally {
        if (!closed) {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
