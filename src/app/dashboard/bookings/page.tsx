"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MockDB } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

const timeSlots = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

export default function BookingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Machine Booking</h1>
          <p className="text-muted-foreground">Reserve time slots for specific training machinery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="bg-white/[0.03] border-b border-white/5">
            <CardTitle className="font-headline">Create New Reservation</CardTitle>
            <CardDescription>Select a machine and preferred time slot for your session.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Training Machine</Label>
                    <Select onValueChange={setSelectedMachine} value={selectedMachine}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                        <SelectValue placeholder="Choose a machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {MockDB.machines.filter(m => m.status === 'Available').map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Purpose of Booking</Label>
                    <Input className="bg-white/5 border-white/10 rounded-xl h-11" placeholder="e.g. Advanced Cert Project" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Available Time Slots</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {timeSlots.map(slot => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedSlot === slot ? 'default' : 'outline'}
                          className={cn(
                            "justify-start rounded-xl h-11 px-4 border-white/10",
                            selectedSlot === slot ? "bg-primary border-0" : "bg-white/5 hover:bg-white/10"
                          )}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-sm font-medium">Select Training Date</Label>
                   <div className="border border-white/10 rounded-2xl p-4 bg-white/5">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                      />
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" className="w-full tech-gradient border-0 rounded-xl h-12 text-lg font-bold" disabled={!selectedMachine || !selectedSlot}>
                  {isSuccess ? <CheckCircle2 className="mr-2 h-5 w-5" /> : null}
                  {isSuccess ? "Booking Confirmed" : "Confirm Reservation"}
                </Button>
                {isSuccess && (
                  <p className="text-center text-xs text-green-500 mt-2 font-medium">Your slot has been reserved. A confirmation email was sent.</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing Bookings & Sidebar */}
        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden shadow-xl">
             <CardHeader>
               <CardTitle className="text-lg font-headline">My Active Bookings</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {MockDB.bookings.map(booking => (
                 <div key={booking.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                     <Badge className="bg-primary/20 text-primary border-0 rounded-md text-[10px]">Upcoming</Badge>
                     <span className="text-[10px] text-muted-foreground">{booking.id}</span>
                   </div>
                   <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{booking.machineId}</h4>
                   <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                     <CalendarIcon className="h-3 w-3" /> Today • {booking.timeSlot}
                   </p>
                 </div>
               ))}
               <Button variant="ghost" className="w-full text-xs text-muted-foreground h-8">View booking history</Button>
             </CardContent>
           </Card>

           <Card className="border-white/5 bg-accent/5 border-accent/20 rounded-3xl overflow-hidden shadow-xl">
             <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="p-3 rounded-2xl bg-accent/20">
                      <CalendarIcon className="h-8 w-8 text-accent" />
                   </div>
                   <div>
                     <h3 className="font-headline font-bold text-lg">Group Training?</h3>
                     <p className="text-sm text-muted-foreground mt-1">Trainers can book multiple machines for group certifications.</p>
                   </div>
                   <Button variant="outline" className="rounded-xl border-accent/30 text-accent hover:bg-accent/10 w-full">Request Batch Booking</Button>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}