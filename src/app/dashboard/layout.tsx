import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Bell, Search, Settings, Cpu, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <header className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-6 border-b border-white/5 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="text-muted-foreground" />
              <div className="flex items-center gap-2 md:hidden">
                 <Cpu className="h-5 w-5 text-primary" />
                 <span className="text-sm font-headline font-bold">SkillMach</span>
              </div>
              <div className="hidden md:flex relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search machines..."
                  className="bg-white/5 border-0 rounded-full pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-48 lg:w-64 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5 rounded-full relative h-9 w-9">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5 rounded-full h-9 w-9">
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-7xl w-full p-4 md:p-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
