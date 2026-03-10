import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Bell, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 sticky top-0 z-40 bg-background/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground" />
              <div className="hidden md:flex relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search machines, tickets..."
                  className="bg-white/5 border-0 rounded-full pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5 rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5 rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}