"use client";

import React, { useState } from "react";
import type { Customer } from "@/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer list from bookings and newsletter
            subscriptions.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>
      <DataTable
        columns={columns({ onDelete: handleDeleteCustomer })}
        data={customers}
      />
    </div>
  );
}
