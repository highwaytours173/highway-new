import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactMessage } from '@/types';
import { Mail, MailOpen, Archive, Inbox } from 'lucide-react';

interface MessageStatsProps {
  messages: ContactMessage[];
}

export function MessageStats({ messages }: MessageStatsProps) {
  const totalMessages = messages.length;
  const newMessages = messages.filter((m) => m.status === 'new').length;
  const readMessages = messages.filter((m) => m.status === 'read').length;
  const archivedMessages = messages.filter((m) => m.status === 'archived').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <Inbox className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMessages}</div>
          <p className="text-xs text-muted-foreground">All time messages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Messages</CardTitle>
          <Mail className="h-4 w-4 text-sky-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newMessages}</div>
          <p className="text-xs text-muted-foreground">Awaiting response</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Read Messages</CardTitle>
          <MailOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{readMessages}</div>
          <p className="text-xs text-muted-foreground">Processed messages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Archived</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{archivedMessages}</div>
          <p className="text-xs text-muted-foreground">Stored for reference</p>
        </CardContent>
      </Card>
    </div>
  );
}
