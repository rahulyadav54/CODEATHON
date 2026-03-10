export type MachineStatus = 'Available' | 'In Use' | 'Under Maintenance';
export type UserRole = 'Admin' | 'Trainer' | 'Student';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Expert';
export type BookingStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skillLevel: SkillLevel;
  totalHours: number;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  centerId: string;
  status: MachineStatus;
  usageHours: number;
  lastMaintenance: string;
  healthScore: number;
  temperature: number;
  vibration: number;
}

export interface Center {
  id: string;
  name: string;
  demandLevel: 'low' | 'medium' | 'high';
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  machineId: string;
  centerId: string;
  timeSlot: string;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  machineId: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTechnician: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export const centers: Center[] = [
  { id: 'c1', name: 'Chennai Center', demandLevel: 'high' },
  { id: 'c2', name: 'Delhi Center', demandLevel: 'medium' },
  { id: 'c3', name: 'Bangalore Center', demandLevel: 'low' },
];

export const initialMachines: Machine[] = [
  { id: 'CNC-101', name: 'Precision CNC Router', type: 'CNC', centerId: 'c1', status: 'In Use', usageHours: 1250, lastMaintenance: '2024-01-15', healthScore: 82, temperature: 45, vibration: 0.02 },
  { id: 'PRNT-3D-01', name: 'Industrial 3D Printer', type: '3D Printer', centerId: 'c1', status: 'Available', usageHours: 450, lastMaintenance: '2024-02-10', healthScore: 95, temperature: 30, vibration: 0.01 },
  { id: 'WLD-01', name: 'Arc Welding Simulator', type: 'Welding', centerId: 'c2', status: 'Available', usageHours: 890, lastMaintenance: '2023-11-20', healthScore: 88, temperature: 25, vibration: 0.005 },
  { id: 'ELC-KIT-05', name: 'PLC Training Rack', type: 'Electrical', centerId: 'c2', status: 'Under Maintenance', usageHours: 2100, lastMaintenance: '2024-03-01', healthScore: 65, temperature: 55, vibration: 0.08 },
  { id: 'CNC-102', name: 'Lathe CNC Master', type: 'CNC', centerId: 'c3', status: 'Available', usageHours: 150, lastMaintenance: '2024-02-28', healthScore: 99, temperature: 28, vibration: 0.002 },
  { id: 'LAB-PC-24', name: 'CAD/CAM Workstation', type: 'Computer Lab', centerId: 'c1', status: 'In Use', usageHours: 3200, lastMaintenance: '2024-01-05', healthScore: 78, temperature: 38, vibration: 0.001 },
];

export const initialUsers: User[] = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul@student.com', role: 'Student', skillLevel: 'Intermediate', totalHours: 45 },
  { id: 'u2', name: 'Ananya Gupta', email: 'ananya@trainer.com', role: 'Trainer', skillLevel: 'Expert', totalHours: 250 },
  { id: 'u3', name: 'System Admin', email: 'admin@skillmach.ai', role: 'Admin', skillLevel: 'Expert', totalHours: 500 },
];

export const initialBookings: Booking[] = [
  { id: 'B1', studentId: 'u1', studentName: 'Rahul Sharma', machineId: 'CNC-101', centerId: 'c1', timeSlot: '10:00 AM - 12:00 PM', purpose: 'Advanced Milling Project', status: 'Approved', createdAt: '2024-03-10' },
  { id: 'B2', studentId: 'u1', studentName: 'Rahul Sharma', machineId: 'LAB-PC-24', centerId: 'c1', timeSlot: '02:00 PM - 04:00 PM', purpose: 'AutoCAD Certification', status: 'Pending', createdAt: '2024-03-11' },
];

export const initialTickets: MaintenanceTicket[] = [
  { id: 'TKT-001', machineId: 'ELC-KIT-05', issue: 'Overheating components detected during heavy load.', priority: 'High', assignedTechnician: 'John Doe', status: 'In Progress', createdAt: '2024-03-02' },
];

// Simple singleton for state management in memory
export class MockDB {
  static machines = [...initialMachines];
  static bookings = [...initialBookings];
  static tickets = [...initialTickets];
  static centers = [...centers];
  static users = [...initialUsers];
  
  // Simulation of a logged-in user
  static currentUser: User = initialUsers[0]; 

  static setCurrentUser(role: UserRole) {
    const user = this.users.find(u => u.role === role);
    if (user) this.currentUser = user;
  }

  static addMachine(machine: Machine) {
    this.machines.push(machine);
  }

  static updateMachineStatus(id: string, status: MachineStatus) {
    const m = this.machines.find(x => x.id === id);
    if (m) m.status = status;
  }

  static addBooking(booking: Booking) {
    this.bookings.push(booking);
  }

  static updateBookingStatus(id: string, status: BookingStatus) {
    const b = this.bookings.find(x => x.id === id);
    if (b) b.status = status;
  }

  static addTicket(ticket: MaintenanceTicket) {
    this.tickets.push(ticket);
  }
}