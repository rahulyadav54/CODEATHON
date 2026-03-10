
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import { Activity, Thermometer, Zap, Wrench, Loader2, Save, History, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export default function TechnicianUpdatesPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: machines, loading: loadingMachines } = useCollection(machinesQuery);

  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [health, setHealth] = useState([90]);
  const [temp, setTemp] = useState('');
  const [vibration, setVibration] = useState('');
  const [hours, setHours] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedMachineId || !user || !profile) return;

    setIsUpdating(true);
    
    const machineRef = doc(db, 'machines', selectedMachineId);
    const updateData = {
      healthScore: health[0],
      temperature: temp ? Number(temp) : (selectedMachine?.temperature || 25),
      vibration: vibration ? Number(vibration) : (selectedMachine?.vibration || 0),
      usageHours: hours ? Number(hours) : (selectedMachine?.usageHours || 0),
      lastMaintenance: new Date().toISOString().split('T')[0],
      status: health[0] < 50 ? 'Under Maintenance' : (selectedMachine?.status || 'Available')
    };

    // Use setDoc with merge to ensure it works even if the specific doc was missed in seeding
    setDoc(machineRef, updateData, { merge: true })
      .then(() => {
        // Log maintenance report to usageLogs
        addDoc(collection(db, 'usageLogs'), {
          machineId: selectedMachineId,
          machineName: selectedMachine?.name || selectedMachineId,
          userId: user.uid,
          userName: profile.name || user.email || 'Technician',
          startTime: new Date().toISOString(),
          type: 'Telemetry Sync',
          status: 'Calibrated',
          createdAt: serverTimestamp()
        });

        toast({ 
          title: "Fleet Synchronized", 
          description: `Telemetry for ${selectedMachine?.name || selectedMachineId} has been updated in the cloud.` 
        });
        
        // Reset form inputs but keep the machine selected for potential further edits
        setTemp('');
        setVibration('');
        setHours('');
      })
      .catch((error: any) => {
        toast({ 
          variant: "destructive", 
          title: "Uplink Failed", 
          description: error.message || "Could not write to the central database." 
        });
      })
      .finally(() => {
        setIsUpdating(false);
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
                          <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Active Status</span>
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
                        placeholder={selectedMachine?.temperature?.toString() || "32"} 
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 focus:border-primary/40 shadow-inner"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
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
                        placeholder={selectedMachine?.vibration?.toString() || "0.02"} 
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 focus:border-primary/40 shadow-inner"
                        value={vibration}
                        onChange={(e) => setVibration(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] ml-1">Total Ops Hours</Label>
                    <div className="relative group">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="number" 
                        placeholder={selectedMachine?.usageHours?.toString() || "1200"} 
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 focus:border-primary/40 shadow-inner"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
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
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl border shadow-xl">
              <CardHeader className="p-6">
                <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-default hover:bg-white/[0.08] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                        <div>
                          <p className="text-xs font-bold text-white">Calibration Log</p>
                          <p className="text-[10px] text-muted-foreground font-mono">NODE-SYNC • Successful</p>
                        </div>
                      </div>
                      <History className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                   </div>
                 ))}
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
                      Real-time anomaly detection is monitoring 4 nodes for abnormal vibration patterns.
                    </p>
                 </div>
                 <Button variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10 h-11 rounded-xl text-xs font-bold uppercase tracking-widest">View Anomaly Map</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
