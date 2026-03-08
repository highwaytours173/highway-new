import { cookies } from 'next/headers';
import { resetAgency } from '@/app/super-admin/actions';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';

export async function ImpersonationBanner() {
  const cookieStore = await cookies();
  const overrideSlug = cookieStore.get('admin_agency_override')?.value;

  if (!overrideSlug) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 text-amber-900 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Power className="h-4 w-4 text-amber-600" />
        <span className="font-semibold">Context Mode Active:</span>
        <span className="font-mono bg-amber-200/50 px-2 py-0.5 rounded text-amber-800">
          {overrideSlug}
        </span>
        <span className="text-amber-700 text-xs hidden sm:inline-block">
          (You are viewing this agency as an admin)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <form action={resetAgency}>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs hover:bg-amber-200 hover:text-amber-900 text-amber-800"
          >
            Exit Context
          </Button>
        </form>
      </div>
    </div>
  );
}
