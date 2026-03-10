"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, User as UserIcon, Calendar, Clock, GraduationCap } from 'lucide-react';
import { MockDB, Booking, BookingStatus } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function TrainerApprovalsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(MockDB.bookings.filter(b => b.status === 'Pending'));

  const handleAction = (id: string, status: BookingStatus) => {
    MockDB.updateBookingStatus(id, status);
    setBookings(prev => prev.filter(b => b.id !== id));
    toast({
      title: `Booking ${status}`,
      description: `Student request ${id} has been ${status.toLowerCase()}.`
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      <div>
        <h1 className="text-3xl font-headline font-bold">Trainer Command Center</h1>
        <p className="text-muted-foreground text-sm">Review and approve student machine access requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card className="border-white/5 bg-white/[0.02] shadow-xl rounded-3xl border">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Pending Approvals</CardTitle>
              <CardDescription>Verify user skill levels before granting machine access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest">Student</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest">Machine</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest">Time Slot</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest">Skill Level</TableHead>
                      <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => {
                      const student = MockDB.users.find(u => u.id === b.studentId);
                      return (
                        <TableRow key={b.id} className="border-white/5 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10"><UserIcon className="h-3.5 w-3.5 text-primary" /></div>
                              <div>
                                <p className="text-xs font-bold">{b.studentName}</p>
                                <p className="text-[10px] text-muted-foreground">{student?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 font-mono">{b.machineId}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                               <span className="flex items-center gap-1 text-[10px] font-medium"><Calendar className="h-2.5 w-2.5" /> Today</span>
                               <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" /> {b.timeSlot}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "text-[10px] border-0 rounded-full font-bold",
                              student?.skillLevel === 'Expert' ? 'bg-purple-500/10 text-purple-500' :
                              student?.skillLevel === 'Intermediate' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-green-500/10 text-green-500'
                            )}>
                              {student?.skillLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={() => handleAction(b.id, 'Approved')}><CheckCircle2 className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => handleAction(b.id, 'Rejected')}><XCircle className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-xs">No pending requests at the moment.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl border shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-headline">Training Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Approved Today</p>
                    <p className="text-2xl font-bold">12</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Mentorship Hrs</p>
                    <p className="text-2xl font-bold">{MockDB.currentUser.totalHours}</p>
                 </div>
                 <Button variant="outline" className="w-full text-xs rounded-xl border-white/10 h-9">View My Schedule</Button>
              </CardContent>
           </Card>

           <Card className="border-white/5 bg-primary/10 border-primary/20 rounded-3xl border">
              <CardContent className="p-6 text-center space-y-4">
                 <div className="mx-auto p-3 rounded-2xl bg-primary/20 w-fit"><GraduationCap className="h-6 w-6 text-primary" /></div>
                 <div>
                    <h3 className="text-sm font-headline font-bold">New Certifications</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">4 students are ready for the Expert CNC module evaluation.</p>
                 </div>
                 <Button className="w-full tech-gradient border-0 text-[10px] h-9 rounded-xl font-bold">Launch Assessment</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}