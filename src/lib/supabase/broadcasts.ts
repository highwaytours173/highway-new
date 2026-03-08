import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type SystemBroadcast = {
  id: string;
  message: string;
  variant: 'info' | 'warning' | 'destructive' | 'success';
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
};

export const getActiveBroadcasts = cache(async (): Promise<SystemBroadcast[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('system_broadcasts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching broadcasts:', error);
    return [];
  }

  return data as SystemBroadcast[];
});

export const getAllBroadcasts = cache(async (): Promise<SystemBroadcast[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('system_broadcasts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all broadcasts:', error);
    return [];
  }

  return data as SystemBroadcast[];
});
