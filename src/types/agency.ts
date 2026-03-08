export type AgencyModules = {
  tours?: boolean;
  hotels?: boolean;
  blog?: boolean;
  upsell?: boolean;
  contact?: boolean;
  reviews?: boolean;
  maintenance_mode?: boolean;
};

export type AgencySettings = {
  tier?: string;
  onboarding_dismissed?: boolean;
  modules?: AgencyModules;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logoUrl?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
};

export type Agency = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings: AgencySettings;
  status: 'active' | 'suspended';
  createdAt: string;
};

export type AgencyUser = {
  id: string;
  userId: string;
  agencyId: string;
  role: 'owner' | 'admin' | 'editor';
  createdAt: string;
};
