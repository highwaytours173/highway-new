
import { getTours } from "@/lib/tours";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ToursPage() {
  const tours = getTours();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Tours Management</h2>
            <p className="text-muted-foreground">
                Here's a list of all your tours. You can add, edit, or delete them.
            </p>
        </div>
        <Button asChild>
            <Link href="/admin/tours/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Tour
            </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={tours} />
    </div>
  );
}
