import { createClient } from '@/lib/supabase/server';
import { getCurrentAgencySlug } from '@/lib/supabase/agencies';
import { getAllBroadcasts } from '@/lib/supabase/broadcasts';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeployTenantDialog } from '@/components/super-admin/deploy-tenant-dialog';
import { AgencyList } from '@/components/super-admin/agency-list';
import { BroadcastManager } from '@/components/super-admin/broadcast-manager';
import { Activity, Building2, ShieldCheck, Power } from 'lucide-react';

export default async function SuperAdminPage() {
  const supabase = await createClient();

  // Fetch all agencies
  const { data: agencies, error } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agencies:', error);
  }

  // Fetch Broadcasts
  const broadcasts = await getAllBroadcasts();
  const currentSlug = await getCurrentAgencySlug();
  const cookieStore = await cookies();
  const isOverridden = !!cookieStore.get('admin_agency_override')?.value;

  // Calculate Stats
  const totalAgencies = agencies?.length || 0;
  const activeAgencies = agencies?.filter((a) => a.status === 'active').length || 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
          <p className="text-zinc-500">Overview of your multi-tenant platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <DeployTenantDialog />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{totalAgencies}</div>
            <p className="text-xs text-zinc-500">Registered agencies</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Instances</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{activeAgencies}</div>
            <p className="text-xs text-zinc-500">Currently live</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">System Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">Healthy</div>
            <p className="text-xs text-zinc-500">All systems operational</p>
          </CardContent>
        </Card>
        <Card
          className={`border-zinc-200 shadow-sm ${isOverridden ? 'bg-amber-50 border-amber-200' : ''}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Context Mode</CardTitle>
            <Power className={`h-4 w-4 ${isOverridden ? 'text-amber-600' : 'text-zinc-400'}`} />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isOverridden ? 'text-amber-700' : 'text-zinc-900'}`}
            >
              {isOverridden ? 'Overridden' : 'Master'}
            </div>
            <p className="text-xs text-zinc-500">
              {isOverridden ? `Viewing: ${currentSlug}` : 'Viewing default scope'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="agencies" className="space-y-4">
        <TabsList className="bg-white border shadow-sm h-10 p-1">
          <TabsTrigger
            value="agencies"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900"
          >
            Agency Management
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900"
          >
            System Broadcasts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="space-y-4">
          <AgencyList agencies={agencies || []} currentSlug={currentSlug} />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <BroadcastManager broadcasts={broadcasts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
