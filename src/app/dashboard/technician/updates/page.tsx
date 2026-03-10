
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, addDoc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { Activity, Thermometer, Zap, Wrench, Loader2, Save, History, CheckCircle2, AlertCircle, Sparkles, Map, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TechnicianUpdatesPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: machines, loading: loadingMachines } = useCollection(machinesQuery);

  const recentLogsQuery = useMemo(() => 
    db ? query(collection(db, 'usageLogs'), orderBy('createdAt', 'desc'), limit(5)) : null,
    [db]
  );
  const { data: recentLogs } = useCollection(recentLogsQuery);

  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [health, setHealth] = useState([90]);
  const [temp, setTemp] = useState('');
  const [vibration, setVibration] = useState('');
  const [hours, setHours] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnomalyMapOpen, setIsAnomalyMapOpen] = useState(false);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  // Sync form with selected machine data
  useEffect(() => {
    if (selectedMachine) {
      setHealth([selectedMachine.healthScore || 90]);
      setTemp(selectedMachine.temperature?.toString() || '');
      setVibration(selectedMachine.vibration?.toString() || '');
      setHours(selectedMachine.usageHours?.toString() || '');
    }
  }, [selectedMachineId, selectedMachine]);

  const anomalousMachines = useMemo(() => {
    return machines.filter(m => 
      (m.healthScore || 100) < 85 || 
      (m.temperature || 0) > 40 || 
      (m.vibration || 0) > 0.05
    );
  }, [machines]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedMachineId || !user || !profile) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Missing identity or equipment selection."
      });
      return;
    }

    setIsUpdating(true);
    
    const machineRef = doc(db, 'machines', selectedMachineId);
    
    const parsedHealth = health[0];
    const parsedTemp = temp ? parseFloat(temp) : (selectedMachine?.temperature || 25);
    const parsedVibe = vibration ? parseFloat(vibration) : (selectedMachine?.vibration || 0);
    const parsedHours = hours ? parseFloat(hours) : (selectedMachine?.usageHours || 0);

    const updateData = {
      healthScore: parsedHealth,
      temperature: parsedTemp,
      vibration: parsedVibe,
      usageHours: parsedHours,
      lastMaintenance: new Date().toISOString().split('T')[0],
      status: parsedHealth < 50 ? 'Under Maintenance' : (selectedMachine?.status || 'Available'),
      updatedAt: serverTimestamp()
    };

    // Parallel mutations: Machine Telemetry + Audit Log
    setDoc(machineRef, updateData, { merge: true })
      .then(() => {
        // Success feedback
        toast({ 
          title: "Node Synchronized", 
          description: `Telemetry for ${selectedMachine?.name || selectedMachineId} stored successfully.`,
          className: "bg-green-600 text-white font-bold border-green-700",
        });
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uplink Failed",
          description: "Database connection interrupted."
        });
      })
      .finally(() => setIsUpdating(false));

    addDoc(collection(db, 'usageLogs'), {
      machineId: selectedMachineId,
      machineName: selectedMachine?.name || selectedMachineId,
      userId: user.uid,
      userName: profile.name || user.email || 'Technician',
      startTime: new Date().toISOString(),
      type: 'Telemetry Update',
      status: 'Success',
      createdAt: serverTimestamp()
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">Technician Command</h1>
          <p className="text-muted-foreground text-sm">Real-time health reporting and maintenance synchronization.</p>
        </div>
        <div className="p-1 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <Wrench className="h-3 w-3" />
          Field Technician Mode
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden shadow-2xl border">
          <CardHeader className="bg-white/[0.03] border-b border-white/5 p-8">
            <CardTitle className="font-headline text-xl">System Update Form</CardTitle>
            <CardDescription>Calibrate machine sensors and log operational hours.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {!loadingMachines && machines.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-6 text-center">
                <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">No Fleet Data</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">The machinery directory is currently empty. Please seed the fleet from the Machine Management page.</p>
                </div>
                <Link href="/dashboard/machines">
                  <Button className="tech-gradient border-0 rounded-xl px-8 h-12 font-bold shadow-xl shadow-primary/20">
                    Go to Fleet Directory
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] ml-1">Select Machine Node</Label>
                      <Select onValueChange={setSelectedMachineId} value={selectedMachineId}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm focus:ring-primary/40 transition-all">
                          <SelectValue placeholder="Identify equipment" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10 rounded-xl">
                          {loadingMachines ? (
                            <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
                          ) : (
                            machines.map(m => (
                              <SelectItem key={m.id} value={m.id} className="rounded-lg py-3">{m.name} ({m.id})</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedMachine && (
                      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Live Status</span>
                            <span className="text-sm font-bold text-white">{selectedMachine.status}</span>
                         </div>
                         <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold px-3 py-1">
                          {selectedMachine.type}
                         </Badge>
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Health Score Index</Label>
                        <span className={cn(
                          "text-lg font-bold font-mono px-3 py-0.5 rounded-lg bg-black/20",
                          health[0] > 80 ? "text-green-500" : health[0] > 50 ? "text-yellow-500" : "text-red-500"
                        )}>{health[0]}%</span>
                      </div>
                      <Slider
                        value={health}
                        onValueChange={setHealth}
                        max={100}
                        step={1}
                        className="py-4"
                        disabled={!selectedMachineId}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] ml-1">Temperature (°C)</Label>
                      <div className="relative group">
                        <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="number" 
                          placeholder="32" 
                          className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 focus:border-primary/40 shadow-inner"
                          value={temp}
                          onChange={(e) => setTemp(e.target.value)}
                          disabled={!selectedMachineId}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] ml-1">Vibration Delta (mm)</Label>
                      <div className="relative group">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="number" 
                          step="0.001"
                          placeholder="0.02" 
                          className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 focus:border-primary/40 shadow-inner"
                          value={vibration}
                          onChange={(e) => setVibration(e.target.value)}
                          disabled={!selectedMachineId}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] ml-1">Total Ops Hours</Label>
                      <div className="relative group">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="number" 
                          placeholder="1200" 
                          className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 focus:border-primary/40 shadow-inner"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          disabled={!selectedMachineId}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <Button 
                    type="submit" 
                    className="w-full tech-gradient border-0 rounded-2xl h-16 font-bold text-base shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    disabled={!selectedMachineId || isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
                    Synchronize Data to Central Fleet
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl border shadow-xl">
              <CardHeader className="p-6">
                <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground">Recent Node Synchronizations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                 {recentLogs && recentLogs.length > 0 ? (
                   recentLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-default hover:bg-white/[0.08] transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                          <div>
                            <p className="text-xs font-bold text-white">{log.type || 'Telemetry Sync'}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{log.machineId} • {log.userName}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono opacity-30">{log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                    </div>
                   ))
                 ) : (
                   <div className="text-center py-8 opacity-20 flex flex-col items-center gap-2">
                     <History className="h-8 w-8" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">No reports archived</p>
                   </div>
                 )}
              </CardContent>
           </Card>

           <Card className="border-white/5 bg-accent/10 border-accent/20 rounded-3xl border overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity className="h-24 w-24" />
              </div>
              <CardContent className="p-8 text-center space-y-5 relative z-10">
                 <div className="mx-auto p-4 rounded-2xl bg-accent/20 w-fit shadow-lg shadow-accent/10">
                    <Activity className="h-8 w-8 text-accent" />
                 </div>
                 <div>
                    <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-accent">Maintenance Radar</h3>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      Monitoring {anomalousMachines.length} nodes for thermal and vibration variance.
                    </p>
                 </div>
                 <Button 
                  variant="outline" 
                  className="w-full border-accent/30 text-accent hover:bg-accent/10 h-11 rounded-xl text-xs font-bold uppercase tracking-widest"
                  onClick={() => setIsAnomalyMapOpen(true)}
                >
                  View Anomaly Map
                </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Maintenance Radar Anomaly Map Dialog */}
      <Dialog open={isAnomalyMapOpen} onOpenChange={setIsAnomalyMapOpen}>
        <DialogContent className="bg-[#1a1c24] border-white/10 max-w-4xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="h-1.5 w-full bg-accent" />
          <div className="p-10 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20"><Sparkles className="h-6 w-6 text-accent" /></div>
                 <div>
                    <DialogTitle className="text-3xl font-headline font-bold">Anomaly Map</DialogTitle>
                    <DialogDescription className="text-sm mt-1 uppercase tracking-widest font-bold text-accent/60">Live Field Diagnostics</DialogDescription>
                 </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-accent" /> Critical Nodes
                  </h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {anomalousMachines.length > 0 ? (
                      anomalousMachines.map((m) => (
                        <div key={m.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-accent/40 transition-all group">
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-accent font-mono bg-accent/10 px-2 py-0.5 rounded uppercase">ID: {m.id}</span>
                              <Badge className="bg-red-500/20 text-red-500 border-0 text-[9px] font-bold uppercase tracking-tighter">
                                {m.healthScore < 80 ? 'CRITICAL' : 'ELEVATED'}
                              </Badge>
                           </div>
                           <h5 className="text-sm font-bold text-white mb-4">{m.name}</h5>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <p className="text-[9px] uppercase font-bold text-muted-foreground">Thermal</p>
                                 <p className={cn("text-lg font-bold", m.temperature > 45 ? "text-red-500" : "text-white")}>{m.temperature}°C</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[9px] uppercase font-bold text-muted-foreground">Vibration</p>
                                 <p className={cn("text-lg font-bold", m.vibration > 0.05 ? "text-red-500" : "text-white")}>{m.vibration}mm</p>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-4 opacity-30">
                         <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                         <p className="text-sm font-bold uppercase tracking-widest">No Anomalies Detected</p>
                      </div>
                    )}
                  </div>
               </div>

               <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />
                  <div className="relative z-10">
                    <div className="h-32 w-32 rounded-full border-4 border-accent/20 flex items-center justify-center relative">
                       <div className="absolute inset-0 rounded-full border-t-4 border-accent animate-spin" />
                       <Map className="h-12 w-12 text-accent" />
                    </div>
                  </div>
                  <div className="relative z-10 space-y-2">
                     <p className="text-2xl font-headline font-bold">{anomalousMachines.length} Anomaly Hubs</p>
                     <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                        Currently monitoring {machines.length} nodes. {anomalousMachines.length} machines are showing variance from standard operational benchmarks.
                     </p>
                  </div>
                  <Button className="w-full bg-accent text-white hover:bg-accent/80 rounded-2xl h-14 font-bold shadow-xl shadow-accent/20" onClick={() => setIsAnomalyMapOpen(false)}>
                    Acknowledge Radar State
                  </Button>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
