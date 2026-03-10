
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, BadgeInfo, Loader2, Activity, Zap, Thermometer } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

const timeSlots = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

export default function BookingsPage() {
  const { toast } = useToast();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !profile) return;
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
        date: date?.toISOString(),
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      
      toast({ title: "Booking Submitted", description: "Your request is pending trainer approval." });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Machine Portal</h1>
          <p className="text-muted-foreground text-sm">Reserve equipment and track your training sessions.</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
           <Badge variant="outline" className="bg-primary/10 text-primary border-0 rounded-lg">{profile?.skillLevel || 'Beginner'}</Badge>
           <span className="text-xs font-bold text-muted-foreground">{profile?.totalHours || 0} hrs trained</span>
        </div>
      </div>

      {approvedBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-headline font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Active Training Console
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedBookings.map(booking => (
              <Card key={booking.id} className="tech-gradient border-0 text-white rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-white/20 hover:bg-white/30 text-[10px] border-0">Live Session</Badge>
                    <span className="text-[10px] opacity-70 font-mono">#{booking.id.slice(0, 4)}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{booking.machineName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-3 rounded-2xl">
                      <div className="flex items-center gap-2 text-[10px] opacity-70 mb-1 font-bold uppercase tracking-wider">
                        <Thermometer className="h-3 w-3" /> Temp
                      </div>
                      <p className="text-xl font-bold">42°C</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-2xl">
                      <div className="flex items-center gap-2 text-[10px] opacity-70 mb-1 font-bold uppercase tracking-wider">
                        <Activity className="h-3 w-3" /> Vibration
                      </div>
                      <p className="text-xl font-bold">0.02mm</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                      <span>Milling Completion</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-1.5 bg-white/10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden shadow-xl border">
          <CardHeader className="bg-white/[0.03] border-b border-white/5">
            <CardTitle className="font-headline text-xl">New Reservation Request</CardTitle>
            <CardDescription>Select a machine. Trainers will review your skill level before approval.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Machine</Label>
                    <Select onValueChange={setSelectedMachineId} value={selectedMachineId}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                        <SelectValue placeholder="Choose equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.filter(m => m.status === 'Available').map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name} ({m.type})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Slots</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {timeSlots.map(slot => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedSlot === slot ? 'default' : 'outline'}
                          className={cn(
                            "justify-start rounded-xl h-11 px-4 border-white/10",
                            selectedSlot === slot ? "bg-primary border-0 text-white" : "bg-white/5 hover:bg-white/10"
                          )}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          <span className="text-xs">{slot}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Session Date</Label>
                   <div className="border border-white/10 rounded-2xl p-4 bg-white/5">
                      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" className="w-full tech-gradient border-0 rounded-xl h-12 text-sm font-bold" disabled={!selectedMachineId || !selectedSlot || isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit for Approval"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden shadow-xl border">
             <CardHeader>
               <CardTitle className="text-lg font-headline">Booking Status</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {loadingBookings ? (
                 <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
               ) : (
                 myBookings.map(booking => (
                   <div key={booking.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 group">
                     <div className="flex items-center justify-between mb-3">
                       <Badge className={cn(
                         "rounded-md text-[10px] border-0",
                         booking.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                         booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                         'bg-red-500/10 text-red-500'
                       )}>
                         {booking.status}
                       </Badge>
                       <span className="text-[10px] font-mono text-primary font-bold">#{booking.id.slice(0, 4)}</span>
                     </div>
                     <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">{booking.machineName || booking.machineId}</h4>
                     <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                       <CalendarIcon className="h-3 w-3" /> {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'} • {booking.timeSlot}
                     </p>
                   </div>
                 ))
               )}
               {!loadingBookings && myBookings.length === 0 && <p className="text-xs text-center text-muted-foreground py-4">No active bookings found.</p>}
             </CardContent>
           </Card>

           <Card className="border-white/5 bg-accent/5 border-accent/20 rounded-3xl overflow-hidden shadow-xl border">
             <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto p-3 rounded-2xl bg-accent/20 w-fit">
                   <BadgeInfo className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm">Need a suggestion?</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">AI Zaya can analyze your skill level and recommend the best equipment for your next session.</p>
                </div>
                <Button variant="outline" className="rounded-xl border-accent/30 text-accent hover:bg-accent/10 w-full text-xs h-9">Ask Zaya</Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
