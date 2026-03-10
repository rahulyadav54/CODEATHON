
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { Activity, Thermometer, Zap, Wrench, Loader2, Save, History, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export default function TechnicianUpdatesPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
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
    if (!db || !selectedMachineId) return;

    setIsUpdating(true);
    try {
      const machineRef = doc(db, 'machines', selectedMachineId);
      const updateData = {
        healthScore: health[0],
        temperature: Number(temp) || selectedMachine?.temperature,
        vibration: Number(vibration) || selectedMachine?.vibration,
        usageHours: Number(hours) || selectedMachine?.usageHours,
        lastMaintenance: new Date().toISOString().split('T')[0],
        status: health[0] < 50 ? 'Under Maintenance' : selectedMachine?.status
      };

      await updateDoc(machineRef, updateData);

      // Log maintenance report
      await addDoc(collection(db, 'usageLogs'), {
        machineId: selectedMachineId,
        machineName: selectedMachine?.name,
        type: 'Telemetry Update',
        status: 'Maintenance Logged',
        createdAt: serverTimestamp()
      });

      toast({ title: "Update Successful", description: `${selectedMachine?.name} telemetry synchronized.` });
      
      // Reset form
      setTemp('');
      setVibration('');
      setHours('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Technician Command</h1>
          <p className="text-muted-foreground text-sm">Real-time health reporting and maintenance synchronization.</p>
        </div>
        <div className="p-1 px-4 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <Wrench className="h-3 w-3" />
          Field Technician Mode
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden shadow-2xl border">
          <CardHeader className="bg-white/[0.03] border-b border-white/5">
            <CardTitle className="font-headline text-xl">System Update Form</CardTitle>
            <CardDescription>Calibrate machine sensors and log operational hours.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Select Machine Node</Label>
                    <Select onValueChange={setSelectedMachineId} value={selectedMachineId}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-12">
                        <SelectValue placeholder="Identify equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMachine && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">Live Status</span>
                          <span className="text-sm font-bold">{selectedMachine.status}</span>
                       </div>
                       <Badge variant="outline" className="border-primary/30 text-primary">{selectedMachine.type}</Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Health Score Index</Label>
                      <span className={cn(
                        "text-lg font-bold font-mono",
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
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Temperature (°C)</Label>
                    <div className="relative">
                      <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder={selectedMachine?.temperature?.toString() || "32"} 
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Vibration Delta (mm)</Label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        step="0.001"
                        placeholder={selectedMachine?.vibration?.toString() || "0.02"} 
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12"
                        value={vibration}
                        onChange={(e) => setVibration(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Ops Hours</Label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder={selectedMachine?.usageHours?.toString() || "1200"} 
                        className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full tech-gradient border-0 rounded-2xl h-14 font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                  disabled={!selectedMachineId || isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                  Synchronize Data to Central Fleet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl border shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-headline">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                        <div>
                          <p className="text-xs font-bold">Calibration Log</p>
                          <p className="text-[10px] text-muted-foreground">CNC-102 • Successful</p>
                        </div>
                      </div>
                      <History className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-white/5 bg-accent/10 border-accent/20 rounded-3xl border">
              <CardContent className="p-8 text-center space-y-4">
                 <div className="mx-auto p-4 rounded-2xl bg-accent/20 w-fit">
                    <Activity className="h-8 w-8 text-accent" />
                 </div>
                 <div>
                    <h3 className="text-sm font-headline font-bold">Maintenance Radar</h3>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      4 nodes showing abnormal vibration patterns. Full diagnostic recommended.
                    </p>
                 </div>
                 <Button variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10 h-10 rounded-xl text-xs font-bold">View Anomaly Map</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
