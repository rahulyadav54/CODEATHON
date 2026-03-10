
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Bell, Search, Cpu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Route Role Protection
  useEffect(() => {
    if (!profileLoading && profile && user) {
      const role = profile.role;
      
      // Admin only routes
      if (pathname.includes('/admin') && role !== 'Admin') {
        router.push('/dashboard');
      }
      
      // Technician/Teacher only routes
      if (pathname.includes('/technician') && (role !== 'Technician' && role !== 'Admin')) {
        router.push('/dashboard');
      }

      // Student/Trainee only routes
      if (pathname.includes('/bookings') && (role !== 'Trainee' && role !== 'Admin')) {
         // Allow Admin to see but maybe not standard teacher
         // router.push('/dashboard');
      }
    }
  }, [profile, profileLoading, pathname, router, user]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Node Data...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#020617] overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-transparent">
          <header className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b border-white/5 sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-md">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="flex items-center gap-2 md:hidden">
                 <Cpu className="h-5 w-5 text-primary" />
                 <span className="text-sm font-headline font-bold">CODEATHON AI</span>
              </div>
              <div className="hidden md:flex relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Query fleet..."
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary w-48 lg:w-64 outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5 rounded-full relative h-9 w-9">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <div className="mx-auto max-w-7xl w-full p-4 md:p-8 relative z-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
