
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, BadgeInfo, Loader2, Activity, Zap, Thermometer, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { useSearchParams } from 'next/navigation';

const timeSlots = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

export default function BookingsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: machines } = useCollection(machinesQuery);

  const bookingsQuery = useMemo(() => 
    db && user ? query(collection(db, 'bookings'), where('studentId', '==', user.uid)) : null,
    [db, user]
  );
  const { data: myBookings, loading: loadingBookings } = useCollection(bookingsQuery);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const machineId = searchParams.get('machineId');
    if (machineId) setSelectedMachineId(machineId);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !profile) return;
    if (!date) {
      toast({ variant: "destructive", title: "Date Missing", description: "Please select a training date from the calendar." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const selectedMachine = machines.find(m => m.id === selectedMachineId);
      await addDoc(collection(db, 'bookings'), {
        studentId: user.uid,
        studentName: profile.name || user.email?.split('@')[0],
        machineId: selectedMachineId,
        machineName: selectedMachine?.name || selectedMachineId,
        centerId: selectedMachine?.centerId || 'default',
        timeSlot: selectedSlot,
        date: date.toISOString(),
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      
      toast({ title: "Booking Submitted", description: "Your request is pending teacher approval." });
      setSelectedMachineId('');
      setSelectedSlot('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedBookings = myBookings.filter(b => b.status === 'Approved');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Student Portal</h1>
          <p className="text-muted-foreground text-sm">Initiate equipment reservations and track your certification path.</p>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
           <Badge variant="outline" className="bg-primary/10 text-primary border-0 rounded-xl px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
            Tier: {profile?.skillLevel || 'Beginner'}
           </Badge>
           <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Experience Logs</span>
            <span className="text-sm font-bold text-white">{profile?.totalHours || 0} Hrs</span>
           </div>
        </div>
      </div>

      {approvedBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-headline font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/20"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
            Active Operational Nodes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedBookings.map(booking => (
              <Card key={booking.id} className="tech-gradient border-0 text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Activity className="h-20 w-20" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start relative z-10">
                    <Badge className="bg-white/20 hover:bg-white/30 text-[9px] uppercase tracking-widest border-0 rounded-full px-3">Session Live</Badge>
                    <span className="text-[10px] opacity-70 font-mono font-bold">NODE_{booking.id.slice(0, 4).toUpperCase()}</span>
                  </div>
                  <CardTitle className="text-2xl mt-4 font-headline">{booking.machineName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-[10px] opacity-70 mb-2 font-bold uppercase tracking-widest">
                        <Thermometer className="h-3.5 w-3.5" /> Core Temp
                      </div>
                      <p className="text-2xl font-bold">38.2°C</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-[10px] opacity-70 mb-2 font-bold uppercase tracking-widest">
                        <Activity className="h-3.5 w-3.5" /> Vibration
                      </div>
                      <p className="text-2xl font-bold">0.012mm</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-80">
                      <span>Module Progress</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2 bg-white/10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden shadow-2xl border">
          <CardHeader className="bg-white/[0.03] border-b border-white/5 p-8">
            <CardTitle className="font-headline text-2xl">New Equipment Reservation</CardTitle>
            <CardDescription className="text-base">Select a machine and time slot to begin your training module.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Target Machine</Label>
                    <Select onValueChange={setSelectedMachineId} value={selectedMachineId}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14 text-base focus:ring-primary/50">
                        <SelectValue placeholder="Identify machine..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 rounded-2xl">
                        {machines.filter(m => m.status === 'Available').map(m => (
                          <SelectItem key={m.id} value={m.id} className="rounded-xl py-3 px-4">{m.name} ({m.type})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Time Slot</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {timeSlots.map(slot => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedSlot === slot ? 'default' : 'outline'}
                          className={cn(
                            "justify-start rounded-2xl h-14 px-6 border-white/10 transition-all font-medium",
                            selectedSlot === slot 
                              ? "bg-primary border-0 text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                              : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                          )}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className={cn("mr-3 h-5 w-5", selectedSlot === slot ? "text-white" : "text-primary")} />
                          <span className="text-sm">{slot}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Training Date</Label>
                   <div className="border border-white/10 rounded-[2rem] p-4 bg-white/[0.03] shadow-inner flex flex-col items-center">
                      <Calendar 
                        mode="single" 
                        selected={date} 
                        onSelect={setDate} 
                        className="rounded-md border-0"
                        captionLayout="dropdown"
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button size="lg" className="w-full tech-gradient border-0 rounded-2xl h-16 text-base font-bold shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-transform" disabled={!selectedMachineId || !selectedSlot || isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : "Request Machine Access"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden shadow-2xl border">
             <CardHeader className="bg-white/[0.03] border-b border-white/5 px-8 py-6">
               <CardTitle className="text-xl font-headline">Status Uplink</CardTitle>
             </CardHeader>
             <CardContent className="px-8 py-8 space-y-6">
               {loadingBookings ? (
                 <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" /></div>
               ) : (
                 myBookings.map(booking => (
                   <div key={booking.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-all">
                     <div className="flex items-center justify-between mb-4">
                       <Badge className={cn(
                         "rounded-xl px-4 py-1 text-[9px] uppercase font-bold tracking-widest border-0",
                         booking.status === 'Approved' ? 'bg-green-500/20 text-green-500' :
                         booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                         'bg-red-500/20 text-red-500'
                       )}>
                         {booking.status}
                       </Badge>
                       <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">ID_{booking.id.slice(0, 4).toUpperCase()}</span>
                     </div>
                     <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{booking.machineName}</h4>
                     <div className="mt-4 space-y-2">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <CalendarIcon className="h-3.5 w-3.5" /> {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" /> {booking.timeSlot}
                        </p>
                     </div>
                   </div>
                 ))
               )}
               {!loadingBookings && myBookings.length === 0 && (
                <div className="text-center py-12 opacity-30">
                  <BadgeInfo className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Active Bookings</p>
                </div>
               )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
