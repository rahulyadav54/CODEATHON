
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Bell, Search, Cpu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  // Route Protection Middleware
  useEffect(() => {
    if (!loading && !user) {
      console.log("Unauthenticated node detected. Redirecting to portal...");
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

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
