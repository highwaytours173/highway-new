'use client';

import { useLanguage } from '@/hooks/use-language';
import {
  WalkthroughChat,
  type ResolvedQuestionForClient,
} from '@/components/tailor-made/walkthrough-chat';

interface TailorMadePageContentProps {
  agencyId: string;
  agencyName: string;
  agentName: string;
  /** Hero title from the agency's Tailor-Made Studio. Falls back to the i18n string. */
  heroTitle?: string;
  /** Hero subtitle from the agency's Tailor-Made Studio. Falls back to the i18n string. */
  heroSubtitle?: string;
  questions: ResolvedQuestionForClient[];
}

export function TailorMadePageContent({
  agencyId,
  agencyName,
  agentName,
  heroTitle,
  heroSubtitle,
  questions,
}: TailorMadePageContentProps) {
  const { t } = useLanguage();

  const resolvedTitle = heroTitle?.trim() || t('tailor.title');
  const resolvedSubtitle = heroSubtitle?.trim() || t('tailor.subtitle');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-transparent py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold mb-6 text-primary">
            {resolvedTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {resolvedSubtitle}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-card border rounded-2xl shadow-xl p-4 md:p-6 max-w-4xl mx-auto">
          <WalkthroughChat
            agencyId={agencyId}
            agencyName={agencyName}
            agentName={agentName}
            questions={questions}
          />
        </div>
      </div>
    </div>
  );
}
