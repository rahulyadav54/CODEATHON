
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
} from 'recharts';
import { Cpu, Zap, AlertTriangle, CheckCircle2, TrendingUp, Activity, ClipboardList, Clock, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const utilizationData = [
  { name: 'Mon', usage: 65 },
  { name: 'Tue', usage: 72 },
  { name: 'Wed', usage: 85 },
  { name: 'Thu', usage: 48 },
  { name: 'Fri', usage: 92 },
  { name: 'Sat', usage: 34 },
  { name: 'Sun', usage: 12 },
];

export default function DashboardOverview() {
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: machines } = useCollection(machinesQuery);

  const pendingBookingsQuery = useMemo(() => 
    db ? query(collection(db, 'bookings'), where('status', '==', 'Pending')) : null, 
    [db]
  );
  const { data: pendingBookings } = useCollection(pendingBookingsQuery);

  const maintenanceAlertsQuery = useMemo(() => 
    db ? query(collection(db, 'machines'), where('healthScore', '<', 75)) : null,
    [db]
  );
  const { data: healthAlerts } = useCollection(maintenanceAlertsQuery);

  const recentLogsQuery = useMemo(() => 
    db ? query(collection(db, 'usageLogs'), orderBy('createdAt', 'desc'), limit(5)) : null,
    [db]
  );
  const { data: recentLogs } = useCollection(recentLogsQuery);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalMachines = machines.length;
  const inUse = machines.filter(m => m.status === 'In Use').length;
  const inMaintenance = machines.filter(m => m.status === 'Under Maintenance').length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">System Command Node</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Monitor real-time system performance and operational load.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-10 text-xs px-6 border-white/10 hover:bg-white/5">Generate Report</Button>
           {profile?.role === 'Admin' && (
             <Link href="/dashboard/admin/approvals" className="flex-1 md:flex-none">
               <Button className="w-full md:w-auto rounded-xl h-10 tech-gradient border-0 text-xs px-6 font-bold shadow-lg shadow-primary/20">
                 Review Approvals ({pendingBookings.length})
               </Button>
             </Link>
           )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Fleet Total</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalMachines}</div>
            <p className="text-xs text-muted-foreground mt-1">Operational across 3 centers</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Load</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{inUse}</div>
            <div className="flex items-center gap-1 mt-3">
               <Progress value={totalMachines > 0 ? (inUse/totalMachines)*100 : 0} className="h-1 bg-white/10" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Maintenance Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{healthAlerts.length}</div>
            <p className="text-xs text-destructive mt-1 font-bold">Urgent attention required</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">System Health</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground mt-1">Global system uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.03] rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="p-8 pb-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-headline font-bold">Machine Utilization Log</CardTitle>
                <CardDescription className="text-xs mt-1">Real-time load distribution profile across the training network.</CardDescription>
              </div>
              <Badge variant="outline" className="border-white/10 text-primary">Live Telemetry</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: 'hsl(var(--primary))', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="usage" radius={[6, 6, 0, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.usage > 80 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.03] rounded-3xl overflow-hidden border">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-primary/20"><Activity className="h-4 w-4 text-primary" /></div>
                 <CardTitle className="text-lg font-headline font-bold">Fleet Sentinel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {machines.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono tracking-tighter">{m.id}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      "rounded-lg px-2 py-0 border-0 text-[10px] font-bold",
                      m.healthScore > 85 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {m.healthScore}%
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-white" asChild>
                <Link href="/dashboard/machines">View All Units</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-primary/10 border-primary/20 rounded-3xl overflow-hidden shadow-xl border">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="p-4 rounded-full bg-primary/20 relative">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-accent rounded-full border-2 border-[#020617] flex items-center justify-center text-[10px] font-bold">{pendingBookings.length}</span>
                </div>
                <div>
                  <h4 className="font-bold text-base">Pending Approvals</h4>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Review {pendingBookings.length} machine access requests currently in the deployment queue.
                  </p>
                </div>
                <Button className="w-full tech-gradient border-0 text-xs rounded-xl h-11 font-bold" asChild>
                  <Link href="/dashboard/admin/approvals">Go to Approval Hub</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
