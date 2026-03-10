"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Cpu, 
  Calendar, 
  BarChart3, 
  Ticket, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Machines', icon: Cpu, path: '/dashboard/machines' },
  { name: 'Bookings', icon: Calendar, path: '/dashboard/bookings' },
  { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
  { name: 'Maintenance', icon: Ticket, path: '/dashboard/maintenance' },
  { name: 'AI Zaya', icon: MessageSquare, path: '/dashboard/ai-zaya' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-5 w-5" />
          </div>
          {state !== 'collapsed' && (
            <span className="text-lg font-headline font-bold">SkillMach AI</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 mt-4">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.path}
                tooltip={item.name}
                className={cn(
                  "flex items-center gap-3 px-3 py-6 rounded-xl transition-all",
                  pathname === item.path 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Link href={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {pathname === item.path && state !== 'collapsed' && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-primary/20">
              <AvatarImage src="https://picsum.photos/seed/admin-avatar/40/40" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            {state !== 'collapsed' && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@skillmach.ai</span>
              </div>
            )}
          </div>
          {state !== 'collapsed' && (
            <MoreVertical className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
