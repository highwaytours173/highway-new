'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ContactMessage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye, Archive, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface ColumnsProps {
  onView: (message: ContactMessage) => void;
  onStatusChange: (id: string, status: ContactMessage['status']) => void;
}

export const columns = ({ onView, onStatusChange }: ColumnsProps): ColumnDef<ContactMessage>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={status === 'new' ? 'default' : status === 'read' ? 'secondary' : 'outline'}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
    cell: ({ row }) => {
      const subject = row.getValue('subject') as string;
      return <div className="max-w-[200px] truncate font-medium">{subject || '(No Subject)'}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MMM d, yyyy');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const message = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(message)}>
            <Eye className="h-4 w-4" />
          </Button>
          {message.status === 'new' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStatusChange(message.id, 'read')}
              title="Mark as Read"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {message.status !== 'archived' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStatusChange(message.id, 'archived')}
              title="Archive"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
