'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ContactMessage, Customer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, Phone, User, Archive, CheckCircle, UserPlus, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createCustomerFromMessage } from '@/lib/supabase/contact-messages';

interface MessageDetailsProps {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: ContactMessage['status']) => void;
  customer?: Customer | null;
}

export function MessageDetails({
  message,
  open,
  onOpenChange,
  onStatusChange,
  customer,
}: MessageDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();

  if (!message) return null;

  const handleCreateCustomer = async () => {
    try {
      await createCustomerFromMessage(message);
      toast({
        title: 'Customer Created',
        description: `${message.name} has been added to your customers.`,
      });
      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create customer.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant={
                message.status === 'new'
                  ? 'default'
                  : message.status === 'read'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {message.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {message.createdAt && format(new Date(message.createdAt), 'PP p')}
            </span>
          </div>
          <SheetTitle className="text-xl">{message.subject || 'No Subject'}</SheetTitle>
          <SheetDescription>Message details and actions.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{message.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                {message.email}
              </a>
            </div>
            {message.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${message.phone}`} className="hover:underline">
                  {message.phone}
                </a>
              </div>
            )}
          </div>

          {/* Message Body */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Message Content</h4>
            <div className="rounded-lg border p-4 bg-card whitespace-pre-wrap text-sm leading-relaxed">
              {message.message}
            </div>
          </div>

          {/* Customer Association */}
          <div className="rounded-lg border p-4 bg-blue-50/50 dark:bg-blue-900/10">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" /> Customer Profile
            </h4>

            {customer ? (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {customer.totalBookings} bookings • {customer.source}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/customers/${customer.id}`}>
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  No customer profile found for this email.
                </p>
                <Button size="sm" variant="secondary" onClick={handleCreateCustomer}>
                  <UserPlus className="h-3 w-3 mr-2" />
                  Create Customer
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
            <div className="flex gap-3">
              {message.status !== 'read' && (
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => onStatusChange(message.id, 'read')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Read
                </Button>
              )}
              {message.status === 'read' && (
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => onStatusChange(message.id, 'new')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Mark as Unread
                </Button>
              )}
              <Button
                className="flex-1"
                variant={message.status === 'archived' ? 'secondary' : 'outline'}
                onClick={() =>
                  onStatusChange(message.id, message.status === 'archived' ? 'read' : 'archived')
                }
              >
                <Archive className="mr-2 h-4 w-4" />
                {message.status === 'archived' ? 'Unarchive' : 'Archive'}
              </Button>
            </div>

            <Button className="w-full" asChild>
              <a
                href={`mailto:${message.email}?subject=Re: ${message.subject || 'Contact Request'}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Reply via Email
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
