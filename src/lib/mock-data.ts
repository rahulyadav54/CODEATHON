
export type MachineStatus = 'Available' | 'In Use' | 'Under Maintenance';
export type UserRole = 'Admin' | 'Teacher' | 'Student';
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

export class MockDB {
  static machines = [...initialMachines];
  static centers = [...centers];
}
