'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Globe, Search, MoreHorizontal, ExternalLink, Power } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { switchAgency } from '@/app/super-admin/actions';
import { AgencySettings } from '@/types/agency';
import { AgencySettingsDialog } from './agency-settings-dialog';

interface AgencyListProps {
  agencies: {
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
    status: string;
    created_at: string;
    settings?: AgencySettings;
  }[];
  currentSlug: string;
}

export function AgencyList({ agencies, currentSlug }: AgencyListProps) {
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>{agency.name}</span>
                      {agency.domain && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {agency.domain}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs font-normal">
                    {agency.slug}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={agency.status === 'active' ? 'default' : 'secondary'}
                      className={`w-fit ${agency.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none' : ''}`}
                    >
                      {agency.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Tier:{' '}
                      <span className="font-semibold text-foreground">
                        {agency.settings?.tier || 'Free'}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-[140px]">
                    {(!agency.settings?.modules || agency.settings.modules.blog !== false) && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-5 border-blue-200 bg-blue-50 text-blue-700"
                      >
                        Blog
                      </Badge>
                    )}
                    {(!agency.settings?.modules || agency.settings.modules.upsell !== false) && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-5 border-purple-200 bg-purple-50 text-purple-700"
                      >
                        Upsell
                      </Badge>
                    )}
                    {(!agency.settings?.modules || agency.settings.modules.contact !== false) && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-5 border-orange-200 bg-orange-50 text-orange-700"
                      >
                        Inbox
                      </Badge>
                    )}
                    {agency.settings?.modules &&
                      Object.values(agency.settings.modules).some((v) => v === false) && (
                        <span className="text-[10px] text-muted-foreground ml-1">+Restricted</span>
                      )}
                    {agency.settings?.modules?.maintenance_mode && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">
                        Offline
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <AgencySettingsDialog
                        agencyId={agency.id}
                        initialModules={agency.settings?.modules}
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(agency.id)}>
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {currentSlug !== agency.slug ? (
                        <DropdownMenuItem
                          onSelect={() => startTransition(() => switchAgency(agency.slug))}
                          disabled={pending}
                          className="cursor-pointer"
                        >
                          <Power className="mr-2 h-4 w-4" />
                          Manage Context
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          <Power className="mr-2 h-4 w-4" />
                          Active Context
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
