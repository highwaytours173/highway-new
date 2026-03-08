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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { createAgency } from '@/app/super-admin/actions';

export function DeployTenantDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await createAgency(formData);
      setOpen(false);
      // Optional: Toast success
    } catch (error) {
      console.error(error);
      // Optional: Toast error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Deploy Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deploy New Tenant</DialogTitle>
          <DialogDescription>
            Create a new agency instance. This will provision a new workspace immediately.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Agency Name</Label>
            <Input id="name" name="name" placeholder="E.g. Pyramids Travel" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Unique Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="pyramids-travel"
              required
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Custom Domain (Optional)</Label>
            <Input id="domain" name="domain" placeholder="travel.example.com" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deploy Instance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
