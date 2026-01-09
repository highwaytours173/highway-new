import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { OverviewChart } from "@/components/admin/overview-chart";
import { RecentSales } from "@/components/admin/recent-sales";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getBookings } from "@/lib/supabase/bookings";
import { getCustomers } from "@/lib/supabase/customers";
import { getTours } from "@/lib/supabase/tours";

function formatUSD(value: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

function getLast12MonthsLabels(): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString("en-US", { month: "short" }));
  }
  return labels;
}

export default async function AdminDashboard() {
  // Fetch live data (with fallbacks handled in the supabase libs)
  const [bookings, customers, tours] = await Promise.all([
    getBookings(),
    getCustomers(),
    getTours(),
  ]);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);
  const totalBookings = bookings.length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers = customers.filter((c) => {
    const created = c.createdAt ? new Date(c.createdAt) : new Date();
    return created >= thirtyDaysAgo;
  }).length;
  const activeTours = tours.filter((t) => t.availability).length;

  // Build monthly revenue series for the chart
  const labels = getLast12MonthsLabels();
  const monthlyTotals: Record<string, number> = Object.fromEntries(
    labels.map((l) => [l, 0]),
  );
  bookings.forEach((b) => {
    const d = b.bookingDate ? new Date(b.bookingDate) : new Date();
    const label = d.toLocaleString("en-US", { month: "short" });
    if (monthlyTotals[label] !== undefined) {
      monthlyTotals[label] += b.totalPrice ?? 0;
    }
  });
  const chartData = labels.map((l) => ({ name: l, total: monthlyTotals[l] }));

  const recentItems = bookings.slice(0, 5).map((b) => ({
    user: b.customerName ?? b.customerEmail ?? "Customer",
    email: b.customerEmail ?? "",
    amount: `+${formatUSD(b.totalPrice ?? 0)}`,
    avatar: undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto">
            <DateRangePicker />
          </div>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 sm:w-auto"
          >
            <Download className="size-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Live from bookings</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Booked experiences</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <p className="text-xs text-muted-foreground">Joined in last 30 days</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTours}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales items={recentItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
