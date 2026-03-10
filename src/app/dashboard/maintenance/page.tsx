"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, Wrench, History, CheckCircle2, 
  Search, Filter, Sparkles, BrainCircuit, Loader2 
} from 'lucide-react';
import { MockDB, MaintenanceTicket, Machine } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { predictiveMaintenanceInsightGen, PredictiveMaintenanceInsightGenOutput } from '@/ai/flows/predictive-maintenance-insight-gen-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MockDB.tickets);
  const [machines, setMachines] = useState<Machine[]>(MockDB.machines);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<PredictiveMaintenanceInsightGenOutput | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);

  const filteredTickets = tickets.filter(t => 
    t.machineId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runDiagnostic = async (machine: Machine) => {
    setIsAiLoading(machine.id);
    try {
      const insight = await predictiveMaintenanceInsightGen({
        machineId: machine.id,
        prediction: machine.healthScore < 85 ? "High wear detected on main spindle bearings." : "Optimal operation detected.",
        usageHours: machine.usageHours,
        lastMaintenanceDate: machine.lastMaintenance,
        maintenanceHistory: ["Routine inspection", "Belt replacement (6mo ago)"],
        currentSensorData: {
          temp: machine.temperature,
          vibration: machine.vibration,
          load: "Normal"
        }
      });
      setAiInsight(insight);
      setIsInsightOpen(true);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Predictive Maintenance</h1>
          <p className="text-muted-foreground">AI-powered equipment health monitoring and ticketing.</p>
        </div>
        <Button className="rounded-xl tech-gradient border-0">
          <Wrench className="mr-2 h-4 w-4" /> Log Manual Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/5 bg-white/[0.02] shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-headline">Open Maintenance Tickets</CardTitle>
                <CardDescription>Currently tracked issues across centers.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter tickets..." 
                  className="pl-9 h-9 w-48 bg-white/5 border-white/10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-mono text-xs font-bold text-primary">{ticket.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{ticket.machineId}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.issue}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "rounded-full border-0 font-medium",
                          ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                          ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-blue-500/10 text-blue-500'
                        )}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "w-2 h-2 rounded-full",
                             ticket.status === 'Open' ? 'bg-red-500' : 'bg-yellow-500'
                           )} />
                           <span className="text-xs">{ticket.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 hover:bg-white/10">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/5 bg-white/[0.02]">
               <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20"><History className="h-4 w-4 text-primary" /></div>
                  <CardTitle className="text-sm font-headline">Recent Resolutions</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium">CNC-102 Calibration Complete</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">2d ago</span>
                    </div>
                  ))}
               </CardContent>
            </Card>
            <Card className="border-white/5 bg-accent/5 border-accent/20">
               <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent/20"><AlertTriangle className="h-4 w-4 text-accent" /></div>
                  <CardTitle className="text-sm font-headline">Maintenance Backlog</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-2xl font-bold">14.5 hrs</p>
                  <p className="text-xs text-muted-foreground mt-1">Average resolution time this week</p>
               </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Health Watch */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.03] backdrop-blur-md overflow-hidden border">
            <div className="p-1 bg-gradient-to-r from-primary to-accent" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline">AI Health Sentinel</CardTitle>
              </div>
              <CardDescription>Predictive analysis of machine sensors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {machines.filter(m => m.healthScore < 95).slice(0, 3).map(machine => (
                 <div key={machine.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-primary font-mono">{machine.id}</span>
                      <Badge variant="outline" className={cn(
                        "rounded-full text-[10px] font-bold border-0",
                        machine.healthScore < 80 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                      )}>
                        {machine.healthScore < 80 ? 'At Risk' : 'Monitoring'}
                      </Badge>
                    </div>
                    <div className="flex items-end justify-between">
                       <div className="space-y-1">
                          <p className="text-sm font-bold">{machine.name}</p>
                          <p className="text-[10px] text-muted-foreground">Vibration: {machine.vibration}mm</p>
                       </div>
                       <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-all text-xs"
                        onClick={() => runDiagnostic(machine)}
                        disabled={isAiLoading === machine.id}
                       >
                         {isAiLoading === machine.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5 mr-1" />} 
                         AI Diagnostic
                       </Button>
                    </div>
                 </div>
               ))}
               <Button variant="outline" className="w-full text-xs rounded-xl border-white/10 hover:bg-white/5">
                 Run Full Fleet Diagnostic
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Insight Dialog */}
      <Dialog open={isInsightOpen} onOpenChange={setIsInsightOpen}>
        <DialogContent className="bg-card border-white/10 max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
               <div className="p-2 rounded-xl bg-primary/20"><Sparkles className="h-5 w-5 text-primary" /></div>
               <DialogTitle className="text-2xl font-headline">AI Diagnostic Insight</DialogTitle>
            </div>
            <DialogDescription>Generative AI analysis based on usage logs and real-time telemetry.</DialogDescription>
          </DialogHeader>
          {aiInsight && (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Technical Explanation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight.explanation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider">Preventative Measures</h4>
                    <ul className="space-y-2">
                       {aiInsight.preventativeMeasures.map((measure, i) => (
                         <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                            {measure}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Risk Severity</p>
                    <Badge className={cn(
                      "text-xl px-6 py-2 rounded-xl border-0",
                      aiInsight.severity === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                    )}>
                      {aiInsight.severity}
                    </Badge>
                 </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button className="flex-1 tech-gradient border-0 rounded-xl" onClick={() => setIsInsightOpen(false)}>Create Work Order</Button>
                <Button variant="outline" className="rounded-xl border-white/10" onClick={() => setIsInsightOpen(false)}>Acknowledge</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
