'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentAgencyId } from '@/lib/supabase/agencies';
import { redirect } from 'next/navigation';

export async function checkAgencyAccess() {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false; // Not logged in
  }

  // Check if user is a member of this agency
  const { data, error } = await supabase
    .from('agency_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('agency_id', agencyId)
    .maybeSingle();

  if (error || !data) {
    console.warn(`User ${user.id} attempted to access agency ${agencyId} without permission.`);
    return false;
  }

  return true;
}

export async function ensureAgencyAccess() {
  const hasAccess = await checkAgencyAccess();
  if (!hasAccess) {
    // If not authorized, redirect to a generic error page or logout
    // For now, redirect to home with error? Or just throw.
    // In a real app, maybe /unauthorized
    redirect('/');
  }
}
