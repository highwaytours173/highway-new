import { ensureAgencyAccess } from '@/lib/supabase/agency-users';
import { StudioClient } from './studio-client';

export const dynamic = 'force-dynamic';

export default async function TailorMadeStudioPage() {
  await ensureAgencyAccess();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tailor-Made Studio</h2>
        <p className="text-muted-foreground">
          Configure how visitors plan custom trips. Toggle the page on or off, tweak the hero
          copy, and (in the next sprints) author the walkthrough questions and option lists.
        </p>
      </div>
      <StudioClient />
    </div>
  );
}
