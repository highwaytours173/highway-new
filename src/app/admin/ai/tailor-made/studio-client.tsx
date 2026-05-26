'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Eye, EyeOff, Loader2, Plug, Sparkles, Wand2 } from 'lucide-react';
import {
  getTailorMadeStatus,
  suggestInterestsFromTours,
  suggestRegionsFromTours,
  updateTailorMadeConfig,
} from './actions';
import type {
  OutputEnrichment,
  TailorMadeConfig,
  TailorMadeOption,
  WalkthroughQuestion,
} from '@/types/tailor-made';
import type { TailorMadeConfigUpdate } from '@/lib/supabase/tailor-made-config';
import { OptionListEditor } from '@/components/admin/tailor-made/option-list-editor';
import { SuggestOptionsDialog } from '@/components/admin/tailor-made/suggest-options-dialog';
import { WalkthroughScriptEditor } from '@/components/admin/tailor-made/walkthrough-script-editor';
import { DraftWalkthroughDialog } from '@/components/admin/tailor-made/draft-walkthrough-dialog';

type FormState = {
  enabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  regions: TailorMadeOption[];
  interests: TailorMadeOption[];
  inclusions: TailorMadeOption[];
  accommodationTiers: TailorMadeOption[];
  walkthroughQuestions: WalkthroughQuestion[];
  walkthroughPersona: string;
  outputEnrichment: OutputEnrichment;
  handlesAccommodation: boolean;
  accommodationNotes: string;
};

function configToForm(c: TailorMadeConfig): FormState {
  return {
    enabled: c.enabled,
    heroTitle: c.heroTitle,
    heroSubtitle: c.heroSubtitle,
    regions: c.regions.map((o) => ({ ...o })),
    interests: c.interests.map((o) => ({ ...o })),
    inclusions: c.inclusions.map((o) => ({ ...o })),
    accommodationTiers: c.accommodationTiers.map((o) => ({ ...o })),
    walkthroughQuestions: c.walkthroughQuestions.map((q) => ({ ...q })),
    walkthroughPersona: c.walkthroughPersona,
    outputEnrichment: { ...c.outputEnrichment },
    handlesAccommodation: c.handlesAccommodation,
    accommodationNotes: c.accommodationNotes,
  };
}

function dedupeOptions(merged: TailorMadeOption[]): TailorMadeOption[] {
  const seen = new Set<string>();
  const out: TailorMadeOption[] = [];
  for (const opt of merged) {
    const key = (opt.label || '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(opt);
  }
  return out;
}

function isDirty(a: FormState | null, b: FormState | null): boolean {
  if (!a || !b) return false;
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function StudioClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [copilotConnected, setCopilotConnected] = useState(false);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, startSave] = useTransition();
  const [suggestKind, setSuggestKind] = useState<'regions' | 'interests' | null>(null);
  const [draftOpen, setDraftOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await getTailorMadeStatus();
      if (cancelled) return;
      if (status.ok) {
        const f = configToForm(status.config);
        setInitial(f);
        setForm(f);
        setCopilotConnected(status.copilotConnected);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(() => isDirty(form, initial), [form, initial]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    if (!form) return;
    const patch: TailorMadeConfigUpdate = {
      enabled: form.enabled,
      heroTitle: form.heroTitle,
      heroSubtitle: form.heroSubtitle,
      regions: form.regions,
      interests: form.interests,
      inclusions: form.inclusions,
      accommodationTiers: form.accommodationTiers,
      walkthroughQuestions: form.walkthroughQuestions,
      walkthroughPersona: form.walkthroughPersona,
      outputEnrichment: form.outputEnrichment,
      handlesAccommodation: form.handlesAccommodation,
      accommodationNotes: form.accommodationNotes,
    };
    startSave(async () => {
      const result = await updateTailorMadeConfig(patch);
      if (!result.ok) {
        toast({
          title: 'Failed to save',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      const next = configToForm(result.config);
      setInitial(next);
      setForm(next);
      toast({
        title: 'Tailor-Made Studio updated',
        description: form.enabled
          ? 'Changes will reflect on /tailor-made shortly.'
          : 'Tailor-made is now hidden from visitors.',
      });
      router.refresh();
    });
  };

  const updateList =
    (key: 'regions' | 'interests' | 'inclusions' | 'accommodationTiers') =>
    (next: TailorMadeOption[]) => {
      setForm((prev) => (prev ? { ...prev, [key]: next } : prev));
    };

  const applySuggestions = (kind: 'regions' | 'interests', picks: TailorMadeOption[]) => {
    setForm((prev) => {
      if (!prev) return prev;
      const current = prev[kind];
      const merged = dedupeOptions([...current, ...picks]);
      return { ...prev, [kind]: merged };
    });
  };

  const handleRevert = () => {
    if (initial) setForm(initial);
  };

  // ── Copilot-not-connected gate ─────────────────────────────────────────
  if (loaded && !copilotConnected) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Copilot not connected
          </CardTitle>
          <CardDescription>
            The tailor-made walkthrough is powered by your GitHub Copilot subscription. Connect
            it before configuring the Studio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/settings#copilot">
              <Plug className="mr-2 h-4 w-4" />
              Connect Copilot first
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (!loaded || !form) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Tailor-Made Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading config…
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Loaded + editable ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {form.enabled ? (
              <Eye className="h-5 w-5 text-emerald-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
            Visibility
          </CardTitle>
          <CardDescription>
            Master switch — when off, the <code className="font-mono text-xs">/tailor-made</code>{' '}
            page redirects to <code className="font-mono text-xs">/tours</code> and the nav-bar
            link is hidden site-wide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Show the tailor-made page</Label>
              <p className="text-xs text-muted-foreground">
                Visitors who land on the URL while this is off will be redirected to the tours
                catalog.
              </p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => update('enabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Page copy */}
      <Card>
        <CardHeader>
          <CardTitle>Page copy</CardTitle>
          <CardDescription>
            The big headline at the top of the page. Keep the title punchy — visitors decide in
            ~3 seconds whether to engage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hero-title">Hero title</Label>
            <Input
              id="hero-title"
              value={form.heroTitle}
              onChange={(e) => update('heroTitle', e.target.value)}
              placeholder="Tailor Made Your Tour"
              maxLength={120}
            />
            <p className="text-[11px] text-muted-foreground">{form.heroTitle.length}/120</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero-subtitle">Hero subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={form.heroSubtitle}
              onChange={(e) => update('heroSubtitle', e.target.value)}
              placeholder="Tell our AI travel expert what kind of trip you're after…"
              rows={2}
              maxLength={400}
            />
            <p className="text-[11px] text-muted-foreground">{form.heroSubtitle.length}/400</p>
          </div>
        </CardContent>
      </Card>

      {/* Accommodation gating */}
      <Card>
        <CardHeader>
          <CardTitle>Accommodation handling</CardTitle>
          <CardDescription>
            Off by default — when off, the AI never asks about hotel comfort tiers and the
            generated itinerary marks every day as <em>Self-arranged</em>. Turn it on only
            if you actually book or coordinate accommodation for visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">I handle accommodation booking</Label>
              <p className="text-xs text-muted-foreground">
                When on, the AI will ask about preferred comfort and the itinerary will
                recommend hotels from your inventory below.
              </p>
            </div>
            <Switch
              checked={form.handlesAccommodation}
              onCheckedChange={(v) => update('handlesAccommodation', v)}
            />
          </div>

          {form.handlesAccommodation && (
            <div className="space-y-1.5">
              <Label htmlFor="accommodation-notes">Available hotels &amp; pricing</Label>
              <Textarea
                id="accommodation-notes"
                value={form.accommodationNotes}
                onChange={(e) => update('accommodationNotes', e.target.value)}
                placeholder={[
                  'Cairo:',
                  '- Sofitel El Gezirah (5-star) — $220/night double',
                  '- Cairo Marriott Mena House (5-star, pyramid view) — $300/night',
                  '- Pyramids View Inn (3-star) — $80/night',
                  '',
                  'Luxor:',
                  '- Hilton Luxor Resort (5-star) — $190/night',
                ].join('\n')}
                rows={8}
                maxLength={8000}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                {form.accommodationNotes.length}/8000 — the AI uses ONLY these properties
                when recommending. Leave empty to let the AI describe a tier generically
                (&quot;a 4-star hotel in Luxor&quot;).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Option lists */}
      <Card>
        <CardHeader>
          <CardTitle>Walkthrough option lists</CardTitle>
          <CardDescription>
            The AI guide uses these lists when it shows quick-pick chips during the
            walkthrough. Add what you sell; remove what you don&apos;t.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <OptionListEditor
            title="Regions"
            description="Destinations across Egypt the AI offers to visitors."
            options={form.regions}
            onChange={updateList('regions')}
            onSuggest={() => setSuggestKind('regions')}
            emptyMessage="No regions yet — click ✨ Suggest from my tours to pull from your catalog."
          />

          <OptionListEditor
            title="Interests"
            description="Travel themes the AI can ask about (Adventure, Food, Family, etc)."
            options={form.interests}
            onChange={updateList('interests')}
            onSuggest={() => setSuggestKind('interests')}
            emptyMessage="No interests yet — Suggest pulls these from your tour categories."
          />

          <OptionListEditor
            title="Inclusions"
            description="Optional add-ons the AI can confirm with the visitor (meals, transfers, guides)."
            options={form.inclusions}
            onChange={updateList('inclusions')}
            emptyMessage="No inclusions yet."
          />

          {form.handlesAccommodation ? (
            <OptionListEditor
              title="Accommodation tiers"
              description="Comfort levels the visitor can pick — usually 3 or 4 entries."
              options={form.accommodationTiers}
              onChange={updateList('accommodationTiers')}
              emptyMessage="No accommodation tiers yet."
              maxItems={8}
            />
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
              <strong className="text-foreground">Accommodation tiers</strong> — hidden
              while &quot;I handle accommodation booking&quot; is off. Turn it on above to
              configure tiers.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Walkthrough script */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Walkthrough script
          </CardTitle>
          <CardDescription>
            The questions your AI guide asks visitors, in order. Drag the arrows to reorder,
            click a question to edit it, or let AI draft a fresh script from your option lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WalkthroughScriptEditor
            questions={form.walkthroughQuestions}
            onChange={(next) => update('walkthroughQuestions', next)}
            onDraftWithAi={() => setDraftOpen(true)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="walkthrough-persona">Walkthrough persona (optional)</Label>
            <Textarea
              id="walkthrough-persona"
              value={form.walkthroughPersona}
              onChange={(e) => update('walkthroughPersona', e.target.value)}
              placeholder="Layered on top of your main agent persona during the tailor-made walkthrough. e.g. &quot;Sound like a Cairo-based travel friend — warm, curious, casual.&quot;"
              rows={3}
              maxLength={4000}
            />
            <p className="text-[11px] text-muted-foreground">
              {form.walkthroughPersona.length}/4000 — leave empty to use just your main agent
              persona.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Output enrichment */}
      <Card>
        <CardHeader>
          <CardTitle>Output enrichment</CardTitle>
          <CardDescription>
            Optional extras the AI weaves into each itinerary day. Each toggle adds detail
            (and a small token cost) — start with one or two until you know what your
            visitors actually want.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnrichmentToggles
            value={form.outputEnrichment}
            onChange={(next) => update('outputEnrichment', next)}
          />
        </CardContent>
      </Card>

      {/* AI draft dialog */}
      <DraftWalkthroughDialog
        open={draftOpen}
        onOpenChange={setDraftOpen}
        hasExistingQuestions={form.walkthroughQuestions.length > 0}
        onApply={(questions) => update('walkthroughQuestions', questions)}
      />

      {/* Suggest dialog — single instance, switches between modes */}
      <SuggestOptionsDialog
        open={suggestKind === 'regions'}
        onOpenChange={(open) => !open && setSuggestKind(null)}
        title="Suggest regions from your tours"
        description="We'll scan your live tour catalog for destinations not yet in your list."
        fetchSuggestions={suggestRegionsFromTours}
        onApply={(picks) => applySuggestions('regions', picks)}
      />
      <SuggestOptionsDialog
        open={suggestKind === 'interests'}
        onOpenChange={(open) => !open && setSuggestKind(null)}
        title="Suggest interests from your tours"
        description="We'll pull tour categories from your catalog that aren't already listed."
        fetchSuggestions={suggestInterestsFromTours}
        onApply={(picks) => applySuggestions('interests', picks)}
      />

      {/* Save bar */}
      <Card>
        <CardFooter className="border-t-0 pt-6 flex items-center justify-end gap-2">
          {dirty && (
            <Button type="button" variant="ghost" onClick={handleRevert} disabled={saving}>
              Revert
            </Button>
          )}
          <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface EnrichmentTogglesProps {
  value: OutputEnrichment;
  onChange: (next: OutputEnrichment) => void;
}

const ENRICHMENT_ROWS: ReadonlyArray<{
  key: keyof OutputEnrichment;
  label: string;
  description: string;
}> = [
  {
    key: 'why_we_picked',
    label: 'Why we picked this',
    description: 'Per-day rationale tying the day back to the visitor\'s brief.',
  },
  {
    key: 'what_to_bring',
    label: 'What to bring',
    description: 'Short, specific packing tips per day (e.g. modest temple wear).',
  },
  {
    key: 'cultural_notes',
    label: 'Cultural notes',
    description: 'Etiquette, dress, and custom callouts for religious or rural stops.',
  },
  {
    key: 'restaurant_picks',
    label: 'Restaurant picks',
    description: '1-3 nearby dining suggestions, named when the AI is confident.',
  },
  {
    key: 'alternative_options',
    label: 'Alternative options',
    description: '"Swap this for…" alternates that nudge customisation conversations.',
  },
  {
    key: 'local_phrases',
    label: 'Local phrases',
    description: '2-3 region-specific Arabic phrases with transliteration.',
  },
];

function EnrichmentToggles({ value, onChange }: EnrichmentTogglesProps) {
  const enabledCount = ENRICHMENT_ROWS.filter((r) => value[r.key]).length;
  return (
    <div className="space-y-2">
      {ENRICHMENT_ROWS.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-3 rounded-lg border p-3"
        >
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{row.label}</Label>
            <p className="text-xs text-muted-foreground">{row.description}</p>
          </div>
          <Switch
            checked={value[row.key]}
            onCheckedChange={(v) => onChange({ ...value, [row.key]: v })}
          />
        </div>
      ))}
      <p className="px-1 pt-1 text-[11px] text-muted-foreground">
        {enabledCount === 0
          ? 'No enrichments — visitors see a clean day-by-day overview.'
          : `${enabledCount} enrichment${enabledCount === 1 ? '' : 's'} on. Expect richer days with a modest token-cost bump.`}
      </p>
    </div>
  );
}
