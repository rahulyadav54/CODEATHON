"use client";

import { useState, useEffect } from 'react';
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
  Filter, 
  MoreHorizontal, 
  QrCode, 
  Wrench, 
  History,
  Activity
} from 'lucide-react';
import { MockDB, Machine } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
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

export default function MachineManagement() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    setMachines(MockDB.machines);
  }, []);

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">Machine Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Register and manage equipment inventory.</p>
        </div>
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
                <Label htmlFor="id" className="text-right text-xs">ID</Label>
                <Input id="id" className="col-span-3 bg-white/5 border-white/10" placeholder="CNC-XXX" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-xs">Name</Label>
                <Input id="name" className="col-span-3 bg-white/5 border-white/10" placeholder="Pro Router V2" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="tech-gradient border-0 w-full">Save Machine</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-white/[0.03] border-white/10 rounded-xl" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1 md:w-[150px] bg-white/[0.03] border-white/10 rounded-xl">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="CNC">CNC</SelectItem>
              <SelectItem value="3D Printer">3D Printer</SelectItem>
              <SelectItem value="Welding">Welding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-x-auto">
        <Table className="min-w-[800px] md:min-w-full">
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[120px] text-xs">ID</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Health</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.map((m) => (
              <TableRow key={m.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-mono text-[10px] text-primary font-bold">{m.id}</TableCell>
                <TableCell className="text-xs md:text-sm font-medium">{m.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-md text-[10px] border-white/10 bg-white/5">{m.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full px-2 py-0.5 border-0 text-[10px] font-medium",
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
                    <span className="text-xs font-bold">{m.healthScore}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-white/10">
                      <DropdownMenuItem className="cursor-pointer gap-2 text-xs"><History className="h-3.5 w-3.5" /> Logs</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2 text-xs"><Wrench className="h-3.5 w-3.5" /> Maintenance</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
