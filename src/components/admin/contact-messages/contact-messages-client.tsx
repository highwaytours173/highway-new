'use client';

import { useState } from 'react';
import { ContactMessage, ContactMessageStatus, Customer } from '@/types';
import { DataTable } from './data-table';
import { columns } from './columns';
import { MessageStats } from './message-stats';
import { MessageDetails } from './message-details';
import { updateContactMessageStatus } from '@/lib/supabase/contact-messages';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ContactMessagesClientProps {
  initialMessages: ContactMessage[];
  customers: Customer[];
}

export function ContactMessagesClient({ initialMessages, customers }: ContactMessagesClientProps) {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleView = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    try {
      await updateContactMessageStatus(id, status);
      toast({
        title: 'Status Updated',
        description: `Message marked as ${status}.`,
      });
      router.refresh();

      // Update local state if needed, but router.refresh() should handle it via server
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  // Find associated customer
  const relatedCustomer = selectedMessage
    ? customers.find((c) => c.email.toLowerCase() === selectedMessage.email.toLowerCase())
    : null;

  return (
    <div className="space-y-6">
      <MessageStats messages={initialMessages} />

      <DataTable
        columns={columns({
          onView: handleView,
          onStatusChange: handleStatusChange,
        })}
        data={initialMessages}
      />

      <MessageDetails
        message={selectedMessage}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onStatusChange={handleStatusChange}
        customer={relatedCustomer}
      />
    </div>
  );
}
