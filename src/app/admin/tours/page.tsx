
import { getTours } from "@/lib/tours";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
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
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/admin/tours/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Tours Settings
                </Link>
            </Button>
            <Button asChild>
                <Link href="/admin/tours/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Tour
                </Link>
            </Button>
        </div>
      </div>
      <DataTable columns={columns} data={tours} />
    </div>
  );
}
