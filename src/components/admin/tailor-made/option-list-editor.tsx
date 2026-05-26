'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TailorMadeOption } from '@/types/tailor-made';

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || `opt-${Math.random().toString(36).slice(2, 8)}`
  );
}

function makeUniqueId(label: string, existing: TailorMadeOption[]): string {
  const base = slugify(label);
  if (!existing.some((o) => o.id === base)) return base;
  let counter = 2;
  while (existing.some((o) => o.id === `${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

interface OptionListEditorProps {
  title: string;
  description: string;
  options: TailorMadeOption[];
  onChange: (next: TailorMadeOption[]) => void;
  /** When set, renders an extra "✨ Suggest from my tours" button. */
  onSuggest?: () => void;
  /** What an empty list looks like ("No regions yet — click +Add or ✨ Suggest"). */
  emptyMessage?: string;
  /** Optional max items — UI nudge, no hard limit. */
  maxItems?: number;
}

export function OptionListEditor({
  title,
  description,
  options,
  onChange,
  onSuggest,
  emptyMessage,
  maxItems,
}: OptionListEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);

  const move = (index: number, delta: number) => {
    const next = [...options];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const update = (id: string, patch: Partial<TailorMadeOption>) => {
    onChange(
      options.map((o) =>
        o.id === id
          ? {
              ...o,
              ...patch,
              label: patch.label !== undefined ? patch.label : o.label,
            }
          : o
      )
    );
  };

  const addItem = (label: string, descriptionInput?: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = makeUniqueId(trimmed, options);
    onChange([
      ...options,
      {
        id,
        label: trimmed,
        description: descriptionInput?.trim() || undefined,
      },
    ]);
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            {title}{' '}
            <span className="text-xs font-normal text-muted-foreground">
              ({options.length})
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {onSuggest && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSuggest}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Suggest from my tours
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
            disabled={Boolean(maxItems && options.length >= maxItems)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {options.length === 0 && !adding && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          {emptyMessage ?? 'No options yet.'}
        </div>
      )}

      {options.length > 0 && (
        <div className="space-y-1.5 rounded-lg border bg-card">
          {options.map((option, index) => (
            <OptionRow
              key={option.id}
              option={option}
              isFirst={index === 0}
              isLast={index === options.length - 1}
              isEditing={editingId === option.id}
              onStartEdit={() => {
                setAdding(false);
                setEditingId(option.id);
              }}
              onCancelEdit={() => setEditingId(null)}
              onSave={(patch) => {
                update(option.id, patch);
                setEditingId(null);
              }}
              onDelete={() => remove(option.id)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
            />
          ))}
        </div>
      )}

      {adding && (
        <AddOptionRow
          onSubmit={addItem}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  );
}

interface OptionRowProps {
  option: TailorMadeOption;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: { label: string; description?: string }) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function OptionRow({
  option,
  isFirst,
  isLast,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: OptionRowProps) {
  const [label, setLabel] = useState(option.label);
  const [description, setDescription] = useState(option.description ?? '');

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 border-b p-3 last:border-b-0 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label"
            maxLength={80}
            autoFocus
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={200}
          />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onSave({ label: label.trim(), description: description.trim() || undefined })
            }
            disabled={label.trim().length < 1}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b p-2.5 last:border-b-0 hover:bg-muted/30">
      {/* Reorder controls */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move up"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            isFirst && 'opacity-30'
          )}
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move down"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            isLast && 'opacity-30'
          )}
        >
          <ArrowDown className="h-3 w-3" />
        </button>
      </div>

      {/* Label + optional description */}
      <button
        type="button"
        onClick={onStartEdit}
        className="flex-1 min-w-0 text-left"
      >
        <p className="truncate text-sm font-medium">{option.label}</p>
        {option.description && (
          <p className="truncate text-xs text-muted-foreground">{option.description}</p>
        )}
      </button>

      {/* Row actions */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onStartEdit}
        aria-label="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

interface AddOptionRowProps {
  onSubmit: (label: string, description?: string) => void;
  onCancel: () => void;
}

function AddOptionRow({ onSubmit, onCancel }: AddOptionRowProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        New option
      </Label>
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (e.g. Wadi Halfa)"
        maxLength={80}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && label.trim()) onSubmit(label, description);
        }}
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        maxLength={200}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onSubmit(label, description)}
          disabled={label.trim().length < 1}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
