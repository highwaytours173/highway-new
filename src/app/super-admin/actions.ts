'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { checkSuperAdmin } from './layout';

export async function createAgency(formData: FormData) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const domain = formData.get('domain') as string;

  if (!name || !slug) {
    throw new Error('Name and Slug are required');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('agencies').insert({
    name,
    slug,
    domain,
    status: 'active',
    settings: {
      modules: {
        blog: true,
        upsell: true,
        contact: true,
        reviews: true,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/super-admin');
}

export async function switchAgency(slug: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) {
    throw new Error('Unauthorized');
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_agency_override', slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  revalidatePath('/');
}

export async function resetAgency() {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) {
    throw new Error('Unauthorized');
  }

  const cookieStore = await cookies();
  cookieStore.delete('admin_agency_override');

  revalidatePath('/');
}

import { AgencyModules } from '@/types/agency';

export async function updateAgencyModules(agencyId: string, modules: AgencyModules) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();

  // First fetch existing settings to preserve other keys
  const { data: existing } = await supabase
    .from('agencies')
    .select('settings')
    .eq('id', agencyId)
    .single();
  const currentSettings = existing?.settings || {};

  const { error } = await supabase
    .from('agencies')
    .update({
      settings: {
        ...currentSettings,
        modules: modules,
      },
    })
    .eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
}

// --- Broadcast Actions ---

export async function createBroadcast(formData: FormData) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const message = formData.get('message') as string;
  const variant = formData.get('variant') as string;

  if (!message) throw new Error('Message is required');

  const supabase = await createClient();
  const { error } = await supabase.from('system_broadcasts').insert({
    message,
    variant,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath('/', 'layout'); // Revalidate globally so all admins see it
}

export async function toggleBroadcast(id: string, isActive: boolean) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();
  const { error } = await supabase
    .from('system_broadcasts')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath('/', 'layout');
}

export async function deleteBroadcast(id: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();
  const { error } = await supabase.from('system_broadcasts').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath('/', 'layout');
}
