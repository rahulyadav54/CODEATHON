
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
import { Cpu, Zap, CheckCircle2, Activity, ClipboardList, ShieldAlert, GraduationCap, Wrench, Calendar } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  
  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !profile) return null;

  const totalMachines = machines.length;
  const inUse = machines.filter(m => m.status === 'In Use').length;
  const role = profile.role || 'Trainee';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">
            {role === 'Admin' ? 'Admin Command Node' : role === 'Technician' ? 'Technician Hub' : 'Student Portal'}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {role === 'Admin' ? 'Strategic oversight and resource allocation.' : role === 'Technician' ? 'Real-time telemetry and maintenance reporting.' : 'Track your certification path and reserve equipment.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
           {role === 'Admin' && (
             <Link href="/dashboard/admin/approvals" className="flex-1 md:flex-none">
               <Button className="w-full md:w-auto rounded-xl h-10 tech-gradient border-0 text-xs px-6 font-bold shadow-lg shadow-primary/20">
                 Review Approvals ({pendingBookings.length})
               </Button>
             </Link>
           )}
           {role === 'Technician' && (
             <Link href="/dashboard/technician/updates" className="flex-1 md:flex-none">
               <Button className="w-full md:w-auto rounded-xl h-10 tech-gradient border-0 text-xs px-6 font-bold shadow-lg shadow-primary/20">
                 Log Health Update
               </Button>
             </Link>
           )}
           {role === 'Trainee' && (
             <Link href="/dashboard/bookings" className="flex-1 md:flex-none">
               <Button className="w-full md:w-auto rounded-xl h-10 tech-gradient border-0 text-xs px-6 font-bold shadow-lg shadow-primary/20">
                 Reserve Machine
               </Button>
             </Link>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {role === 'Trainee' ? 'Experience' : 'Fleet Total'}
            </CardTitle>
            {role === 'Trainee' ? <GraduationCap className="h-4 w-4 text-primary" /> : <Cpu className="h-4 w-4 text-primary" />}
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{role === 'Trainee' ? `${profile.totalHours || 0} Hrs` : totalMachines}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold opacity-50">
              {role === 'Trainee' ? 'Certified Training Time' : 'Operational Fleet Index'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {role === 'Trainee' ? 'Active Sessions' : 'Active Load'}
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{inUse}</div>
            <div className="flex items-center gap-1 mt-3">
               <Progress value={totalMachines > 0 ? (inUse/totalMachines)*100 : 0} className="h-1 bg-white/10" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">{healthAlerts.length}</div>
            <p className="text-[10px] text-destructive mt-1 font-bold uppercase">Critical Nodes Detected</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03] rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Health</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">94%</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold opacity-50">Optimal system uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.03] rounded-3xl overflow-hidden shadow-xl border">
          <CardHeader className="p-8 pb-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-headline font-bold">System Utilization Log</CardTitle>
                <CardDescription className="text-xs mt-1">Real-time load distribution profile across the training network.</CardDescription>
              </div>
              <Badge variant="outline" className="border-white/10 text-primary uppercase font-bold text-[9px]">Live Telemetry</Badge>
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
          <Card className="border-white/5 bg-white/[0.03] rounded-3xl overflow-hidden border shadow-xl">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-primary/20"><Activity className="h-4 w-4 text-primary" /></div>
                 <CardTitle className="text-lg font-headline font-bold">Fleet Sentinel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {machines.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono tracking-tighter group-hover:text-primary transition-colors">{m.id}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{m.name}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "rounded-lg px-2 py-0 border-0 text-[10px] font-bold",
                    m.healthScore > 85 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {m.healthScore}%
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-white" asChild>
                <Link href="/dashboard/machines">View Full Fleet</Link>
              </Button>
            </CardContent>
          </Card>

          {role === 'Admin' ? (
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
          ) : role === 'Technician' ? (
            <Card className="border-white/5 bg-accent/10 border-accent/20 rounded-3xl overflow-hidden shadow-xl border">
              <CardContent className="p-8 text-center space-y-5">
                 <div className="mx-auto p-4 rounded-full bg-accent/20 w-fit">
                    <Wrench className="h-8 w-8 text-accent" />
                 </div>
                 <div>
                    <h4 className="font-bold text-base">Service Log Required</h4>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      4 machinery nodes are due for periodic calibration checks.
                    </p>
                 </div>
                 <Button className="w-full bg-accent text-white hover:bg-accent/80 border-0 text-xs rounded-xl h-11 font-bold" asChild>
                   <Link href="/dashboard/technician/updates">Open Tech Command</Link>
                 </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/5 bg-green-500/10 border-green-500/20 rounded-3xl overflow-hidden shadow-xl border">
              <CardContent className="p-8 text-center space-y-5">
                 <div className="mx-auto p-4 rounded-full bg-green-500/20 w-fit">
                    <Calendar className="h-8 w-8 text-green-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-base">Operational Readiness</h4>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Your safety clearances are verified. You are cleared for all Level 1 & 2 machinery.
                    </p>
                 </div>
                 <Button className="w-full bg-green-600 text-white hover:bg-green-700 border-0 text-xs rounded-xl h-11 font-bold" asChild>
                   <Link href="/dashboard/bookings">Identify Equipment</Link>
                 </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
