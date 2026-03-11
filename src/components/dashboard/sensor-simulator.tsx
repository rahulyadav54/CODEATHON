
'use client';

import { useEffect, useState, useRef } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, addDoc, serverTimestamp, getDocs, setDoc } from 'firebase/firestore';
import { Activity, Play, Square, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { initialMachines } from '@/lib/mock-data';

export function SensorSimulator() {
  const { toast } = useToast();
  const db = useFirestore();
  const machinesQuery = db ? collection(db, 'machines') : null;
  const { data: machines } = useCollection(machinesQuery);
  
  const [isActive, setIsActive] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  
  // Use a ref to store the latest machines to avoid re-triggering the interval effect
  const machinesRef = useRef(machines);
  useEffect(() => {
    machinesRef.current = machines;
  }, [machines]);

  // Logic to seed the database if empty
  const bootstrapFleet = async () => {
    if (!db) return;
    setIsBootstrapping(true);
    try {
      for (const machine of initialMachines.slice(0, 5)) {
        await setDoc(doc(db, 'machines', machine.id), {
          ...machine,
          updatedAt: serverTimestamp()
        });
      }
      toast({
        title: "Fleet Bootstrapped",
        description: "Initial machinery nodes seeded for simulation.",
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Bootstrap Failed", description: error.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    if (!isActive || !db) return;

    const interval = setInterval(async () => {
      const currentMachines = machinesRef.current;
      
      if (currentMachines.length === 0) {
        // No machines to simulate, maybe auto-bootstrap?
        return;
      }

      for (const machine of currentMachines) {
        const machineRef = doc(db, 'machines', machine.id);
        
        // 1. Generate Realistic Fluctuations
        const currentTemp = machine.temperature || 35;
        const tempChange = (Math.random() - 0.45) * 5; 
        const nextTemp = Math.min(Math.max(currentTemp + tempChange, 30), 65);

        const currentVibe = machine.vibration || 0.02;
        const vibeChange = (Math.random() - 0.5) * 0.06;
        const nextVibe = Math.min(Math.max(currentVibe + vibeChange, 0.01), 0.35);

        const nextHours = (machine.usageHours || 0) + (1 / 120); // Simulating progress

        // 2. Calculate Health Score
        let health = 100;
        if (nextTemp > 45) health -= (nextTemp - 45) * 2.5;
        if (nextVibe > 0.12) health -= (nextVibe - 0.12) * 150;
        const finalHealth = Math.min(Math.max(Math.round(health), 0), 100);

        // 3. Update Machine Document
        updateDoc(machineRef, {
          temperature: parseFloat(nextTemp.toFixed(1)),
          vibration: parseFloat(nextVibe.toFixed(3)),
          usageHours: parseFloat(nextHours.toFixed(4)),
          healthScore: finalHealth,
          status: finalHealth < 30 ? 'Under Maintenance' : (machine.status === 'Under Maintenance' ? 'Available' : machine.status),
          updatedAt: serverTimestamp()
        });

        // 4. Automation: Create Maintenance Ticket if Health is Critical
        if (finalHealth < 40 && Math.random() < 0.2) { // 20% chance to log a ticket when critical to avoid spam
          const ticketsRef = collection(db, 'maintenanceTickets');
          addDoc(ticketsRef, {
            machineId: machine.id,
            issue: `Automated Alert: Critical health drop detected (${finalHealth}%). High thermal/vibration variance.`,
            priority: finalHealth < 20 ? 'Critical' : 'High',
            status: 'Open',
            assignedTechnician: 'IoT Sentinel',
            createdAt: serverTimestamp()
          });
        }

        // 5. Random Heartbeat to Usage Logs
        if (Math.random() < 0.05) {
          addDoc(collection(db, 'usageLogs'), {
            machineId: machine.id,
            machineName: machine.name,
            type: 'Sensor Heartbeat',
            status: finalHealth < 50 ? 'Warning' : 'Healthy',
            userName: 'IoT System',
            createdAt: serverTimestamp()
          });
        }
      }
      
      setLastSync(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, db]);

  const toggleSimulation = () => {
    if (machines.length === 0 && !isActive) {
      bootstrapFleet();
    }
    setIsActive(!isActive);
    toast({
      title: !isActive ? "IoT Simulation Active" : "Simulation Paused",
      description: !isActive 
        ? "Streaming live telemetry for all nodes every 5 seconds." 
        : "Real-time data stream disconnected.",
      variant: !isActive ? "default" : "destructive"
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-[#1a1c24]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 animate-in slide-in-from-right-8 duration-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">IoT Stream</span>
          </div>
          {lastSync && isActive ? (
            <span className="text-[9px] text-primary font-mono mt-1 font-bold">
              UPLINK: {lastSync.toLocaleTimeString()}
            </span>
          ) : (
            <span className="text-[9px] text-muted-foreground/40 font-bold uppercase mt-1 tracking-widest">
              {isBootstrapping ? 'Seeding Fleet...' : 'Offline'}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {machines.length === 0 && !isActive && (
            <Button 
              size="sm" 
              onClick={bootstrapFleet}
              variant="outline"
              className="rounded-xl h-11 px-4 border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest"
              disabled={isBootstrapping}
            >
              {isBootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Seed Fleet
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={toggleSimulation}
            variant={isActive ? "destructive" : "default"}
            className={`rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest transition-all ${!isActive ? 'tech-gradient border-0 shadow-lg shadow-primary/20' : ''}`}
          >
            {isActive ? (
              <><Square className="h-3 w-3 mr-2" /> Stop Simulation</>
            ) : (
              <><Play className="h-3 w-3 mr-2" /> Start Live Feed</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
