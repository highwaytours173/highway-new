'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { X } from 'lucide-react';
import type {
  WalkthroughField,
  WalkthroughOptionsSource,
  WalkthroughQuestion,
  WalkthroughQuestionType,
} from '@/types/tailor-made';

const FIELD_OPTIONS: ReadonlyArray<{ value: WalkthroughField; label: string; defaultType: WalkthroughQuestionType }> = [
  { value: 'arrivalDate', label: 'Arrival date', defaultType: 'date' },
  { value: 'duration', label: 'Duration (days)', defaultType: 'number' },
  { value: 'participants', label: 'Participants', defaultType: 'number' },
  { value: 'region', label: 'Region', defaultType: 'multi_select' },
  { value: 'interests', label: 'Interests', defaultType: 'multi_select' },
  { value: 'accommodation', label: 'Accommodation', defaultType: 'single_select' },
  { value: 'budget', label: 'Budget', defaultType: 'text' },
  { value: 'inclusions', label: 'Inclusions', defaultType: 'multi_select' },
  { value: 'customPreferences', label: 'Custom preferences', defaultType: 'text' },
];

const TYPE_OPTIONS: ReadonlyArray<{ value: WalkthroughQuestionType; label: string; hint: string }> = [
  { value: 'text', label: 'Text', hint: 'Free-form short answer' },
  { value: 'number', label: 'Number', hint: 'Numeric (days, people, etc.)' },
  { value: 'date', label: 'Date', hint: 'A calendar date' },
  { value: 'single_select', label: 'Single choice', hint: 'Pick one option' },
  { value: 'multi_select', label: 'Multi choice', hint: 'Pick one or more' },
];

const SOURCE_OPTIONS: ReadonlyArray<{ value: WalkthroughOptionsSource; label: string }> = [
  { value: 'regions', label: 'Regions list' },
  { value: 'interests', label: 'Interests list' },
  { value: 'inclusions', label: 'Inclusions list' },
  { value: 'accommodation_tiers', label: 'Accommodation tiers list' },
];

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `q-${Math.random().toString(36).slice(2, 10)}`;
}

interface WalkthroughQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog is in edit mode. Omit for "add new". */
  initial?: WalkthroughQuestion;
  onSubmit: (question: WalkthroughQuestion) => void;
}

type OptionsMode = 'none' | 'source' | 'manual';

function detectOptionsMode(q?: WalkthroughQuestion): OptionsMode {
  if (!q) return 'source';
  if (q.optionsSource) return 'source';
  if (q.options && q.options.length > 0) return 'manual';
  return 'none';
}

export function WalkthroughQuestionDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: WalkthroughQuestionDialogProps) {
  const isEdit = Boolean(initial);

  const [prompt, setPrompt] = useState('');
  const [field, setField] = useState<WalkthroughField>('region');
  const [type, setType] = useState<WalkthroughQuestionType>('multi_select');
  const [required, setRequired] = useState(true);
  const [helperText, setHelperText] = useState('');
  const [optionsMode, setOptionsMode] = useState<OptionsMode>('source');
  const [optionsSource, setOptionsSource] = useState<WalkthroughOptionsSource>('regions');
  const [manualOptions, setManualOptions] = useState<string[]>([]);
  const [manualDraft, setManualDraft] = useState('');

  // Reset to initial values when the dialog opens.
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setPrompt(initial.prompt);
      setField(initial.field);
      setType(initial.type);
      setRequired(initial.required);
      setHelperText(initial.helperText ?? '');
      setOptionsMode(detectOptionsMode(initial));
      setOptionsSource(initial.optionsSource ?? 'regions');
      setManualOptions(initial.options ?? []);
    } else {
      setPrompt('');
      setField('region');
      setType('multi_select');
      setRequired(true);
      setHelperText('');
      setOptionsMode('source');
      setOptionsSource('regions');
      setManualOptions([]);
    }
    setManualDraft('');
  }, [open, initial]);

  const canSubmit = prompt.trim().length >= 3 && field && type;
  const supportsOptions = type === 'single_select' || type === 'multi_select';

  const handleFieldChange = (next: WalkthroughField) => {
    setField(next);
    const meta = FIELD_OPTIONS.find((f) => f.value === next);
    if (meta) {
      setType(meta.defaultType);
      // Auto-pick a sensible source when the field has an obvious one.
      if (next === 'region') setOptionsSource('regions');
      else if (next === 'interests') setOptionsSource('interests');
      else if (next === 'inclusions') setOptionsSource('inclusions');
      else if (next === 'accommodation') setOptionsSource('accommodation_tiers');
    }
  };

  const addManualOption = () => {
    const value = manualDraft.trim();
    if (!value) return;
    if (manualOptions.some((o) => o.toLowerCase() === value.toLowerCase())) {
      setManualDraft('');
      return;
    }
    setManualOptions([...manualOptions, value]);
    setManualDraft('');
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const question: WalkthroughQuestion = {
      id: initial?.id ?? randomId(),
      prompt: prompt.trim(),
      field,
      type,
      required,
      helperText: helperText.trim() || undefined,
      options:
        supportsOptions && optionsMode === 'manual' && manualOptions.length > 0
          ? manualOptions
          : undefined,
      optionsSource:
        supportsOptions && optionsMode === 'source' ? optionsSource : undefined,
      showIf: initial?.showIf,
    };
    onSubmit(question);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit question' : 'Add question'}</DialogTitle>
          <DialogDescription>
            Define a single question the AI guide will ask visitors during the walkthrough.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Prompt */}
          <div className="space-y-1.5">
            <Label htmlFor="q-prompt">Prompt (what the AI asks)</Label>
            <Textarea
              id="q-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='E.g. "When are you thinking of travelling? A rough arrival date is perfect."'
              rows={2}
              maxLength={400}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">{prompt.length}/400</p>
          </div>

          {/* Field + type */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Field collected</Label>
              <Select value={field} onValueChange={(v) => handleFieldChange(v as WalkthroughField)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Maps to a property on the brief the AI builds.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Answer type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WalkthroughQuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {TYPE_OPTIONS.find((t) => t.value === type)?.hint}
              </p>
            </div>
          </div>

          {/* Helper */}
          <div className="space-y-1.5">
            <Label htmlFor="q-helper">Helper text (optional)</Label>
            <Input
              id="q-helper"
              value={helperText}
              onChange={(e) => setHelperText(e.target.value)}
              placeholder="Shown as a hint under the prompt"
              maxLength={200}
            />
          </div>

          {/* Required */}
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Required</Label>
              <p className="text-xs text-muted-foreground">
                Visitors must answer this before the brief is ready.
              </p>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>

          {/* Options (select-only) */}
          {supportsOptions && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div>
                <Label className="text-sm font-medium">Quick-pick options</Label>
                <p className="text-xs text-muted-foreground">
                  Visitors see these as tappable chips while the AI asks.
                </p>
              </div>

              <RadioGroup
                value={optionsMode}
                onValueChange={(v) => setOptionsMode(v as OptionsMode)}
                className="space-y-2"
              >
                <label
                  htmlFor="opts-source"
                  className="flex items-start gap-2 rounded-md border bg-background p-2.5 cursor-pointer hover:bg-muted/30"
                >
                  <RadioGroupItem id="opts-source" value="source" className="mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-medium">Pull from an option list</p>
                    <Select
                      value={optionsSource}
                      onValueChange={(v) => setOptionsSource(v as WalkthroughOptionsSource)}
                      disabled={optionsMode !== 'source'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Stays in sync with the lists you edit above.
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="opts-manual"
                  className="flex items-start gap-2 rounded-md border bg-background p-2.5 cursor-pointer hover:bg-muted/30"
                >
                  <RadioGroupItem id="opts-manual" value="manual" className="mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Custom for this question only</p>
                    <div className="flex gap-1.5">
                      <Input
                        value={manualDraft}
                        onChange={(e) => setManualDraft(e.target.value)}
                        placeholder="Add an option…"
                        maxLength={80}
                        disabled={optionsMode !== 'manual'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addManualOption();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addManualOption}
                        disabled={optionsMode !== 'manual' || !manualDraft.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {manualOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {manualOptions.map((opt) => (
                          <span
                            key={opt}
                            className="inline-flex items-center gap-1 rounded-full bg-background border px-2 py-0.5 text-xs"
                          >
                            {opt}
                            <button
                              type="button"
                              aria-label={`Remove ${opt}`}
                              onClick={() =>
                                setManualOptions(manualOptions.filter((o) => o !== opt))
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>

                <label
                  htmlFor="opts-none"
                  className="flex items-start gap-2 rounded-md border bg-background p-2.5 cursor-pointer hover:bg-muted/30"
                >
                  <RadioGroupItem id="opts-none" value="none" className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">No quick picks</p>
                    <p className="text-[11px] text-muted-foreground">
                      Visitor types a free-form answer.
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? 'Save question' : 'Add question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
