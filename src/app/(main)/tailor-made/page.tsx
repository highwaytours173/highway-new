import React from 'react';
import { redirect } from 'next/navigation';
import { TailorMadePageContent } from './tailor-made-content';
import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/supabase/agency-content';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { getTailorMadeConfig } from '@/lib/supabase/tailor-made-config';
import { getAgencyAiConfig } from '@/lib/supabase/agency-ai-config';
import { resolveWalkthroughQuestions } from '@/lib/ai/walkthrough-prompt';
import type { ResolvedQuestionForClient } from '@/components/tailor-made/walkthrough-chat';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('tailorMade', {
    title: 'Tailor Made',
    description: 'Build a custom itinerary based on your dates, preferences, and budget.',
  });
}

export default async function TailorMadePage() {
  const agency = await getCurrentAgency();
  if (!agency?.aiEnabled) {
    redirect('/tours');
  }
  // Second gate: agencies can independently turn the page off via the
  // Tailor-Made Studio without disconnecting Copilot entirely.
  const [tailorMade, aiConfig] = await Promise.all([
    getTailorMadeConfig(agency.id),
    getAgencyAiConfig(agency.id),
  ]);
  if (!tailorMade.enabled) {
    redirect('/tours');
  }

  // Resolve options once on the server so the client can render chips
  // without re-running the resolution logic.
  const resolved = resolveWalkthroughQuestions(tailorMade);
  const questionsForClient: ResolvedQuestionForClient[] = resolved.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    field: q.field,
    type: q.type,
    required: q.required,
    helperText: q.helperText,
    resolvedOptions: q.resolvedOptions,
  }));

  return (
    <TailorMadePageContent
      agencyId={agency.id}
      agencyName={agency.name}
      agentName={aiConfig.agentName || 'Concierge'}
      heroTitle={tailorMade.heroTitle}
      heroSubtitle={tailorMade.heroSubtitle}
      questions={questionsForClient}
    />
  );
}
