'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Common country list with flag emojis and demonyms.
 *
 * The value stored is the demonym (e.g. "American") to remain compatible
 * with the existing free-text nationality column and downstream uses.
 * If/when the backend migrates to ISO codes, change `value` to the code.
 */
export const COUNTRY_OPTIONS: { code: string; name: string; demonym: string; flag: string }[] = [
  { code: 'EG', name: 'Egypt', demonym: 'Egyptian', flag: '🇪🇬' },
  { code: 'US', name: 'United States', demonym: 'American', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', demonym: 'British', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', demonym: 'Canadian', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', demonym: 'Australian', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', demonym: 'German', flag: '🇩🇪' },
  { code: 'FR', name: 'France', demonym: 'French', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', demonym: 'Italian', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', demonym: 'Spanish', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', demonym: 'Dutch', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', demonym: 'Belgian', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', demonym: 'Swiss', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', demonym: 'Austrian', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', demonym: 'Swedish', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', demonym: 'Norwegian', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', demonym: 'Danish', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', demonym: 'Finnish', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', demonym: 'Irish', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', demonym: 'Portuguese', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', demonym: 'Greek', flag: '🇬🇷' },
  { code: 'PL', name: 'Poland', demonym: 'Polish', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', demonym: 'Czech', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', demonym: 'Hungarian', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', demonym: 'Romanian', flag: '🇷🇴' },
  { code: 'TR', name: 'Turkey', demonym: 'Turkish', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', demonym: 'Russian', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', demonym: 'Ukrainian', flag: '🇺🇦' },
  { code: 'CN', name: 'China', demonym: 'Chinese', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', demonym: 'Japanese', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', demonym: 'Korean', flag: '🇰🇷' },
  { code: 'IN', name: 'India', demonym: 'Indian', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', demonym: 'Pakistani', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', demonym: 'Bangladeshi', flag: '🇧🇩' },
  { code: 'ID', name: 'Indonesia', demonym: 'Indonesian', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', demonym: 'Malaysian', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', demonym: 'Singaporean', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', demonym: 'Thai', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', demonym: 'Filipino', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', demonym: 'Vietnamese', flag: '🇻🇳' },
  { code: 'AE', name: 'United Arab Emirates', demonym: 'Emirati', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', demonym: 'Saudi', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', demonym: 'Qatari', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', demonym: 'Kuwaiti', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', demonym: 'Bahraini', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', demonym: 'Omani', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', demonym: 'Jordanian', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', demonym: 'Lebanese', flag: '🇱🇧' },
  { code: 'IL', name: 'Israel', demonym: 'Israeli', flag: '🇮🇱' },
  { code: 'MA', name: 'Morocco', demonym: 'Moroccan', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', demonym: 'Tunisian', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', demonym: 'Algerian', flag: '🇩🇿' },
  { code: 'LY', name: 'Libya', demonym: 'Libyan', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', demonym: 'Sudanese', flag: '🇸🇩' },
  { code: 'ZA', name: 'South Africa', demonym: 'South African', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', demonym: 'Nigerian', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', demonym: 'Kenyan', flag: '🇰🇪' },
  { code: 'BR', name: 'Brazil', demonym: 'Brazilian', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', demonym: 'Argentine', flag: '🇦🇷' },
  { code: 'MX', name: 'Mexico', demonym: 'Mexican', flag: '🇲🇽' },
  { code: 'CL', name: 'Chile', demonym: 'Chilean', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', demonym: 'Colombian', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', demonym: 'Peruvian', flag: '🇵🇪' },
  { code: 'NZ', name: 'New Zealand', demonym: 'New Zealander', flag: '🇳🇿' },
];

interface CountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * CountrySelect — native HTML `<select>` for nationality picking.
 *
 * Uses the browser's native dropdown so mobile gets the OS sheet/wheel
 * picker (best possible UX on touch) and desktop gets the standard
 * dropdown with type-to-search built in.
 *
 * Stores the demonym (e.g. "American") so the field value remains
 * compatible with the existing free-text nationality column. Legacy
 * values that don't match any option are preserved as a leading
 * `<option>` so users don't see "—" when editing an old booking.
 */
export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select your country',
  className,
  disabled,
  id,
}: CountrySelectProps) {
  const reactId = useId();
  const selectId = id ?? reactId;

  const matchesKnown = COUNTRY_OPTIONS.some(
    (c) => c.demonym.toLowerCase() === (value ?? '').trim().toLowerCase()
  );
  const showLegacy = !!value && !matchesKnown;

  return (
    <select
      id={selectId}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      aria-label={placeholder}
      className={cn(
        // shadcn Input-equivalent styling so it visually slots in with the rest of the form
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        !value && 'text-muted-foreground',
        className
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {showLegacy && <option value={value}>{value}</option>}
      {COUNTRY_OPTIONS.map((c) => (
        <option key={c.code} value={c.demonym}>
          {c.flag} {c.demonym} — {c.name}
        </option>
      ))}
    </select>
  );
}
