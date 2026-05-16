'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { navGroups } from '@/config/nav-config';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Icons } from '../icons';

export default function AppSidebar() {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initialGroups = useMemo(() => navGroups, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/auth/sign-in');
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <div className='flex items-center gap-3 px-2 py-1'>
          <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg font-semibold'>
            SPV
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-medium'>Support Promise Vault</span>
            <span className='text-muted-foreground truncate text-xs'>Operator workspace</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {initialGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const isActive =
                  item.url !== '#' &&
                  (pathname === item.url || (item.url !== '/auth/sign-in' && pathname.startsWith(item.url)));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <Link href={item.url === '#' ? '/dashboard/overview' : item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Sign out'
              onClick={handleSignOut}
              className='cursor-pointer'
              disabled={isSigningOut}
            >
              <Icons.logout />
              <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
