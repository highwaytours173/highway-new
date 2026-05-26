'use client';

import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  WalkthroughOptionsSource,
  WalkthroughQuestion,
  WalkthroughQuestionType,
} from '@/types/tailor-made';
import { WalkthroughQuestionDialog } from './walkthrough-question-dialog';

const TYPE_LABEL: Record<WalkthroughQuestionType, string> = {
  date: 'Date',
  number: 'Number',
  text: 'Text',
  single_select: 'Single choice',
  multi_select: 'Multi choice',
};

const SOURCE_LABEL: Record<WalkthroughOptionsSource, string> = {
  regions: 'Regions list',
  interests: 'Interests list',
  inclusions: 'Inclusions list',
  accommodation_tiers: 'Accommodation tiers',
};

interface WalkthroughScriptEditorProps {
  questions: WalkthroughQuestion[];
  onChange: (next: WalkthroughQuestion[]) => void;
  /** When provided, renders a "✨ Draft with AI" button. */
  onDraftWithAi?: () => void;
  /** Disable the draft-with-AI button (e.g. while a draft is loading). */
  draftBusy?: boolean;
}

export function WalkthroughScriptEditor({
  questions,
  onChange,
  onDraftWithAi,
  draftBusy = false,
}: WalkthroughScriptEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = editingId ? questions.find((q) => q.id === editingId) ?? undefined : undefined;

  const move = (index: number, delta: number) => {
    const next = [...questions];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (id: string) => {
    if (!confirm('Remove this question from the script?')) return;
    onChange(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = (question: WalkthroughQuestion) => {
    if (editingId) {
      onChange(questions.map((q) => (q.id === editingId ? question : q)));
    } else {
      onChange([...questions, question]);
    }
    setEditingId(null);
  };

  const openAdd = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            Questions{' '}
            <span className="text-xs font-normal text-muted-foreground">
              ({questions.length})
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            The AI asks these in order. Keep it tight — 6&ndash;9 questions feels right.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {onDraftWithAi && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDraftWithAi}
              disabled={draftBusy}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Draft with AI
            </Button>
          )}
          <Button type="button" size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add question
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          No questions yet. Click <strong>Add question</strong> or let AI draft a script from
          your option lists.
        </div>
      ) : (
        <ol className="space-y-1.5 rounded-lg border bg-card p-1.5">
          {questions.map((q, index) => (
            <QuestionRow
              key={q.id}
              question={q}
              index={index}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onEdit={() => openEdit(q.id)}
              onDelete={() => remove(q.id)}
            />
          ))}
        </ol>
      )}

      <WalkthroughQuestionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

interface QuestionRowProps {
  question: WalkthroughQuestion;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function QuestionRow({
  question,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: QuestionRowProps) {
  const optionsHint = question.optionsSource
    ? `from ${SOURCE_LABEL[question.optionsSource]}`
    : question.options && question.options.length > 0
      ? `${question.options.length} custom option${question.options.length === 1 ? '' : 's'}`
      : null;

  return (
    <li className="flex items-start gap-2 rounded-md border bg-background p-2.5 hover:bg-muted/30">
      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

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

      <button
        type="button"
        onClick={onEdit}
        className="flex-1 min-w-0 text-left"
      >
        <p className="flex items-baseline gap-1.5 text-sm">
          <span className="font-mono text-[11px] text-muted-foreground">{index + 1}.</span>
          <span className="font-medium">{question.prompt}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{question.field}</span>
          <span>·</span>
          <span>{TYPE_LABEL[question.type]}</span>
          {question.required ? (
            <>
              <span>·</span>
              <span className="text-amber-600">Required</span>
            </>
          ) : (
            <>
              <span>·</span>
              <span>Optional</span>
            </>
          )}
          {optionsHint && (
            <>
              <span>·</span>
              <span>{optionsHint}</span>
            </>
          )}
        </div>
        {question.helperText && (
          <p className="mt-1 text-[11px] italic text-muted-foreground">
            Hint: {question.helperText}
          </p>
        )}
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
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
    </li>
  );
}
