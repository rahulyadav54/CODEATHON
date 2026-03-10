
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, Wrench, History, CheckCircle2, 
  Search, Filter, Sparkles, BrainCircuit, Loader2, Plus, MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { predictiveMaintenanceInsightGen, PredictiveMaintenanceInsightGenOutput } from '@/ai/flows/predictive-maintenance-insight-gen-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function MaintenancePage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const ticketsQuery = useMemo(() => db ? collection(db, 'maintenanceTickets') : null, [db]);
  const { data: tickets, loading: loadingTickets } = useCollection(ticketsQuery);

  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: machines, loading: loadingMachines } = useCollection(machinesQuery);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<PredictiveMaintenanceInsightGenOutput | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);

  // New Ticket Form State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newMachineId, setNewMachineId] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTickets = useMemo(() => tickets.filter(t => 
    t.machineId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.issue?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [tickets, searchQuery]);

  const handleLogTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newMachineId || !newIssue) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'maintenanceTickets'), {
        machineId: newMachineId,
        issue: newIssue,
        priority: newPriority,
        status: 'Open',
        assignedTechnician: user?.displayName || 'Unassigned',
        createdAt: serverTimestamp()
      });
      toast({ title: "Ticket Logged", description: "Maintenance work order has been created." });
      setIsNewTicketOpen(false);
      setNewMachineId('');
      setNewIssue('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'maintenanceTickets', ticketId), { status });
      toast({ title: "Status Updated", description: `Ticket marked as ${status}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const runDiagnostic = async (machine: any) => {
    setIsAiLoading(machine.id);
    try {
      const insight = await predictiveMaintenanceInsightGen({
        machineId: machine.id,
        prediction: machine.healthScore < 85 ? "High wear detected on main spindle bearings based on vibration delta." : "Operational parameters are within nominal range.",
        usageHours: machine.usageHours || 0,
        lastMaintenanceDate: machine.lastMaintenance || new Date().toISOString().split('T')[0],
        maintenanceHistory: ["Routine inspection", "Calibration (3mo ago)"],
        currentSensorData: {
          temp: machine.temperature || 32,
          vibration: machine.vibration || 0.01,
          load: "Normal"
        }
      });
      setAiInsight(insight);
      setIsInsightOpen(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Diagnostic Failed", description: "The neural engine is currently saturated. Try again shortly." });
    } finally {
      setIsAiLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Predictive Maintenance</h1>
          <p className="text-muted-foreground">AI-powered equipment health monitoring and ticketing.</p>
        </div>
        
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl tech-gradient border-0 px-6">
              <Plus className="mr-2 h-4 w-4" /> Log Manual Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Create Maintenance Ticket</DialogTitle>
              <DialogDescription>Manually register a fault detected in the field.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogTicket} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Equipment Node</Label>
                <Select onValueChange={setNewMachineId} value={newMachineId}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Identify machine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Issue Description</Label>
                <Input 
                  placeholder="Describe the anomaly..." 
                  className="bg-white/5 border-white/10 rounded-xl"
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Priority Level</Label>
                <Select onValueChange={(v: any) => setNewPriority(v)} value={newPriority}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full tech-gradient border-0 rounded-xl font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Commit Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/5 bg-white/[0.02] shadow-xl rounded-3xl overflow-hidden border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.01]">
              <div>
                <CardTitle className="text-lg font-headline">Active Service Queue</CardTitle>
                <CardDescription>Real-time tracking of operational faults.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by ID or issue..." 
                  className="pl-9 h-9 w-48 bg-white/5 border-white/10 rounded-xl" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="pl-6 text-[10px] uppercase font-bold tracking-widest">ID</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Target Node</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Severity</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                    <TableHead className="text-right pr-6 text-[10px] uppercase font-bold tracking-widest">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTickets ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="pl-6 font-mono text-[10px] font-bold text-primary">#{ticket.id.slice(0, 4)}</TableCell>
                      <TableCell>
                        <p className="text-sm font-bold">{ticket.machineId}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{ticket.issue}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-lg border-0 font-bold text-[9px] uppercase px-2 tracking-tighter",
                          ticket.priority === 'Critical' ? 'bg-red-500/20 text-red-500' :
                          ticket.priority === 'High' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-blue-500/20 text-blue-500'
                        )}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(var(--color),0.5)]",
                             ticket.status === 'Open' ? 'bg-red-500' : 
                             ticket.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'
                           )} />
                           <span className="text-[10px] font-bold uppercase text-muted-foreground">{ticket.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-white/10 rounded-xl">
                            <DropdownMenuItem className="text-xs font-bold py-2 px-4 cursor-pointer" onClick={() => updateTicketStatus(ticket.id, 'In Progress')}>Mark In Progress</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold py-2 px-4 cursor-pointer text-green-500" onClick={() => updateTicketStatus(ticket.id, 'Resolved')}>Mark Resolved</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTickets.length === 0 && !loadingTickets && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 opacity-30">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">All Nodes Stable</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/5 bg-white/[0.02] rounded-3xl border">
               <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20"><History className="h-4 w-4 text-primary" /></div>
                  <CardTitle className="text-sm font-headline font-bold">Recent Field Ops</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  {tickets.filter(t => t.status === 'Resolved').slice(0, 2).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-bold">{t.machineId} Restoration</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold">CLOSED</span>
                    </div>
                  ))}
                  {tickets.filter(t => t.status === 'Resolved').length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-4">No recent resolutions logged.</p>
                  )}
               </CardContent>
            </Card>
            <Card className="border-white/5 bg-accent/5 border-accent/20 rounded-3xl border shadow-xl shadow-accent/5">
               <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20"><AlertTriangle className="h-4 w-4 text-accent" /></div>
                  <CardTitle className="text-sm font-headline font-bold">Latency Index</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-3xl font-bold font-headline tracking-tighter text-accent">14.5 hrs</p>
                  <p className="text-[11px] text-muted-foreground mt-2 font-medium">Average MTTR (Mean Time To Repair)</p>
               </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-white/5 bg-[#1a1c24] border-primary/20 shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrainCircuit className="h-32 w-32" />
            </div>
            <CardHeader className="relative z-10 border-b border-white/5 bg-white/[0.02] p-8">
              <div className="flex items-center gap-3 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-headline font-bold">Health Sentinel</CardTitle>
              </div>
              <CardDescription className="text-xs">Continuous neural analysis of machine sensors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 relative z-10">
               {machines.filter(m => (m.healthScore || 100) < 95).slice(0, 3).map(machine => (
                 <div key={machine.id} className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md uppercase">NODE {machine.id}</span>
                      <Badge className={cn(
                        "rounded-xl text-[9px] font-bold border-0 px-3",
                        (machine.healthScore || 100) < 80 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                      )}>
                        {(machine.healthScore || 100) < 80 ? 'CRITICAL WEAR' : 'ELEVATED VIBE'}
                      </Badge>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                       <div className="space-y-1">
                          <p className="text-sm font-bold truncate max-w-[120px]">{machine.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">HEALTH: {machine.healthScore || 100}%</p>
                       </div>
                       <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 px-4 rounded-xl tech-gradient border-0 text-white font-bold text-[10px] hover:scale-105 transition-all shadow-lg shadow-primary/20"
                        onClick={() => runDiagnostic(machine)}
                        disabled={isAiLoading === machine.id}
                       >
                         {isAiLoading === machine.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4 mr-1.5" />} 
                         DIAGNOSTIC
                       </Button>
                    </div>
                 </div>
               ))}
               <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest rounded-2xl border-white/10 h-12 hover:bg-white/5">
                 Run Full Fleet Sweep
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Insight Dialog */}
      <Dialog open={isInsightOpen} onOpenChange={setIsInsightOpen}>
        <DialogContent className="bg-[#1a1c24] border-white/10 max-w-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <div className="h-1.5 w-full tech-gradient" />
          <div className="p-10 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20"><Sparkles className="h-6 w-6 text-primary" /></div>
                 <div>
                    <DialogTitle className="text-3xl font-headline font-bold">Diagnostic Insight</DialogTitle>
                    <DialogDescription className="text-sm mt-1">AI-driven root cause analysis from multi-node telemetry.</DialogDescription>
                 </div>
              </div>
            </DialogHeader>
            
            {aiInsight && (
              <div className="space-y-8">
                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><BrainCircuit className="h-20 w-20" /></div>
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Neural Synthesis</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">{aiInsight.explanation}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                   <div className="md:col-span-3 space-y-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Wrench className="h-3.5 w-3.5" /> Prescribed Measures
                      </h4>
                      <ul className="space-y-3">
                         {aiInsight.preventativeMeasures.map((measure, i) => (
                           <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
                              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              </div>
                              <span className="text-xs font-medium text-foreground/70">{measure}</span>
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="md:col-span-2 space-y-6">
                      <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center h-full">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">Risk Factor</p>
                        <div className={cn(
                          "text-4xl font-headline font-bold px-8 py-3 rounded-2xl shadow-2xl",
                          aiInsight.severity === 'High' ? 'bg-red-500/20 text-red-500 shadow-red-500/10' : 'bg-yellow-500/20 text-yellow-500 shadow-yellow-500/10'
                        )}>
                          {aiInsight.severity}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 font-bold uppercase leading-tight">Attention Required<br/>Immediately</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <Button className="flex-1 tech-gradient border-0 rounded-2xl h-14 font-bold shadow-xl shadow-primary/20" onClick={() => setIsInsightOpen(false)}>Deploy Work Order</Button>
                  <Button variant="outline" className="rounded-2xl border-white/10 px-8 h-14 font-bold text-muted-foreground hover:bg-white/5" onClick={() => setIsInsightOpen(false)}>Acknowledge</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
