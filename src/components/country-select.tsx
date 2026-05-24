'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
 * CountrySelect — typeahead-friendly country picker.
 *
 * Stores the demonym (e.g. "American") as the field value so it slots into
 * the existing nationality column without a backend migration. Free-text
 * entries from legacy bookings still display fine (we just look up the
 * matching option for the flag/label, or fall back to the raw string).
 */
export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select country',
  className,
  disabled,
  id,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const buttonId = id ?? reactId;

  const selected = useMemo(() => {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    return (
      COUNTRY_OPTIONS.find(
        (c) =>
          c.demonym.toLowerCase() === v ||
          c.name.toLowerCase() === v ||
          c.code.toLowerCase() === v
      ) ?? null
    );
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={buttonId}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <span className="text-base leading-none" aria-hidden>
                  {selected.flag}
                </span>
                <span className="truncate">{selected.demonym}</span>
              </>
            ) : value ? (
              <span className="truncate">{value}</span>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(value, search) => {
            // Allow searching by country name, demonym, or code
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRY_OPTIONS.map((c) => {
                const isSelected = selected?.code === c.code;
                return (
                  <CommandItem
                    key={c.code}
                    value={`${c.name} ${c.demonym} ${c.code}`}
                    onSelect={() => {
                      onChange?.(c.demonym);
                      setOpen(false);
                    }}
                  >
                    <span className="text-base leading-none mr-2" aria-hidden>
                      {c.flag}
                    </span>
                    <span className="flex-1 truncate">{c.demonym}</span>
                    <span className="text-xs text-muted-foreground ml-2 truncate">
                      {c.name}
                    </span>
                    {isSelected && <Check className="ml-2 h-4 w-4" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
