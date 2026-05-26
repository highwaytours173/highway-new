import {
  COPILOT_REQUEST_HEADERS,
  clearCopilotBearerCache,
  getCopilotEndpointForAgency,
} from '@/lib/ai/copilot-auth';
import { modelsForFeature } from '@/lib/ai/models';
import { getAgencyAiConfig } from '@/lib/supabase/agency-ai-config';
import { getTailorMadeConfig } from '@/lib/supabase/tailor-made-config';
import { recordAuditEvent } from '@/lib/supabase/chat-sessions';
import {
  buildWalkthroughSystemPrompt,
  resolveWalkthroughQuestions,
  type ResolvedQuestion,
} from '@/lib/ai/walkthrough-prompt';
import { consumeChatStream } from '@/lib/ai/chat-stream-parser';
import { TourInputSchema, type TourInput } from '@/types/tour-schemas';
import type { ChatMessage } from '@/types/ai-chat';

const READY_OPEN = '<READY>';
const READY_CLOSE = '</READY>';

export type WalkthroughEvent =
  | { type: 'delta'; chunk: string }
  | { type: 'input_ready'; tourInput: TourInput }
  | { type: 'input_invalid'; reason: string };

export type RunWalkthroughTurnInput = {
  agencyId: string;
  agencyName: string;
  sessionId: string;
  messages: ChatMessage[];
  triggerGenerateNow: boolean;
  models?: string[];
  onEvent?: (event: WalkthroughEvent) => void;
};

export type RunWalkthroughTurnResult = {
  /** Full assistant text (excluding any <READY>...</READY> sentinel block). */
  assistantText: string;
  /** Resolved + validated TourInput if a <READY> block was emitted and parsed cleanly. */
  tourInput: TourInput | null;
  /** Snapshot of the spine the LLM was working from — useful for client UI. */
  resolvedQuestions: ResolvedQuestion[];
  model: string;
};

type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function toOpenAiMessages(messages: ChatMessage[], systemPrompt: string): OpenAiMessage[] {
  const out: OpenAiMessage[] = [{ role: 'system', content: systemPrompt }];
  for (const m of messages) {
    if (m.role === 'user' || m.role === 'assistant' || m.role === 'system') {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

async function streamWalkthroughOnce(
  agencyId: string,
  body: { model: string; messages: OpenAiMessage[]; temperature?: number },
  onVisibleDelta: (chunk: string) => void
): Promise<{ assistantText: string; readyPayload: string | null }> {
  const endpoint = await getCopilotEndpointForAgency(agencyId);
  const response = await fetch(`${endpoint.apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${endpoint.bearer}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...COPILOT_REQUEST_HEADERS,
    },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (response.status === 401 || response.status === 403) {
    clearCopilotBearerCache(agencyId);
    const raw = await response.text();
    throw new Error(`Copilot auth rejected (${body.model}) - ${raw}`);
  }
  if (!response.ok || !response.body) {
    const raw = response.body ? await response.text() : '';
    throw new Error(`Copilot walkthrough failed (${body.model}) - ${raw || response.status}`);
  }

  // We pipe deltas to the visitor IN REAL TIME, but the moment we spot the
  // `<READY>` opener we stop emitting and start buffering. The rest of the
  // stream is the JSON sentinel — internal-only.
  //
  // `fullBuffer` is the authoritative cumulative response. `flushedCount`
  // tracks how many of its leading characters we've already streamed to the
  // visitor — it's a pure cursor, NOT a separate text store. Mixing the two
  // (e.g. `visibleBuffer + event.chunk`) drops held-back tail bytes whenever
  // a chunk lands without flushing, which is what corrupted the visible text
  // and let the JSON sentinel leak in the first place.
  let fullBuffer = '';
  let flushedCount = 0;
  let stoppedStreaming = false;

  await consumeChatStream(response.body, (event) => {
    if (event.type !== 'content_delta') return;
    fullBuffer += event.chunk;

    if (stoppedStreaming) return;

    const idx = fullBuffer.indexOf(READY_OPEN);
    if (idx >= 0) {
      if (idx > flushedCount) {
        onVisibleDelta(fullBuffer.slice(flushedCount, idx));
        flushedCount = idx;
      }
      stoppedStreaming = true;
      return;
    }

    // Defensive: the chunk could end with a partial `<READY` prefix. Hold the
    // last (READY_OPEN.length - 1) bytes back until the next chunk so we
    // never flush bytes we might have to retract.
    const safeTail = fullBuffer.length - (READY_OPEN.length - 1);
    if (safeTail > flushedCount) {
      onVisibleDelta(fullBuffer.slice(flushedCount, safeTail));
      flushedCount = safeTail;
    }
  });

  // Stream's done. Flush any held-back tail only when we never saw a <READY>
  // tag — if we did, everything past it is the sentinel block and must NOT
  // hit the visitor.
  if (!stoppedStreaming && fullBuffer.length > flushedCount) {
    onVisibleDelta(fullBuffer.slice(flushedCount));
    flushedCount = fullBuffer.length;
  }

  // Extract the sentinel payload if present.
  let readyPayload: string | null = null;
  const openIdx = fullBuffer.indexOf(READY_OPEN);
  const closeIdx = fullBuffer.indexOf(READY_CLOSE, openIdx >= 0 ? openIdx : 0);
  if (openIdx >= 0 && closeIdx > openIdx) {
    readyPayload = fullBuffer.slice(openIdx + READY_OPEN.length, closeIdx).trim();
  }

  // Belt + suspenders: even if the streaming detection above missed the
  // sentinel for any reason, the assistantText we return MUST NOT contain
  // it. Truncate at the opener if it slipped through.
  const visibleText = openIdx >= 0 ? fullBuffer.slice(0, openIdx) : fullBuffer;

  return {
    assistantText: visibleText.trim(),
    readyPayload,
  };
}

function tryParseTourInput(rawJson: string): TourInput | null {
  try {
    // Strip code-fences if the model wrapped its JSON.
    const cleaned = rawJson
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    const result = TourInputSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

export async function runWalkthroughTurn(
  input: RunWalkthroughTurnInput
): Promise<RunWalkthroughTurnResult> {
  const [aiConfig, tailorMadeConfig] = await Promise.all([
    getAgencyAiConfig(input.agencyId),
    getTailorMadeConfig(input.agencyId),
  ]);

  const resolvedQuestions = resolveWalkthroughQuestions(tailorMadeConfig);
  const systemPrompt = buildWalkthroughSystemPrompt({
    agencyName: input.agencyName,
    agentName: aiConfig.agentName,
    aiConfig,
    tailorMadeConfig,
    resolvedQuestions,
    triggerGenerateNow: input.triggerGenerateNow,
  });

  const candidateModels =
    input.models && input.models.length > 0 ? input.models : modelsForFeature('chat');
  const failures: string[] = [];

  // Audit the inbound message.
  const lastUser = [...input.messages].reverse().find((m) => m.role === 'user');
  if (lastUser) {
    await recordAuditEvent({
      sessionId: input.sessionId,
      agencyId: input.agencyId,
      eventType: 'message_in',
      resultSummary: lastUser.content.slice(0, 200),
    });
  }

  for (const model of candidateModels) {
    try {
      const openAiMessages = toOpenAiMessages(input.messages, systemPrompt);

      const { assistantText, readyPayload } = await streamWalkthroughOnce(
        input.agencyId,
        { model, messages: openAiMessages, temperature: 0.55 },
        (chunk) => input.onEvent?.({ type: 'delta', chunk })
      );

      let tourInput: TourInput | null = null;
      if (readyPayload) {
        tourInput = tryParseTourInput(readyPayload);
        if (tourInput) {
          // Force accommodation to "Self-arranged" when the agency doesn't
          // handle hotel bookings — guards against an LLM hallucination
          // slipping a tier through despite the prompt rule.
          if (!tailorMadeConfig.handlesAccommodation) {
            tourInput = { ...tourInput, accommodation: 'Self-arranged by visitor' };
          }
          input.onEvent?.({ type: 'input_ready', tourInput });
        } else {
          input.onEvent?.({
            type: 'input_invalid',
            reason: 'AI emitted a brief but it failed validation. Will retry on next turn.',
          });
        }
      }

      await recordAuditEvent({
        sessionId: input.sessionId,
        agencyId: input.agencyId,
        eventType: 'message_out',
        resultSummary: tourInput
          ? `walkthrough_ready model=${model}`
          : `walkthrough_turn model=${model} chars=${assistantText.length}`,
      });

      return { assistantText, tourInput, resolvedQuestions, model };
    } catch (err) {
      failures.push(`${model}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await recordAuditEvent({
    sessionId: input.sessionId,
    agencyId: input.agencyId,
    eventType: 'error',
    resultSummary: failures.join(' | '),
  });
  throw new Error(`All walkthrough models failed. ${failures.join(' | ')}`);
}
