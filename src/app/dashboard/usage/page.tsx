
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { History, Activity, Clock, User as UserIcon, Loader2, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UsageLogsPage() {
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const logsQuery = useMemo(() => {
    if (!db) return null;
    if (profile?.role === 'Admin') {
      return query(collection(db, 'usageLogs'), orderBy('createdAt', 'desc'));
    } else {
      return query(collection(db, 'usageLogs'), where('userId', '==', user?.uid || ''), orderBy('createdAt', 'desc'));
    }
  }, [db, profile, user]);

  const { data: logs, loading } = useCollection(logsQuery);

  const stats = useMemo(() => {
    const total = logs.length;
    const active = logs.filter(l => l.status === 'Live').length;
    const completed = logs.filter(l => l.status === 'Completed').length;
    return { total, active, completed };
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Machine Usage Logs</h1>
          <p className="text-muted-foreground text-sm">Historical telemetry of equipment utilization sessions.</p>
        </div>
        <div className="flex gap-4">
           <Card className="bg-primary/10 border-primary/20 p-2 px-6 rounded-2xl flex items-center gap-4 border">
              <BarChart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Total Logs</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-white/5 bg-white/[0.02] shadow-xl rounded-3xl border overflow-hidden">
          <CardHeader className="bg-white/[0.03] border-b border-white/5">
            <CardTitle className="font-headline text-xl">Session History</CardTitle>
            <CardDescription>
              {profile?.role === 'Admin' ? 'Global fleet utilization timeline.' : 'Your personal machine usage history.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] uppercase font-bold tracking-widest">Session ID</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Equipment</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Operator</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Start Time</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Duration</TableHead>
                  <TableHead className="text-right pr-8 text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-8 font-mono text-[10px] text-primary font-bold">
                        #{log.id.slice(0, 8)}
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
                         <span className="text-xs text-muted-foreground">{log.startTime ? new Date(log.startTime).toLocaleString() : 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {log.duration ? `${log.duration} mins` : '--'}
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                         <Badge className={cn(
                           "rounded-lg px-3 py-1 border-0 text-[10px] font-bold uppercase",
                           log.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                           log.status === 'Live' ? 'bg-yellow-500/20 text-yellow-500' :
                           'bg-primary/20 text-primary'
                         )}>
                           {log.status || 'Archived'}
                         </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                          <History className="h-12 w-12" />
                          <p className="text-sm font-medium">No usage records found in current logs.</p>
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
