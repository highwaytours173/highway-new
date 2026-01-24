
import { createClient } from "@/lib/supabase/server";
import { BroadcastBanner } from "@/components/admin/broadcast-banner";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { AdminLayoutShell } from "@/components/admin/layout-shell";
import { getCurrentAgency } from "@/lib/supabase/agencies";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  // Fetch current agency settings
  const agency = await getCurrentAgency();
  const settings = agency?.settings || {};

  return (
    <AdminLayoutShell user={user} settings={settings}>
      <div className="w-full">
         <ImpersonationBanner />
         <BroadcastBanner />
         {children}
      </div>
    </AdminLayoutShell>
  );
}
