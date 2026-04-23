'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

/* ─── Preset palettes ─── */
const PRESETS = [
  {
    name: 'Egyptian Gold',
    primary: '#b8860b',
    secondary: '#f5f0e8',
    accent: '#e67e22',
  },
  {
    name: 'Ocean Blue',
    primary: '#1e40af',
    secondary: '#eff6ff',
    accent: '#06b6d4',
  },
  {
    name: 'Forest',
    primary: '#166534',
    secondary: '#f0fdf4',
    accent: '#facc15',
  },
  {
    name: 'Sunset',
    primary: '#dc2626',
    secondary: '#fef2f2',
    accent: '#f97316',
  },
  {
    name: 'Royal Purple',
    primary: '#7c3aed',
    secondary: '#f5f3ff',
    accent: '#ec4899',
  },
  {
    name: 'Slate',
    primary: '#0f172a',
    secondary: '#f8fafc',
    accent: '#6366f1',
  },
  {
    name: 'Coral',
    primary: '#e11d48',
    secondary: '#fff1f2',
    accent: '#fb923c',
  },
  {
    name: 'Teal',
    primary: '#0d9488',
    secondary: '#f0fdfa',
    accent: '#a855f7',
  },
] as const;

const FONTS = [
  { value: 'Inter', label: 'Inter', style: 'Clean & Modern' },
  { value: 'Playfair Display', label: 'Playfair Display', style: 'Elegant & Luxurious' },
  { value: 'Roboto', label: 'Roboto', style: 'Neutral & Modern' },
  { value: 'Lato', label: 'Lato', style: 'Warm & Friendly' },
  { value: 'Poppins', label: 'Poppins', style: 'Geometric & Bold' },
  { value: 'Merriweather', label: 'Merriweather', style: 'Classic Serif' },
  { value: 'Open Sans', label: 'Open Sans', style: 'Open & Readable' },
  { value: 'Montserrat', label: 'Montserrat', style: 'Strong & Clean' },
] as const;

const RADII = [
  { value: 'none', label: 'Sharp', px: '0' },
  { value: 'sm', label: 'Subtle', px: '0.25rem' },
  { value: 'md', label: 'Medium', px: '0.5rem' },
  { value: 'lg', label: 'Rounded', px: '0.75rem' },
  { value: 'full', label: 'Pill', px: '9999px' },
] as const;

/* ─── Helpers ─── */
function hexToHsl(hex: string) {
  const c = hex.replace('#', '').split('');
  const expanded = c.length === 3 ? [c[0], c[0], c[1], c[1], c[2], c[2]] : c;
  const r = parseInt(expanded[0] + expanded[1], 16) / 255;
  const g = parseInt(expanded[2] + expanded[3], 16) / 255;
  const b = parseInt(expanded[4] + expanded[5], 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function needsLightText(hex: string) {
  const { l } = hexToHsl(hex);
  return l < 55;
}

/* ─── Main Component ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ThemeEditor({ form }: { form: UseFormReturn<any> }) {
  const primary = form.watch('theme.primaryColor') || '#0f172a';
  const secondary = form.watch('theme.secondaryColor') || '#f5f0e8';
  const accent = form.watch('theme.accentColor') || '#e67e22';
  const bodyFont = form.watch('theme.fontFamily') || 'Inter';
  const headingFont = form.watch('theme.headingFont') || 'Playfair Display';
  const radius = form.watch('theme.borderRadius') || 'md';
  const appearance = form.watch('theme.appearance') || 'light';

  const radiusPx = RADII.find((r) => r.value === radius)?.px || '0.5rem';

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    form.setValue('theme.primaryColor', preset.primary, { shouldDirty: true });
    form.setValue('theme.secondaryColor', preset.secondary, { shouldDirty: true });
    form.setValue('theme.accentColor', preset.accent, { shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      {/* ── Preset Palettes ── */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const isActive =
              primary === preset.primary &&
              secondary === preset.secondary &&
              accent === preset.accent;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:bg-muted/50',
                  isActive && 'border-foreground bg-muted/50 ring-1 ring-foreground/10'
                )}
              >
                <div className="flex -space-x-1">
                  <span
                    className="h-6 w-6 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span
                    className="h-6 w-6 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.accent }}
                  />
                  <span
                    className="h-6 w-6 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs font-medium truncate">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Color Controls ── */}
      <div className="grid gap-6 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="theme.primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="h-10 w-12 cursor-pointer rounded-lg border p-1"
                  />
                </FormControl>
                <Input
                  {...field}
                  placeholder="#0f172a"
                  className="flex-1 font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>
              <FormDescription>Buttons, links &amp; navigation.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme.secondaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Color</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="h-10 w-12 cursor-pointer rounded-lg border p-1"
                  />
                </FormControl>
                <Input
                  {...field}
                  placeholder="#f5f0e8"
                  className="flex-1 font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>
              <FormDescription>Backgrounds &amp; subtle areas.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme.accentColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accent Color</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="h-10 w-12 cursor-pointer rounded-lg border p-1"
                  />
                </FormControl>
                <Input
                  {...field}
                  placeholder="#e67e22"
                  className="flex-1 font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>
              <FormDescription>Highlights &amp; badges.</FormDescription>
            </FormItem>
          )}
        />
      </div>

      {/* ── Typography ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="theme.fontFamily"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Font</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span className="flex items-center gap-2">
                        {f.label}
                        <span className="text-xs text-muted-foreground">— {f.style}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Main text throughout the site.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme.headingFont"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heading Font</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span className="flex items-center gap-2">
                        {f.label}
                        <span className="text-xs text-muted-foreground">— {f.style}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Titles &amp; section headings.</FormDescription>
            </FormItem>
          )}
        />
      </div>

      {/* ── Border Radius ── */}
      <FormField
        control={form.control}
        name="theme.borderRadius"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Corner Roundness</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-3"
              >
                {RADII.map((r) => (
                  <Label
                    key={r.value}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:bg-muted/50',
                      field.value === r.value &&
                        'border-foreground bg-muted/50 ring-1 ring-foreground/10'
                    )}
                  >
                    <div
                      className="h-10 w-16 border-2 border-foreground/30"
                      style={{ borderRadius: r.px }}
                    />
                    <RadioGroupItem value={r.value} className="sr-only" />
                    <span className="text-xs font-medium">{r.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {/* ── Appearance ── */}
      <FormField
        control={form.control}
        name="theme.appearance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Appearance</FormLabel>
            <FormControl>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-3">
                <Label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-all hover:bg-muted/50',
                    field.value === 'light' &&
                      'border-foreground bg-muted/50 ring-1 ring-foreground/10'
                  )}
                >
                  <RadioGroupItem value="light" className="sr-only" />
                  <Sun className="h-4 w-4" />
                  <span className="text-sm font-medium">Light</span>
                </Label>
                <Label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-all hover:bg-muted/50',
                    field.value === 'dark' &&
                      'border-foreground bg-muted/50 ring-1 ring-foreground/10'
                  )}
                >
                  <RadioGroupItem value="dark" className="sr-only" />
                  <Moon className="h-4 w-4" />
                  <span className="text-sm font-medium">Dark</span>
                </Label>
              </RadioGroup>
            </FormControl>
            <FormDescription>Controls the default colour scheme for visitors.</FormDescription>
          </FormItem>
        )}
      />

      {/* ── Live Preview ── */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
        <div
          className="overflow-hidden border rounded-xl"
          style={{
            backgroundColor: appearance === 'dark' ? '#1a1a2e' : secondary,
            color: appearance === 'dark' ? '#e5e5e5' : '#1a1a1a',
          }}
        >
          {/* Preview header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: primary }}
          >
            <span
              className="font-bold text-sm"
              style={{
                fontFamily: `${headingFont}, serif`,
                color: needsLightText(primary) ? '#fff' : '#1a1a1a',
              }}
            >
              Your Agency
            </span>
            <div className="flex gap-3">
              {['Home', 'Tours', 'Contact'].map((l) => (
                <span
                  key={l}
                  className="text-xs"
                  style={{
                    fontFamily: `${bodyFont}, sans-serif`,
                    color: needsLightText(primary) ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)',
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          {/* Preview body */}
          <div className="p-5 space-y-3">
            <h3 className="text-lg font-bold" style={{ fontFamily: `${headingFont}, serif` }}>
              Discover Amazing Tours
            </h3>
            <p className="text-sm opacity-70" style={{ fontFamily: `${bodyFont}, sans-serif` }}>
              Explore the best destinations with expert guides and unforgettable experiences.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: primary,
                  color: needsLightText(primary) ? '#fff' : '#1a1a1a',
                  borderRadius: radiusPx,
                }}
              >
                Book Now
              </span>
              <span
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: accent,
                  color: needsLightText(accent) ? '#fff' : '#1a1a1a',
                  borderRadius: radiusPx,
                }}
              >
                20% OFF
              </span>
              <span
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium border"
                style={{
                  borderRadius: radiusPx,
                  borderColor: appearance === 'dark' ? '#444' : '#ddd',
                }}
              >
                Learn More
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
