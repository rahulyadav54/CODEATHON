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
  PieChart,
  Pie,
} from 'recharts';
import { Cpu, Zap, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
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

const machineTypeData = [
  { name: 'CNC', value: 35 },
  { name: '3D Printer', value: 25 },
  { name: 'Welding', value: 20 },
  { name: 'Electrical', value: 20 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#00C49F', '#FFBB28'];

export default function DashboardOverview() {
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    setMachines(MockDB.machines);
  }, []);

  const totalMachines = machines.length;
  const inUse = machines.filter(m => m.status === 'In Use').length;
  const inMaintenance = machines.filter(m => m.status === 'Under Maintenance').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor real-time system performance and machine health.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="rounded-lg h-9">Download Report</Button>
           <Link href="/dashboard/machines">
             <Button className="rounded-lg h-9 bg-primary text-white border-0">Manage Machines</Button>
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Machines</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMachines}</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3 centers</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Currently In Use</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inUse}</div>
            <div className="flex items-center gap-2 mt-2">
               <Progress value={(inUse/totalMachines)*100} className="h-1 bg-white/10" />
               <span className="text-[10px] text-muted-foreground whitespace-nowrap">{Math.round((inUse/totalMachines)*100)}% load</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inMaintenance}</div>
            <p className="text-xs text-destructive mt-1">2 urgent tickets pending</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Center Health</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">Operational efficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Utilization Chart */}
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-lg font-headline font-bold">Weekly Machine Utilization</CardTitle>
            <CardDescription>Average usage percentage across all training centers.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                  itemStyle={{ color: 'hsl(var(--primary))' }}
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

        {/* Predictive Maintenance Alert Card */}
        <Card className="border-white/5 bg-white/[0.03] flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Zap className="h-5 w-5 text-accent" />
               <CardTitle className="text-lg font-headline font-bold">AI Predictive Alerts</CardTitle>
            </div>
            <CardDescription>Real-time anomaly detection insights.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-accent mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Machine CNC-101 Anomaly</h4>
                  <p className="text-xs text-muted-foreground mt-1">High vibration levels (0.05mm) detected. Maintenance recommended within 48 hours.</p>
                  <Button size="sm" className="mt-3 h-8 text-xs bg-accent hover:bg-accent/80 border-0 rounded-lg">Create Ticket</Button>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Efficiency Optimization</h4>
                  <p className="text-xs text-muted-foreground mt-1">3D Printers in Bangalore are idle. Consider relocating 2 units to Chennai Center.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="pt-0 border-t border-white/5 mt-auto">
             <Button variant="link" className="text-xs text-primary w-full justify-start p-0 h-10">View all AI insights</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {/* Distribution Pie Chart */}
          <Card className="border-white/5 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold">Machine Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={machineTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {machineTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {machineTypeData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Machine List Snapshot */}
          <Card className="lg:col-span-2 border-white/5 bg-white/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-headline font-bold">Machine Health Status</CardTitle>
                <CardDescription>Quick view of critical infrastructure.</CardDescription>
              </div>
              <Link href="/dashboard/machines">
                <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-white/5">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {machines.slice(0, 4).map(machine => (
                  <div key={machine.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "h-10 w-10 rounded-lg flex items-center justify-center",
                         machine.status === 'Available' ? 'bg-green-500/10 text-green-500' :
                         machine.status === 'In Use' ? 'bg-yellow-500/10 text-yellow-500' :
                         'bg-red-500/10 text-red-500'
                       )}>
                         <Cpu className="h-5 w-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold group-hover:text-primary transition-colors">{machine.name}</p>
                         <p className="text-xs text-muted-foreground">{machine.id} • {machine.centerId === 'c1' ? 'Chennai' : 'Delhi'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="hidden sm:block text-right">
                         <p className="text-xs font-medium">Health Score</p>
                         <p className={cn(
                           "text-sm font-bold",
                           machine.healthScore > 90 ? 'text-green-500' : machine.healthScore > 75 ? 'text-yellow-500' : 'text-red-500'
                         )}>{machine.healthScore}%</p>
                       </div>
                       <Badge variant="outline" className={cn(
                          "rounded-full px-3 py-0.5 text-[10px] font-medium border-0",
                          machine.status === 'Available' ? 'bg-green-500/10 text-green-500' :
                          machine.status === 'In Use' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                       )}>
                         {machine.status}
                       </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
