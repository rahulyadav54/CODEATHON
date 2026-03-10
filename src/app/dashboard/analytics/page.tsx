"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Activity, Zap, MapPin } from 'lucide-react';
import { MockDB, centers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Mock data for charts
  const usageByCenterData = centers.map(c => ({
    name: c.name.split(' ')[0],
    usage: MockDB.machines.filter(m => m.centerId === c.id).reduce((acc, curr) => acc + curr.usageHours, 0) / 100,
    demand: c.demandLevel === 'high' ? 90 : c.demandLevel === 'medium' ? 60 : 30
  }));

  const machineHealthData = [
    { name: 'Optimal', value: MockDB.machines.filter(m => m.healthScore > 90).length },
    { name: 'Good', value: MockDB.machines.filter(m => m.healthScore > 75 && m.healthScore <= 90).length },
    { name: 'Needs Attention', value: MockDB.machines.filter(m => m.healthScore <= 75).length },
  ];

  const timeSeriesUsage = [
    { time: '08:00', usage: 20 },
    { time: '10:00', usage: 65 },
    { time: '12:00', usage: 85 },
    { time: '14:00', usage: 70 },
    { time: '16:00', usage: 92 },
    { time: '18:00', usage: 45 },
    { time: '20:00', usage: 15 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-headline font-bold">System Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into machine utilization and center efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Peak Efficiency", value: "94.2%", icon: TrendingUp, color: "text-green-500" },
          { label: "Active Trainees", value: "128", icon: Users, color: "text-primary" },
          { label: "Avg Uptime", value: "99.9h/wk", icon: Activity, color: "text-accent" },
          { label: "Power Usage", value: "4.2MW", icon: Zap, color: "text-yellow-500" }
        ].map((stat, i) => (
          <Card key={i} className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-2xl bg-white/5", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-white/5 bg-white/[0.02] shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Utilization vs Demand</CardTitle>
            <CardDescription>Comparison of actual machine hours vs center demand levels.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageByCenterData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="usage" name="Actual Usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand" name="Projected Demand" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Daily Load Profile</CardTitle>
            <CardDescription>Real-time system load throughout the operational day.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesUsage}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="usage" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-white/5 bg-white/[0.02] shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Inventory Health</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={machineHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {machineHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Center Performance Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {centers.map((center, idx) => (
                <div key={center.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">{center.name}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-bold uppercase",
                      center.demandLevel === 'high' ? 'text-red-500' : 'text-green-500'
                    )}>
                      {center.demandLevel} Demand
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        idx === 0 ? "bg-primary w-[85%]" : idx === 1 ? "bg-accent w-[65%]" : "bg-green-500 w-[45%]"
                      )} 
                    />
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
