'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Activity, Zap, Play, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export function SensorSimulator() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: machines } = useCollection(db ? collection(db, 'machines') : null);
  const [isActive, setIsActive] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    if (!isActive || !machines.length || !db) return;

    const interval = setInterval(() => {
      machines.forEach((machine, index) => {
        const machineRef = doc(db, 'machines', machine.id);
        
        // 1. Generate Realistic Fluctuations
        // Temp: 30-60, with bias towards current temp
        const currentTemp = machine.temperature || 35;
        const tempChange = (Math.random() - 0.45) * 4; // Slight upward bias
        const nextTemp = Math.min(Math.max(currentTemp + tempChange, 30), 65);

        // Vibration: 0.01-0.30
        const currentVibe = machine.vibration || 0.02;
        const vibeChange = (Math.random() - 0.5) * 0.05;
        const nextVibe = Math.min(Math.max(currentVibe + vibeChange, 0.01), 0.35);

        // Hours: Incremental
        const nextHours = (machine.usageHours || 0) + (1 / 720); // Adds 5 seconds worth of an hour

        // 2. Calculate Health Score
        // Base 100. -1.5 per degree over 45. -50 per 0.1mm vibration over 0.15
        let health = 100;
        if (nextTemp > 45) health -= (nextTemp - 45) * 2;
        if (nextVibe > 0.15) health -= (nextVibe - 0.15) * 100;
        const finalHealth = Math.min(Math.max(Math.round(health), 0), 100);

        // 3. Update Firestore (Optimistic)
        updateDoc(machineRef, {
          temperature: parseFloat(nextTemp.toFixed(1)),
          vibration: parseFloat(nextVibe.toFixed(3)),
          usageHours: parseFloat(nextHours.toFixed(4)),
          healthScore: finalHealth,
          status: finalHealth < 30 ? 'Under Maintenance' : (machine.status === 'Under Maintenance' ? 'Available' : machine.status),
          updatedAt: serverTimestamp()
        });

        // 4. Log a heartbeat to usageLogs every ~1 minute (every 12th cycle)
        if (Math.random() < 0.08) {
          addDoc(collection(db, 'usageLogs'), {
            machineId: machine.id,
            machineName: machine.name,
            type: 'Sensor Heartbeat',
            status: finalHealth < 50 ? 'Warning' : 'Healthy',
            userName: 'IoT System',
            createdAt: serverTimestamp()
          });
        }
      });
      
      setLastSync(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, machines, db]);

  const toggleSimulation = () => {
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
      <div className="bg-[#1a1c24]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${isActive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Simulation</span>
          </div>
          {lastSync && isActive && (
            <span className="text-[8px] text-muted-foreground/60 font-mono mt-1">
              Last Uplink: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <Button 
          size="sm" 
          onClick={toggleSimulation}
          variant={isActive ? "destructive" : "default"}
          className={`rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest transition-all ${!isActive ? 'tech-gradient border-0' : ''}`}
        >
          {isActive ? (
            <><Square className="h-3 w-3 mr-2" /> Stop Feed</>
          ) : (
            <><Play className="h-3 w-3 mr-2" /> Start Feed</>
          )}
        </Button>
      </div>
    </div>
  );
}
