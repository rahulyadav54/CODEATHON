
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Users, Search, MoreHorizontal, UserCog, ShieldCheck, Mail, ShieldAlert, Trash2, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [search, setSearch] = useState('');

  const usersQuery = useMemo(() => db ? collection(db, 'users') : null, [db]);
  const { data: users, loading } = useCollection(usersQuery);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const updateRole = async (userId: string, newRole: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({ title: "Role Updated", description: `User role successfully changed to ${newRole}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to revoke this user's access?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: "Access Revoked", description: "User has been removed from the system." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Revocation Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">User Directory</h1>
          <p className="text-muted-foreground text-sm">Manage access tiers and verify operator identities.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search operators..." 
              className="pl-10 bg-white/5 border-white/10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="rounded-xl tech-gradient border-0 px-6">
            <UserCog className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-white/[0.02] shadow-xl rounded-3xl border overflow-hidden">
        <CardHeader className="bg-white/[0.03] border-b border-white/5">
          <CardTitle className="font-headline text-xl">Active Operators</CardTitle>
          <CardDescription>Comprehensive list of all registered personnel and their security clearances.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] uppercase font-bold tracking-widest">Operator</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Security Tier</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Experience</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                <TableHead className="text-right pr-8 text-[10px] uppercase font-bold tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold shadow-inner">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-lg px-3 py-1 border-0 font-bold text-[10px] uppercase tracking-tighter shadow-sm",
                        user.role === 'Admin' ? 'bg-red-500/20 text-red-500' :
                        user.role === 'Technician' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-green-500/20 text-green-500'
                      )}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                         <span className="text-xs font-bold">{user.skillLevel || 'Beginner'}</span>
                         <span className="text-[10px] text-muted-foreground">{user.totalHours || 0} hrs training</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Verified</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card border-white/10 rounded-2xl shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Management</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer" onClick={() => updateRole(user.id, 'Admin')}><ShieldAlert className="h-4 w-4 text-red-500" /> Make Admin</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer" onClick={() => updateRole(user.id, 'Technician')}><ShieldCheck className="h-4 w-4 text-blue-500" /> Make Technician</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer" onClick={() => updateRole(user.id, 'Trainee')}><Users className="h-4 w-4 text-green-500" /> Make Trainee</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer text-red-500" onClick={() => deleteUser(user.id)}><Trash2 className="h-4 w-4" /> Revoke Access</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
