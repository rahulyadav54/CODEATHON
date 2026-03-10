"use client";

import { useState, useMemo, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Wrench, 
  History,
  Activity,
  Database,
  Loader2,
  Calendar,
  FileUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { MockDB, initialMachines, Machine } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { bulkMachineExtraction } from '@/ai/flows/bulk-machine-extraction-flow';

export default function MachineManagement() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMachines, setExtractedMachines] = useState<any[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: firestoreMachines, loading } = useCollection(machinesQuery);

  const machines = firestoreMachines.length > 0 ? firestoreMachines : MockDB.machines;

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const seedDatabase = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      for (const machine of initialMachines) {
        await setDoc(doc(db, 'machines', machine.id), machine);
      }
      toast({
        title: "Fleet Synchronized",
        description: "20 machinery units have been stored in the central database."
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setIsBulkDialogOpen(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const response = await bulkMachineExtraction({ fileDataUri: base64 });
        setExtractedMachines(response.machines);
        toast({ title: "Extraction Complete", description: `Identified ${response.machines.length} machines from document.` });
      } catch (error: any) {
        toast({ variant: "destructive", title: "AI Error", description: "Failed to read the document. Ensure it's a clear image or PDF." });
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveExtracted = async () => {
    if (!db) return;
    try {
      for (const machine of extractedMachines) {
        const machineData = {
          ...machine,
          status: 'Available',
          usageHours: 0,
          healthScore: 100,
          temperature: 25,
          vibration: 0,
          lastMaintenance: new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, 'machines', machine.id), machineData);
      }
      toast({ title: "Bulk Import Success", description: `${extractedMachines.length} units added to fleet.` });
      setIsBulkDialogOpen(false);
      setExtractedMachines([]);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    }
  };

  const isAdmin = profile?.role === 'Admin';
  const isStudent = profile?.role === 'Trainee';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">Fleet Directory</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Monitoring and discovery of CODEATHON AI equipment ({machines.length} units).</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isAdmin && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline" 
                className="rounded-xl border-primary/20 bg-primary/5 px-6 hidden md:flex" 
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="mr-2 h-4 w-4" /> Bulk AI Upload
              </Button>
            </>
          )}
          {isAdmin && firestoreMachines.length === 0 && (
            <Button variant="outline" className="border-primary/20 bg-primary/5 rounded-xl px-6" onClick={seedDatabase} disabled={isSeeding}>
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="mr-2 h-4 w-4" />}
              Seed Fleet (20)
            </Button>
          )}
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto rounded-xl tech-gradient border-0 px-6">
                  <Plus className="mr-2 h-4 w-4" /> Add Machine
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/5 max-w-md w-[95vw] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-headline text-xl text-left">Register New Machine</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">ID</Label>
                    <Input id="id" className="col-span-3 bg-white/5 border-white/10" placeholder="CNC-XXX" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
                    <Input id="name" className="col-span-3 bg-white/5 border-white/10" placeholder="Pro Router V2" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="tech-gradient border-0 w-full rounded-xl font-bold">Save Machine</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search equipment ID or name..." 
            className="pl-10 bg-white/[0.03] border-white/10 rounded-xl h-11" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1 md:w-[180px] bg-white/[0.03] border-white/10 rounded-xl h-11">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="CNC">CNC Systems</SelectItem>
              <SelectItem value="3D Printer">Additive Manufacturing</SelectItem>
              <SelectItem value="Welding">Welding Simulators</SelectItem>
              <SelectItem value="Robotics">Robotic Arms</SelectItem>
              <SelectItem value="Electrical">Electrical Labs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[120px] text-[10px] uppercase font-bold tracking-widest pl-6">Node ID</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Equipment Name</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Category</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Health</TableHead>
                <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : (
                filteredMachines.map((m) => (
                  <TableRow key={m.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-mono text-[10px] text-primary font-bold pl-6">{m.id}</TableCell>
                    <TableCell className="text-sm font-bold">{m.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-md text-[10px] border-white/10 bg-white/5 font-medium px-2 py-0.5">{m.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-full px-2.5 py-0.5 border-0 text-[10px] font-bold uppercase tracking-tighter",
                        m.status === 'Available' ? 'bg-green-500/10 text-green-500' :
                        m.status === 'In Use' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      )}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className={cn(
                          "h-3 w-3",
                          m.healthScore > 90 ? 'text-green-500' : m.healthScore > 75 ? 'text-yellow-500' : 'text-red-500'
                        )} />
                        <span className="text-xs font-bold font-mono">{m.healthScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {isStudent ? (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-9 px-4 rounded-xl text-primary hover:bg-primary/10"
                          disabled={m.status !== 'Available'}
                          onClick={() => router.push(`/dashboard/bookings?machineId=${m.id}`)}
                        >
                          <Calendar className="h-4 w-4 mr-2" /> Book Now
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10 rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-white/10 rounded-xl shadow-xl">
                            <DropdownMenuItem className="cursor-pointer gap-2 text-[11px] font-bold py-2.5 px-4"><History className="h-3.5 w-3.5" /> View Activity Logs</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2 text-[11px] font-bold py-2.5 px-4"><Wrench className="h-3.5 w-3.5" /> Schedule Maintenance</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* AI Bulk Import Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="bg-card border-white/10 max-w-4xl w-[95vw] rounded-3xl overflow-hidden p-0">
          <div className="p-1 bg-gradient-to-r from-primary to-accent" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-headline font-bold">AI Fleet Intelligence</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                Reviewing extracted machine data from your document. Correct any errors before final synchronization.
              </DialogDescription>
            </DialogHeader>

            {isExtracting ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <Sparkles className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Neural OCR Processing...</h4>
                  <p className="text-sm text-muted-foreground">Deciphering handwriting and mapping equipment nodes.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest pl-6">ID</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">Name</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">Type</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest">Center</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedMachines.map((m, i) => (
                        <TableRow key={i} className="border-white/5">
                          <TableCell className="font-mono text-[10px] text-primary font-bold pl-6">{m.id}</TableCell>
                          <TableCell className="text-sm font-medium">{m.name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] border-white/10">{m.type}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{m.centerId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="ghost" className="rounded-xl border-white/10" onClick={() => setIsBulkDialogOpen(false)}>Discard</Button>
                  <Button className="tech-gradient border-0 px-8 rounded-xl font-bold" onClick={saveExtracted}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Finalize Fleet Sync ({extractedMachines.length})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
