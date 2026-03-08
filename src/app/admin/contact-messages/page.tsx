import { getContactMessages } from '@/lib/supabase/contact-messages';
import { getCustomers } from '@/lib/supabase/customers';
import { ContactMessagesClient } from '@/components/admin/contact-messages/contact-messages-client';

export const dynamic = 'force-dynamic';

export default async function ContactMessagesPage() {
  const messages = await getContactMessages();
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contact Messages</h2>
        <p className="text-muted-foreground">Inbox for messages submitted from the Contact page.</p>
      </div>

      <ContactMessagesClient initialMessages={messages} customers={customers} />
    </div>
  );
}
