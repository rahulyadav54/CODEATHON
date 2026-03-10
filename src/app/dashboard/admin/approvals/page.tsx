
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, User as UserIcon, Calendar, Clock, GraduationCap, Loader2, ShieldCheck } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, updateDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminApprovalsPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const pendingQuery = useMemo(() => 
    db ? query(collection(db, 'bookings'), where('status', '==', 'Pending')) : null,
    [db]
  );
  const { data: bookings, loading } = useCollection(pendingQuery);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!db) return;
    try {
      const booking = bookings.find(b => b.id === id);
      await updateDoc(doc(db, 'bookings', id), { status });
      
      if (status === 'Approved' && booking) {
        // Log activity
        await addDoc(collection(db, 'usageLogs'), {
          machineId: booking.machineId,
          machineName: booking.machineName,
          userId: booking.studentId,
          userName: booking.studentName,
          startTime: booking.date,
          status: 'Scheduled',
          createdAt: serverTimestamp()
        });
      }

      toast({
        title: `Booking ${status}`,
        description: `Request ${id.slice(0, 4)} has been ${status.toLowerCase()}.`
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Approval Console</h1>
          <p className="text-muted-foreground text-sm">Strategic oversight of machine access and trainee readiness.</p>
        </div>
        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 py-2 px-4 rounded-xl flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          System Administrator Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card className="border-white/5 bg-white/[0.02] shadow-xl rounded-3xl border overflow-hidden">
            <CardHeader className="bg-white/[0.03] border-b border-white/5">
              <CardTitle className="font-headline text-xl">Pending Booking Requests</CardTitle>
              <CardDescription>Review usage intent and safety eligibility before granting access.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest pl-8">Trainee</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Target Equipment</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Scheduled Slot</TableHead>
                    <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest pr-8">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : (
                    bookings.map((b) => (
                      <TableRow key={b.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="pl-8">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{b.studentName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">ID: {b.studentId.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{b.machineName}</span>
                            <Badge variant="outline" className="w-fit text-[9px] border-white/10 mt-1 opacity-60">
                              {b.centerId}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-[11px]">
                             <span className="flex items-center gap-1.5 font-bold"><Calendar className="h-3 w-3 text-muted-foreground" /> {b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}</span>
                             <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> {b.timeSlot}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-3">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-10 px-4 text-green-500 hover:bg-green-500/10 hover:text-green-500 rounded-xl"
                              onClick={() => handleAction(b.id, 'Approved')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-10 px-4 text-red-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl"
                              onClick={() => handleAction(b.id, 'Rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {!loading && bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <ShieldCheck className="h-12 w-12" />
                          <p className="text-sm font-medium">All systems clear. No pending approvals.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-white/5 bg-white/[0.02] rounded-3xl border shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-headline">Operational Velocity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                      <Ticket className="h-12 w-12" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Queue Load</p>
                    <p className="text-3xl font-bold">{bookings.length}</p>
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(bookings.length * 10, 100)}%` }} />
                    </div>
                 </div>
                 <Button variant="outline" className="w-full text-xs rounded-xl border-white/10 h-10 hover:bg-white/5">Analyze Full Schedule</Button>
              </CardContent>
           </Card>

           <Card className="border-white/5 bg-primary/10 border-primary/20 rounded-3xl border">
              <CardContent className="p-8 text-center space-y-5">
                 <div className="mx-auto p-4 rounded-2xl bg-primary/20 w-fit">
                   <GraduationCap className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                    <h3 className="text-sm font-headline font-bold">Certification Pipeline</h3>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      3 Trainees have reached expert status and are ready for performance reviews.
                    </p>
                 </div>
                 <Button className="w-full tech-gradient border-0 text-xs h-10 rounded-xl font-bold shadow-lg shadow-primary/20">Review Skills</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
