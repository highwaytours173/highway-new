'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading2, Heading3, Link as LinkIcon, List } from 'lucide-react';

interface HtmlEditorToolbarProps {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onContentChange: (newContent: string) => void;
}

export function HtmlEditorToolbar({ textAreaRef, onContentChange }: HtmlEditorToolbarProps) {
  const applyTag = (tag: 'strong' | 'em' | 'h2' | 'h3' | 'li') => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
    const textBefore = textArea.value.substring(0, start);
    const textAfter = textArea.value.substring(end);

    let newText;

    if (tag === 'li') {
      const lines = selectedText
        .split('\n')
        .map((line) => `  <li>${line}</li>`)
        .join('\n');
      newText = `<ul>\n${lines}\n</ul>`;
    } else {
      newText = `<${tag}>${selectedText}</${tag}>`;
    }

    const updatedContent = `${textBefore}${newText}${textAfter}`;
    onContentChange(updatedContent);

    // After updating, we can try to re-focus and set the cursor position.
    // This is a simple implementation.
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
    }, 0);
  };

  const applyLink = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
    const url = prompt('Enter the URL:', 'https://');

    if (url) {
      const textBefore = textArea.value.substring(0, start);
      const textAfter = textArea.value.substring(end);
      const newText = `<a href="${url}">${selectedText || url}</a>`;
      onContentChange(`${textBefore}${newText}${textAfter}`);
    }
  };

  const buttons = [
    { label: 'Bold', icon: Bold, action: () => applyTag('strong') },
    { label: 'Italic', icon: Italic, action: () => applyTag('em') },
    { label: 'H2', icon: Heading2, action: () => applyTag('h2') },
    { label: 'H3', icon: Heading3, action: () => applyTag('h3') },
    { label: 'List', icon: List, action: () => applyTag('li') },
    { label: 'Link', icon: LinkIcon, action: applyLink },
  ];

  return (
    <div className="border rounded-t-md p-2 flex items-center gap-1 bg-muted/50">
      {buttons.map(({ label, icon: Icon, action }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          size="icon"
          onClick={action}
          aria-label={label}
          title={label}
          className="h-8 w-8"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
