
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
import { 
  Cpu, Zap, CheckCircle2, Activity, ClipboardList, ShieldAlert, 
  GraduationCap, Wrench, Calendar, BarChart3, AlertTriangle, 
  TrendingUp, Clock, IndianRupee 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats and Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
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
          </div>

          <Card className="border-white/5 bg-white/[0.03] rounded-3xl overflow-hidden shadow-xl border">
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
        </div>

        {/* Real-time Analytics Sidebar Card (Based on User Image) */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-[#1a1c24] rounded-[2.5rem] overflow-hidden shadow-2xl border flex flex-col h-full min-h-[600px]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline font-bold">Real-time Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-10 flex-1">
              {/* 4-Stat Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-2xl font-bold text-primary">100%</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Utilization Rate</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-2xl font-bold text-white">3h</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Avg Downtime</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-2xl font-bold text-primary flex items-center"><IndianRupee className="h-4 w-4 mr-0.5" /> 4500</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Monthly Cost</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-2xl font-bold text-white">46%</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">OEE Index</span>
                </div>
              </div>

              {/* Machine Utilization Bars */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-white/80">Machine Utilization</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">CNC</span>
                        <span className="text-[10px] text-muted-foreground">Machine-01</span>
                      </div>
                      <span className="text-xs font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2.5 bg-white/5 [&>div]:bg-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Welding</span>
                        <span className="text-[10px] text-muted-foreground">Station-02</span>
                      </div>
                      <span className="text-xs font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2.5 bg-white/5 [&>div]:bg-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">3D Printer-03</span>
                      </div>
                      <span className="text-xs font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2.5 bg-white/5 [&>div]:bg-primary" />
                  </div>
                </div>
              </div>

              {/* Recent Alerts (Placeholder Footer) */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Recent Alerts</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-orange-200">CNC-101 Peak Temperature</span>
                    <span className="text-[8px] text-muted-foreground uppercase">2m ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
