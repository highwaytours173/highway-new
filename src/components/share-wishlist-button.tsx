'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Tour } from '@/types';

interface ShareWishlistButtonProps {
  tours: Tour[];
  className?: string;
}

/**
 * ShareWishlistButton — builds a `/wishlist/share/[ids]` URL for the
 * current wishlist and either invokes the native share sheet (mobile) or
 * copies the link to the clipboard (desktop).
 */
export function ShareWishlistButton({ tours, className }: ShareWishlistButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOrigin(window.location.origin);
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  if (tours.length === 0) return null;

  const ids = tours.map((t) => t.id).join(',');
  const url = origin ? `${origin}/wishlist/share/${encodeURIComponent(ids)}` : '';

  const handleClick = async () => {
    if (!url) return;
    if (canShare) {
      try {
        await navigator.share({
          title: 'My travel wishlist',
          text: `Check out the tours I'm planning — ${tours.length} pick${tours.length === 1 ? '' : 's'}`,
          url,
        });
        return;
      } catch {
        // User cancelled — fall through to clipboard copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Paste it anywhere to share your wishlist.',
      });
      setTimeout(() => setCopied(false), 2400);
    } catch {
      toast({
        title: 'Couldn\'t copy',
        description: 'Long-press the link in the URL bar to share it manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1.5" />
          Copied
        </>
      ) : canShare ? (
        <>
          <Share2 className="h-4 w-4 mr-1.5" />
          Share
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1.5" />
          Copy share link
        </>
      )}
    </Button>
  );
}
