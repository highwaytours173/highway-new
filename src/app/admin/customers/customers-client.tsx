'use client';

import React, { useState } from 'react';
import type { Customer } from '@/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { syncCustomersFromBookings } from '@/lib/supabase/customers';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface CustomersClientProps {
  initialCustomers: Customer[];
}

import { CustomerStats } from '@/components/admin/customers/customer-stats';

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Nationality',
      'Total Bookings',
      'Total Spent',
      'Joined',
    ];
    const rows = customers.map((c) =>
      [
        c.id,
        `"${(c.name ?? '').replace(/"/g, '""')}"`,
        c.email ?? '',
        c.phone ?? '',
        c.nationality ?? '',
        c.totalBookings ?? 0,
        c.totalSpent ?? 0,
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncCustomersFromBookings();
      toast({
        title: 'Customers Synced',
        description: 'Customer list has been updated from bookings.',
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Sync Failed',
        description: 'Could not sync customers.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer list from bookings and newsletter subscriptions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync from Bookings
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
        </div>
      </div>

      <CustomerStats customers={customers} />

      <DataTable columns={columns({ onDelete: handleDeleteCustomer })} data={customers} />
    </div>
  );
}
