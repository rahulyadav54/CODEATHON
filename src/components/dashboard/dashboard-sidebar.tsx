
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Cpu, 
  Calendar, 
  BarChart3, 
  Ticket, 
  MessageSquare, 
  LogOut,
  Loader2,
  ChevronRight,
  User
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth, db, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useMemo } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Teacher', 'Student'] },
  { name: 'Machines', icon: Cpu, path: '/dashboard/machines', roles: ['Admin', 'Teacher'] },
  { name: 'Portal', icon: Calendar, path: '/dashboard/bookings', roles: ['Student'] },
  { name: 'Approvals', icon: Ticket, path: '/dashboard/trainer/approvals', roles: ['Teacher'] },
  { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics', roles: ['Admin'] },
  { name: 'Maintenance', icon: Ticket, path: '/dashboard/maintenance', roles: ['Admin', 'Teacher'] },
  { name: 'AI Zaya', icon: MessageSquare, path: '/dashboard/ai-zaya', roles: ['Admin', 'Teacher', 'Student'] },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { user, loading: authLoading } = useUser();
  
  const userRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (authLoading || profileLoading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </Sidebar>
    );
  }

  const userRole = profile?.role || 'Student';
  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
            <Cpu className="h-5 w-5" />
          </div>
          {state !== 'collapsed' && (
            <span className="text-lg font-headline font-bold">CODEATHON AI</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-3 mt-6">
          {filteredNav.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.path}
                tooltip={item.name}
                className={cn(
                  "flex items-center gap-3 px-4 py-6 rounded-2xl transition-all mb-1",
                  pathname === item.path 
                    ? "bg-primary text-white shadow-xl shadow-primary/30" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Link href={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-bold tracking-tight">{item.name}</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                  <AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                {state !== 'collapsed' && (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold truncate max-w-[120px]">{profile?.name || user?.email}</span>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      {userRole}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 bg-card border-white/10 rounded-2xl shadow-2xl">
             <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-4 py-3">Account</DropdownMenuLabel>
             <DropdownMenuItem className="gap-2 px-4 py-3 cursor-default"><User className="h-4 w-4" /> {userRole} Portal</DropdownMenuItem>
             <DropdownMenuSeparator className="bg-white/5" />
             <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer text-red-500 hover:text-red-400" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
