"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<User | null>(null);
  // const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  // Rely on middleware for auth-based redirects in production.
  // In the layout, simply render login content when no user is present.

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }

  return (
    <AdminSidebar user={user} handleSignOut={handleSignOut}>
      {children}
    </AdminSidebar>
  );
}

