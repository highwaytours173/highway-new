import type { AgencyAiConfig } from '@/types/ai-chat';
import type { TailorMadeConfig, WalkthroughQuestion } from '@/types/tailor-made';

type BuildWalkthroughPromptArgs = {
  agencyName: string;
  agentName: string;
  aiConfig: AgencyAiConfig;
  tailorMadeConfig: TailorMadeConfig;
  resolvedQuestions: ResolvedQuestion[];
  triggerGenerateNow: boolean;
};

export type ResolvedQuestion = WalkthroughQuestion & {
  /** Fully-resolved option labels (after walking `optionsSource` against the config). */
  resolvedOptions?: string[];
};

/**
 * Resolve `optionsSource` references on each walkthrough question into the
 * concrete option labels admins picked in the option-list editors.
 *
 * Also drops accommodation-related questions when the agency has signalled
 * it doesn't handle accommodation booking — the AI guide shouldn't pitch
 * comfort tiers the agency can't actually book.
 */
export function resolveWalkthroughQuestions(
  config: TailorMadeConfig
): ResolvedQuestion[] {
  return config.walkthroughQuestions
    .filter((q) => config.handlesAccommodation || q.field !== 'accommodation')
    .map((q) => {
      if (q.options && q.options.length > 0) {
        return { ...q, resolvedOptions: q.options };
      }
      if (!q.optionsSource) return q;
      const source =
        q.optionsSource === 'regions'
          ? config.regions
          : q.optionsSource === 'interests'
            ? config.interests
            : q.optionsSource === 'inclusions'
              ? config.inclusions
              : config.accommodationTiers;
      return { ...q, resolvedOptions: source.map((o) => o.label) };
    });
}

function questionToBulletLines(q: ResolvedQuestion, index: number): string {
  const lines: string[] = [
    `${index + 1}. [${q.field}] (${q.type}${q.required ? ', required' : ', optional'})`,
    `   PROMPT: ${q.prompt}`,
  ];
  if (q.resolvedOptions && q.resolvedOptions.length > 0) {
    lines.push(`   OPTIONS: ${q.resolvedOptions.join(', ')}`);
  }
  if (q.helperText) lines.push(`   HELPER: ${q.helperText}`);
  return lines.join('\n');
}

export function buildWalkthroughSystemPrompt({
  agencyName,
  agentName,
  aiConfig,
  tailorMadeConfig,
  resolvedQuestions,
  triggerGenerateNow,
}: BuildWalkthroughPromptArgs): string {
  const safeAgency = agencyName?.trim() || 'this agency';
  const sections: string[] = [];

  sections.push(
    `You are ${agentName || 'Concierge'}, ${safeAgency}'s tailor-made trip planner. Your ONLY job in this conversation is to collect a short brief from the visitor by walking them through the SPINE below, then emit a single JSON sentinel.`
  );

  sections.push(
    `IDENTITY: You speak AS ${safeAgency}. Never identify as an AI or platform. The visitor is talking to ${safeAgency}, full stop.`
  );

  if (aiConfig.personaPrompt.trim()) {
    sections.push(`AGENCY PERSONA:\n${aiConfig.personaPrompt.trim()}`);
  }

  if (tailorMadeConfig.walkthroughPersona.trim()) {
    sections.push(
      `WALKTHROUGH PERSONA (tailor-made specific tone):\n${tailorMadeConfig.walkthroughPersona.trim()}`
    );
  }

  if (aiConfig.knowledgeText.trim()) {
    sections.push(`WHAT ${safeAgency.toUpperCase()} KNOWS:\n${aiConfig.knowledgeText.trim()}`);
  }

  const spineLines = resolvedQuestions.map(questionToBulletLines).join('\n');
  sections.push(`SPINE — questions to collect in order:\n${spineLines}`);

  const rules: string[] = [
    'RULES:',
    '- Ask ONE spine question at a time. Move to the next once answered.',
    "- If an answer is ambiguous or thin, ask AT MOST one clarifying follow-up before moving on. Don't grill.",
    '- For select-type questions, mention the options inline so visitors without chip UI know what\'s possible. Example: "We have Cairo & Giza, Luxor & Aswan, or the Red Sea — any of those grab you?"',
    '- Keep replies SHORT — 1-2 sentences. Conversational, warm.',
    '- NEVER invent tour names, prices, dates, or policies. Your job is collection, not creation.',
    "- If the visitor goes off-topic, gently redirect: \"I'll get you set up — let's stay focused on your trip so I can put together the best plan.\"",
  ];

  if (!tailorMadeConfig.handlesAccommodation) {
    rules.push(
      "- ACCOMMODATION: this agency does NOT book hotels. NEVER ask about hotel comfort tiers, star ratings, or accommodation preferences. If the visitor brings it up, say something like \"we focus on tours and experiences — you'll arrange your own stay\" and move on. In the <READY> JSON, set `accommodation` to \"Self-arranged by visitor\"."
    );
  } else if (tailorMadeConfig.accommodationNotes.trim()) {
    rules.push(
      `- ACCOMMODATION (we book hotels): when the visitor asks what's available, draw from these notes only — never invent properties:\n${tailorMadeConfig.accommodationNotes.trim()}`
    );
  }

  sections.push(rules.join('\n'));

  sections.push(
    [
      'FINISH SIGNAL — when ALL required questions are answered OR the visitor signals they\'re done ("just generate it", "I\'m ready", "go ahead"):',
      '1. Write ONE short closing sentence (e.g. "Perfect — let me put your trip together!").',
      '2. On the next line, emit exactly this block (no other text after it):',
      '',
      '<READY>',
      '{',
      '  "travelDates": { "arrival": "YYYY-MM-DD", "departure": "YYYY-MM-DD" },',
      '  "region": ["..."],',
      '  "duration": <number of days>,',
      '  "participants": <number of people>,',
      '  "accommodation": "<string>",',
      '  "budget": { "amount": <number>, "currency": "USD" | "EUR" | "GBP" },',
      '  "inclusions": ["..."],',
      '  "interests": ["..."],',
      '  "customPreferences": "<string, may be empty>"',
      '}',
      '</READY>',
      '',
      'For unanswered optional fields use sensible defaults (empty arrays, USD currency, "" for customPreferences). For unanswered REQUIRED fields, derive the best possible value from the conversation — never leave them empty. departure = arrival + duration. After the </READY>, output nothing else.',
    ].join('\n')
  );

  if (triggerGenerateNow) {
    sections.push(
      'URGENT: The visitor just pressed "Generate my plan now". They have provided what they want to provide. Emit the <READY> block on your next turn using whatever you have collected, plus sensible defaults for missing fields.'
    );
  }

  return sections.join('\n\n');
}
