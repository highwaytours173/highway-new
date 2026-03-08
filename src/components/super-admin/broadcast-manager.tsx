'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Megaphone,
  Trash2,
  PowerOff,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Loader2,
} from 'lucide-react';
import { createBroadcast, toggleBroadcast, deleteBroadcast } from '@/app/super-admin/actions';
import { SystemBroadcast } from '@/lib/supabase/broadcasts';
import { useState, useTransition } from 'react';

export function BroadcastManager({ broadcasts }: { broadcasts: SystemBroadcast[] }) {
  const [pending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    try {
      await createBroadcast(formData);
      // Reset form? native form reset happens if we use useRef or just let it reload
      const form = document.getElementById('broadcast-form') as HTMLFormElement;
      form?.reset();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            New Broadcast
          </CardTitle>
          <CardDescription>Send global alerts to all agency admins.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="broadcast-form" action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Input name="message" placeholder="e.g. System Maintenance at 10 PM UTC" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select name="variant" defaultValue="info">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info (Blue)</SelectItem>
                  <SelectItem value="warning">Warning (Yellow)</SelectItem>
                  <SelectItem value="destructive">Critical (Red)</SelectItem>
                  <SelectItem value="success">Success (Green)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Broadcast
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Active Broadcasts</h3>
        {broadcasts.length === 0 && (
          <div className="text-center p-8 border rounded-lg bg-muted/50 text-muted-foreground">
            No active broadcasts.
          </div>
        )}
        {broadcasts.map((broadcast) => {
          let Icon = Info;
          let colorClass = 'text-blue-500';

          if (broadcast.variant === 'warning') {
            Icon = AlertCircle;
            colorClass = 'text-amber-500';
          } else if (broadcast.variant === 'destructive') {
            Icon = XCircle;
            colorClass = 'text-red-500';
          } else if (broadcast.variant === 'success') {
            Icon = CheckCircle;
            colorClass = 'text-green-500';
          }

          return (
            <div
              key={broadcast.id}
              className="flex flex-col gap-3 p-4 rounded-lg border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                  <div>
                    <p className="font-medium text-sm">{broadcast.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(broadcast.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-5 capitalize">
                        {broadcast.variant}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t mt-1">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] uppercase font-bold ${broadcast.is_active ? 'text-green-600' : 'text-slate-400'}`}
                  >
                    {broadcast.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  title={broadcast.is_active ? 'Disable' : 'Enable'}
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => toggleBroadcast(broadcast.id, !broadcast.is_active))
                  }
                >
                  <PowerOff
                    className={`h-4 w-4 ${broadcast.is_active ? 'text-green-600' : 'text-slate-400'}`}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                  title="Delete"
                  disabled={pending}
                  onClick={() => startTransition(() => deleteBroadcast(broadcast.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
