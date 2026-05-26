'use server';

import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { checkAgencyAccess } from '@/lib/supabase/agency-users';
import {
  getTailorMadeConfig,
  upsertTailorMadeConfig,
  type TailorMadeConfigUpdate,
} from '@/lib/supabase/tailor-made-config';
import { generateStructuredWithCopilot } from '@/lib/ai/copilot';
import type {
  TailorMadeConfig,
  WalkthroughField,
  WalkthroughOptionsSource,
  WalkthroughQuestion,
  WalkthroughQuestionType,
} from '@/types/tailor-made';

export type TailorMadeStatus =
  | {
      ok: true;
      copilotConnected: boolean;
      config: TailorMadeConfig;
    }
  | { ok: false; reason: 'unauthorized' | 'agency_not_found' };

export async function getTailorMadeStatus(): Promise<TailorMadeStatus> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, reason: 'unauthorized' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, reason: 'agency_not_found' };

  const config = await getTailorMadeConfig(agency.id);
  return {
    ok: true,
    copilotConnected: Boolean(agency.aiEnabled),
    config,
  };
}

export type UpdateTailorMadeResult =
  | { ok: true; config: TailorMadeConfig }
  | { ok: false; error: string };

// Whitelisted keys the client can update. Anything else is silently dropped.
const ALLOWED_KEYS: ReadonlyArray<keyof TailorMadeConfigUpdate> = [
  'enabled',
  'heroTitle',
  'heroSubtitle',
  'regions',
  'interests',
  'inclusions',
  'accommodationTiers',
  'walkthroughQuestions',
  'walkthroughPersona',
  'outputEnrichment',
  'handlesAccommodation',
  'accommodationNotes',
];

export async function updateTailorMadeConfig(
  patch: TailorMadeConfigUpdate
): Promise<UpdateTailorMadeResult> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, error: 'Unauthorized.' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, error: 'Agency context not found.' };

  const sanitized: TailorMadeConfigUpdate = {};
  for (const key of ALLOWED_KEYS) {
    const value = patch[key];
    if (value === undefined) continue;
    if (key === 'enabled') {
      sanitized.enabled = Boolean(value);
    } else if (key === 'heroTitle' || key === 'heroSubtitle') {
      const s = typeof value === 'string' ? value.trim() : '';
      // Empty strings reset to default; the supabase helper handles default text.
      if (s) sanitized[key] = s.slice(0, key === 'heroTitle' ? 120 : 400);
    } else if (key === 'walkthroughPersona') {
      sanitized.walkthroughPersona = typeof value === 'string' ? value.slice(0, 4000) : '';
    } else if (
      key === 'regions' ||
      key === 'interests' ||
      key === 'inclusions' ||
      key === 'accommodationTiers' ||
      key === 'walkthroughQuestions'
    ) {
      if (Array.isArray(value)) {
        // Hand the array through as-is — the supabase helper does shape
        // validation on read, so anything malformed here will be cleaned
        // on next load. Keeps this action thin.
        sanitized[key] = value as never;
      }
    } else if (key === 'outputEnrichment') {
      if (value && typeof value === 'object') {
        sanitized.outputEnrichment = value as never;
      }
    } else if (key === 'handlesAccommodation') {
      sanitized.handlesAccommodation = Boolean(value);
    } else if (key === 'accommodationNotes') {
      sanitized.accommodationNotes =
        typeof value === 'string' ? value.slice(0, 8000) : '';
    }
  }

  try {
    const config = await upsertTailorMadeConfig(agency.id, sanitized);
    revalidatePath('/admin/ai/tailor-made');
    revalidatePath('/tailor-made');
    return { ok: true, config };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to save tailor-made config.',
    };
  }
}

// ─── "Suggest from my tours" helpers ─────────────────────────────────────────

export type SuggestResult =
  | { ok: true; data: string[] }
  | { ok: false; error: string };

/**
 * Pull values from a Postgres-array column on tours. Filters to the
 * agency's own rows, normalises whitespace, dedupes (case-insensitive),
 * and drops anything already on `exclude`. Returns up to `limit` results
 * sorted alphabetically.
 */
async function suggestFromToursColumn(
  agencyId: string,
  column: 'destinations' | 'type',
  existingLabels: string[]
): Promise<string[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('tours')
    .select(column)
    .eq('agency_id', agencyId);

  if (error) {
    console.error(`Failed to read tours.${column} for suggestions:`, error);
    return [];
  }

  const seenLower = new Set<string>(existingLabels.map((l) => l.toLowerCase().trim()));
  const candidates: string[] = [];

  for (const row of data ?? []) {
    const value = (row as Record<string, unknown>)[column];
    if (!Array.isArray(value)) continue;
    for (const raw of value) {
      const label = typeof raw === 'string' ? raw.trim() : '';
      if (!label) continue;
      const key = label.toLowerCase();
      if (seenLower.has(key)) continue;
      seenLower.add(key);
      candidates.push(label);
    }
  }

  candidates.sort((a, b) => a.localeCompare(b));
  return candidates.slice(0, 50);
}

export async function suggestRegionsFromTours(): Promise<SuggestResult> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, error: 'Unauthorized.' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, error: 'Agency context not found.' };

  const config = await getTailorMadeConfig(agency.id);
  const existing = config.regions.map((o) => o.label);
  const data = await suggestFromToursColumn(agency.id, 'destinations', existing);
  return { ok: true, data };
}

// ─── AI-drafted walkthrough script ───────────────────────────────────────────

const WALKTHROUGH_FIELDS: ReadonlyArray<WalkthroughField> = [
  'arrivalDate',
  'duration',
  'participants',
  'region',
  'interests',
  'accommodation',
  'budget',
  'inclusions',
  'customPreferences',
];

const WALKTHROUGH_TYPES: ReadonlyArray<WalkthroughQuestionType> = [
  'date',
  'number',
  'multi_select',
  'single_select',
  'text',
];

const WALKTHROUGH_SOURCES: ReadonlyArray<WalkthroughOptionsSource> = [
  'regions',
  'interests',
  'inclusions',
  'accommodation_tiers',
];

const DraftedQuestionSchema = z.object({
  prompt: z.string().min(3).max(400),
  field: z.enum(WALKTHROUGH_FIELDS as unknown as [WalkthroughField, ...WalkthroughField[]]),
  type: z.enum(WALKTHROUGH_TYPES as unknown as [WalkthroughQuestionType, ...WalkthroughQuestionType[]]),
  required: z.boolean(),
  helperText: z.string().max(200).optional(),
  optionsSource: z
    .enum(WALKTHROUGH_SOURCES as unknown as [WalkthroughOptionsSource, ...WalkthroughOptionsSource[]])
    .optional(),
  options: z.array(z.string().min(1).max(80)).max(15).optional(),
});

const DraftedScriptSchema = z.object({
  questions: z.array(DraftedQuestionSchema).min(3).max(12),
});

export type DraftWalkthroughInput = {
  tone?: string;
  notes?: string;
};

export type DraftWalkthroughResult =
  | { ok: true; questions: WalkthroughQuestion[] }
  | { ok: false; error: string };

export async function draftWalkthroughWithAi(
  input: DraftWalkthroughInput
): Promise<DraftWalkthroughResult> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, error: 'Unauthorized.' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, error: 'Agency context not found.' };
  if (!agency.aiEnabled) {
    return { ok: false, error: 'Connect Copilot first to draft with AI.' };
  }

  const config = await getTailorMadeConfig(agency.id);

  const tone = (input.tone ?? '').trim().slice(0, 200);
  const notes = (input.notes ?? '').trim().slice(0, 600);

  const systemPrompt = [
    `You are designing a short conversational walkthrough that a travel agency's AI guide will use to collect a custom-trip brief from visitors.`,
    `The agency is "${agency.name}". The walkthrough must be warm, conversational, and feel like a knowledgeable travel friend — not a form.`,
    '',
    'CONSTRAINTS:',
    '- Return between 6 and 9 questions. Cover at least: arrival date, duration, participants, region, interests, accommodation, budget.',
    '- Each question collects ONE field. Use these field ids exactly: arrivalDate, duration, participants, region, interests, accommodation, budget, inclusions, customPreferences.',
    '- For select-type questions (region, interests, accommodation, inclusions), set `optionsSource` to the matching list ("regions", "interests", "inclusions", "accommodation_tiers") rather than inventing custom options.',
    '- Date → use type "date". Numeric (duration, participants) → "number". Region/interests/inclusions → "multi_select". Accommodation → "single_select". Budget + customPreferences → "text".',
    '- Mark arrivalDate, duration, participants, region, interests, accommodation, and budget as required. Inclusions and customPreferences are optional.',
    '- Each prompt is at most 2 sentences, written AS the agency speaking. Avoid robot phrasing like "Please select" or "Specify your".',
    '- Helper text is optional and only used to clarify format (e.g. currency).',
    '',
    'RESPONSE FORMAT (JSON only):',
    '{ "questions": [{ "prompt": "...", "field": "...", "type": "...", "required": true|false, "helperText": "(optional)", "optionsSource": "(optional)", "options": ["(optional custom list)"] }] }',
  ].join('\n');

  const contextLines = [
    `Available option lists the AI guide can reference:`,
    `- regions: ${config.regions.map((o) => o.label).join(', ') || '(none)'}`,
    `- interests: ${config.interests.map((o) => o.label).join(', ') || '(none)'}`,
    `- inclusions: ${config.inclusions.map((o) => o.label).join(', ') || '(none)'}`,
    `- accommodation tiers: ${config.accommodationTiers.map((o) => o.label).join(', ') || '(none)'}`,
  ];

  if (tone) contextLines.push(`Tone preference: ${tone}`);
  if (notes) contextLines.push(`Extra notes from the admin: ${notes}`);

  const userPrompt = [
    contextLines.join('\n'),
    '',
    `Draft a fresh walkthrough script for ${agency.name}. Return the JSON object described above.`,
  ].join('\n');

  try {
    const drafted = await generateStructuredWithCopilot({
      agencyId: agency.id,
      feature: 'chat',
      systemPrompt,
      userPrompt,
      schema: DraftedScriptSchema,
      temperature: 0.6,
    });

    const questions: WalkthroughQuestion[] = drafted.questions.map((q) => ({
      id: randomUUID(),
      prompt: q.prompt.trim(),
      field: q.field,
      type: q.type,
      required: q.required,
      helperText: q.helperText?.trim() || undefined,
      optionsSource: q.optionsSource,
      // Only honour custom `options` when the model didn't pick a source.
      options:
        !q.optionsSource && q.options && q.options.length > 0
          ? q.options.map((o) => o.trim()).filter(Boolean)
          : undefined,
    }));

    return { ok: true, questions };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to draft walkthrough.',
    };
  }
}

export async function suggestInterestsFromTours(): Promise<SuggestResult> {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) return { ok: false, error: 'Unauthorized.' };

  const agency = await getCurrentAgency();
  if (!agency) return { ok: false, error: 'Agency context not found.' };

  const config = await getTailorMadeConfig(agency.id);
  const existing = config.interests.map((o) => o.label);
  // `tours.type` is the categories array (Cultural / Adventure / etc.).
  const data = await suggestFromToursColumn(agency.id, 'type', existing);
  return { ok: true, data };
}
