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
            <p className="text-[8px] md:text-xs text-muted-foreground mt-1">3 centers</p>
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
               <Progress value={(inUse/totalMachines)*100} className="h-1 bg-white/10" />
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
            <p className="text-[8px] md:text-xs text-destructive mt-1 truncate">Urgent tickets</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">Health</CardTitle>
            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">92%</div>
            <p className="text-[8px] md:text-xs text-muted-foreground mt-1">Efficient</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Utilization Chart */}
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base md:text-lg font-headline font-bold">Machine Utilization</CardTitle>
            <CardDescription className="text-xs">Weekly average across centers.</CardDescription>
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

        {/* Predictive Maintenance Alert Card */}
        <Card className="border-white/5 bg-white/[0.03] flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Zap className="h-4 w-4 md:h-5 md:w-5 text-accent" />
               <CardTitle className="text-base md:text-lg font-headline font-bold">AI Predictive Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-accent mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs md:text-sm">CNC-101 Anomaly</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">High vibration detected. Action required.</p>
                  <Button size="sm" className="mt-3 h-7 md:h-8 text-[10px] bg-accent hover:bg-accent/80 border-0 rounded-lg">Fix Now</Button>
                </div>
              </div>
            </div>
            <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs md:text-sm">Relocation Alert</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Underutilized units in Bangalore.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="pt-0 border-t border-white/5 mt-auto">
             <Button variant="link" className="text-[10px] text-primary w-full justify-start p-0 h-10">All insights</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
