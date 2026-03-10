
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { History, Activity, Clock, User as UserIcon, Loader2, BarChart, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UsageLogsPage() {
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const logsQuery = useMemo(() => {
    if (!db) return null;
    // Admins and Teachers see all logs
    if (profile?.role === 'Admin' || profile?.role === 'Technician') {
      return query(collection(db, 'usageLogs'), orderBy('createdAt', 'desc'));
    } else {
      // Students see only their logs
      return query(collection(db, 'usageLogs'), where('userId', '==', user?.uid || ''), orderBy('createdAt', 'desc'));
    }
  }, [db, profile, user]);

  const { data: logs, loading } = useCollection(logsQuery);

  const stats = useMemo(() => {
    const total = logs.length;
    const updates = logs.filter(l => l.type === 'Telemetry Update').length;
    const bookings = logs.filter(l => l.type !== 'Telemetry Update').length;
    return { total, updates, bookings };
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">System Activity Logs</h1>
          <p className="text-muted-foreground text-sm">Full audit trail of equipment synchronization and operator activity.</p>
        </div>
        <div className="flex gap-4">
           <Card className="bg-primary/10 border-primary/20 p-2 px-6 rounded-2xl flex items-center gap-4 border">
              <BarChart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Global Events</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-white/5 bg-white/[0.02] shadow-xl rounded-3xl border overflow-hidden">
          <CardHeader className="bg-white/[0.03] border-b border-white/5 p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-xl">Operational Timeline</CardTitle>
                <CardDescription>
                  {profile?.role === 'Admin' || profile?.role === 'Technician' ? 'Master fleet activity index.' : 'Your training and telemetry history.'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-white/10 text-primary uppercase font-bold text-[9px]">Audit Trail Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] uppercase font-bold tracking-widest">Event Type</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Equipment Node</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Operator</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Timestamp</TableHead>
                  <TableHead className="text-right pr-8 text-[10px] uppercase font-bold tracking-widest">Uplink Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                           {log.type === 'Telemetry Update' ? (
                             <Settings2 className="h-4 w-4 text-primary" />
                           ) : (
                             <Clock className="h-4 w-4 text-accent" />
                           )}
                           <span className="text-xs font-bold text-white">{log.type || 'Machine Session'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                           <span className="text-sm font-medium">{log.machineName || log.machineId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                           <span className="text-xs">{log.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-xs text-muted-foreground">
                            {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                         </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                         <Badge className={cn(
                           "rounded-lg px-3 py-1 border-0 text-[10px] font-bold uppercase",
                           log.status === 'Success' || log.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                           'bg-primary/20 text-primary'
                         )}>
                           {log.status || 'Verified'}
                         </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                          <History className="h-12 w-12" />
                          <p className="text-sm font-medium">No activity records found in the telemetry node.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
