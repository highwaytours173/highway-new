'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentAgencyId } from '@/lib/supabase/agencies';
import { revalidatePath } from 'next/cache';

export async function dismissOnboarding() {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  // Fetch current settings and merge the flag in
  const { data: row } = await supabase
    .from('agencies')
    .select('settings')
    .eq('id', agencyId)
    .maybeSingle();

  const currentSettings = (row?.settings as Record<string, unknown>) ?? {};

  await supabase
    .from('agencies')
    .update({ settings: { ...currentSettings, onboarding_dismissed: true } })
    .eq('id', agencyId);

  revalidatePath('/admin/dashboard');
}
