
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { Users, Search, MoreHorizontal, UserCog, Mail, ShieldAlert, Trash2, Loader2, Plus, Wrench, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase config for secondary app bridge to avoid logging out the admin
const firebaseConfig = {
  apiKey: "AIzaSyB5E2bcxYpLFOj7v0tA4ryGKvZspDMQn4I",
  authDomain: "codeathon-ai-ff8c1.firebaseapp.com",
  databaseURL: "https://codeathon-ai-ff8c1-default-rtdb.firebaseio.com",
  projectId: "codeathon-ai-ff8c1",
  storageBucket: "codeathon-ai-ff8c1.firebasestorage.app",
  messagingSenderId: "297428971976",
  appId: "1:297428971976:web:ab31ef239109ddc03d50fd",
  measurementId: "G-45RBLM0RJX"
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [search, setSearch] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Trainee' | 'Technician' | 'Admin'>('Trainee');
  const [newSkill, setNewSkill] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Beginner');

  const usersQuery = useMemo(() => db ? collection(db, 'users') : null, [db]);
  const { data: users, loading } = useCollection(usersQuery);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newName || !newEmail || !newPassword) {
      toast({ variant: "destructive", title: "Missing Data", description: "All fields including password are required." });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Provision Auth Account via secondary bridge to keep admin session alive
      const secondaryApp = getApps().find(a => a.name === 'SecondaryBridge') || initializeApp(firebaseConfig, 'SecondaryBridge');
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const userId = userCredential.user.uid;

      // 2. Create Firestore Profile
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        name: newName,
        email: newEmail,
        role: newRole,
        skillLevel: newSkill,
        totalHours: 0,
        createdAt: new Date().toISOString()
      });

      // 3. Clear secondary session
      await signOut(secondaryAuth);

      toast({ 
        title: "Operator Registered", 
        description: `${newName} has been enrolled and is ready for uplink.` 
      });
      
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('Trainee');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    if (!confirm("Are you sure you want to revoke this user's access? This does not delete their Auth account.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: "Access Revoked", description: "User profile has been removed from the directory." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Revocation Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">User Directory</h1>
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

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl tech-gradient border-0 px-6 font-bold shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1c24] border-white/10 max-w-md rounded-[2rem] p-0 overflow-hidden shadow-2xl">
              <div className="h-1.5 w-full tech-gradient" />
              <form onSubmit={handleAddUser}>
                <div className="p-8 space-y-6">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <UserCog className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle className="text-2xl font-headline font-bold">Enroll Operator</DialogTitle>
                    </div>
                    <DialogDescription className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">
                      Provision a new identity on the management network.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Full Legal Name</Label>
                      <Input 
                        placeholder="e.g. Priya Sharma" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-white/[0.03] border-white/10 rounded-xl h-12 focus:border-primary/40"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Operational Email</Label>
                      <Input 
                        type="email" 
                        placeholder="operator@codeathon.ai" 
                        value={newEmail} 
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-white/[0.03] border-white/10 rounded-xl h-12 focus:border-primary/40"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Security Key (Password)</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 bg-white/[0.03] border-white/10 rounded-xl h-12 focus:border-primary/40"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Security Tier</Label>
                        <Select onValueChange={(v: any) => setNewRole(v)} value={newRole}>
                          <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-white/10 rounded-xl">
                            <SelectItem value="Trainee">Student</SelectItem>
                            <SelectItem value="Technician">Teacher</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Experience Level</Label>
                        <Select onValueChange={(v: any) => setNewSkill(v)} value={newSkill}>
                          <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-white/10 rounded-xl">
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="p-8 pt-0">
                  <Button 
                    type="submit" 
                    className="w-full tech-gradient border-0 rounded-xl h-14 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Initiate Uplink"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold shadow-inner border border-white/5">
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
                        {user.role === 'Technician' ? 'Teacher' : user.role === 'Trainee' ? 'Student' : user.role}
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
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer" onClick={() => updateRole(user.id, 'Technician')}><Wrench className="h-4 w-4 text-blue-500" /> Make Teacher</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer" onClick={() => updateRole(user.id, 'Trainee')}><Users className="h-4 w-4 text-green-500" /> Make Student</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="gap-2 px-4 py-3 cursor-pointer text-red-500" onClick={() => deleteUser(user.id)}><Trash2 className="h-4 w-4" /> Revoke Access</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 opacity-30">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No matching operators</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
