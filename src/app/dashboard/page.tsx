"use client";

import { useState, useEffect } from 'react';
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
import { Cpu, Zap, AlertTriangle, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { MockDB, Machine } from '@/lib/mock-data';
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
  const [machines, setMachines] = useState<Machine[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMachines(MockDB.machines);
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
          <h1 className="text-2xl md:text-3xl font-headline font-bold">Dashboard Overview</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Monitor real-time system performance.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="flex-1 md:flex-none rounded-lg h-9 text-xs">Report</Button>
           <Link href="/dashboard/machines" className="flex-1 md:flex-none">
             <Button className="w-full md:w-auto rounded-lg h-9 bg-primary text-white border-0 text-xs">Manage</Button>
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">Total</CardTitle>
            <Cpu className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{totalMachines}</div>
            <p className="text-[8px] md:text-xs text-muted-foreground mt-1">3 active centers</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">Active</CardTitle>
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{inUse}</div>
            <div className="flex items-center gap-1 mt-2">
               <Progress value={totalMachines > 0 ? (inUse/totalMachines)*100 : 0} className="h-1 bg-white/10" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">Alerts</CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{inMaintenance}</div>
            <p className="text-[8px] md:text-xs text-destructive mt-1 truncate">Urgent maintenance</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">Health</CardTitle>
            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">92%</div>
            <p className="text-[8px] md:text-xs text-muted-foreground mt-1">System uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base md:text-lg font-headline font-bold">Machine Utilization</CardTitle>
            <CardDescription className="text-xs">Weekly load distribution across all regions.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                  itemStyle={{ color: 'hsl(var(--primary))', fontSize: '10px' }}
                />
                <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.usage > 80 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.03]">
            <CardHeader>
              <div className="flex items-center gap-2">
                 <Activity className="h-4 w-4 text-primary" />
                 <CardTitle className="text-base font-headline font-bold">Fleet Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {machines.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono">{m.id}</span>
                    <span className="text-[10px] text-muted-foreground">{m.name}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "rounded-full px-2 py-0 border-0 text-[10px]",
                    m.healthScore > 85 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {m.healthScore}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Strategic Move</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">2 CNC units can be moved from Bangalore to Chennai to meet demand.</p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs rounded-lg border-primary/30 h-8">View Plan</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
