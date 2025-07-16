
import { getTours } from "@/lib/tours";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ToursPage() {
  const tours = getTours();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Tours</h2>
            <p className="text-muted-foreground">
                Here's a list of all your tours. You can add, edit, or delete them.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Tour
        </Button>
      </div>
      <DataTable columns={columns} data={tours} />
    </div>
  );
}
