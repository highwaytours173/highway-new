'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings } from 'lucide-react';
import { updateAgencyModules } from '@/app/super-admin/actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AgencyModules } from '@/types/agency';

export function AgencySettingsDialog({
  agencyId,
  initialModules,
}: {
  agencyId: string;
  initialModules?: AgencyModules;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<AgencyModules>({
    blog: initialModules?.blog ?? true,
    upsell: initialModules?.upsell ?? true,
    contact: initialModules?.contact ?? true,
    reviews: initialModules?.reviews ?? true,
  });

  async function handleSave() {
    setIsLoading(true);
    try {
      await updateAgencyModules(agencyId, modules);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Settings className="mr-2 h-4 w-4" />
          Feature Control
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Feature Control</DialogTitle>
          <DialogDescription>Enable or disable specific modules for this agency.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="blog">Blog Module</Label>
              <span className="text-xs text-muted-foreground">Allow posting articles</span>
            </div>
            <Switch
              id="blog"
              checked={modules.blog}
              onCheckedChange={(c) => setModules((prev) => ({ ...prev, blog: c }))}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="upsell">Upsell Items</Label>
              <span className="text-xs text-muted-foreground">Manage addons & extras</span>
            </div>
            <Switch
              id="upsell"
              checked={modules.upsell}
              onCheckedChange={(c) => setModules((prev) => ({ ...prev, upsell: c }))}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="contact">Contact Messages</Label>
              <span className="text-xs text-muted-foreground">Inbox for customer inquiries</span>
            </div>
            <Switch
              id="contact"
              checked={modules.contact}
              onCheckedChange={(c) => setModules((prev) => ({ ...prev, contact: c }))}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="maintenance" className="text-red-600 font-semibold">
                  Maintenance Mode
                </Label>
                <span className="text-xs text-muted-foreground">
                  Force offline status (Kill Switch)
                </span>
              </div>
              <Switch
                id="maintenance"
                checked={modules.maintenance_mode}
                onCheckedChange={(c) => setModules((prev) => ({ ...prev, maintenance_mode: c }))}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
