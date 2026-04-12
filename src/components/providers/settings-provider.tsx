'use client';

import React from 'react';
import type { AgencySettingsData } from '@/lib/supabase/agency-content';

export type AgencySettings = {
  data: AgencySettingsData;
  logo_url: string | null;
};

const SettingsContext = React.createContext<AgencySettings | null>(null);

export function SettingsProvider({
  value,
  children,
}: {
  value: AgencySettings | null;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return React.useContext(SettingsContext);
}
