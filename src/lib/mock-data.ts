
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
  machineName: string;
  centerId: string;
  timeSlot: string;
  date: string;
  status: BookingStatus;
  createdAt: any;
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
  { id: 'LSR-CUT-01', name: 'CO2 Laser Cutter', type: 'Laser Cutting', centerId: 'c3', status: 'Available', usageHours: 620, lastMaintenance: '2024-02-15', healthScore: 92, temperature: 32, vibration: 0.004 },
  { id: 'HYD-PRSS-02', name: 'Hydraulic Press Trainer', type: 'Hydraulics', centerId: 'c2', status: 'Available', usageHours: 1100, lastMaintenance: '2024-01-20', healthScore: 85, temperature: 40, vibration: 0.015 },
  { id: 'ROBOT-ARM-01', name: '6-Axis Robotic Arm', type: 'Robotics', centerId: 'c1', status: 'In Use', usageHours: 2500, lastMaintenance: '2024-03-10', healthScore: 91, temperature: 42, vibration: 0.008 },
  { id: 'MILL-V-01', name: 'Vertical Milling Machine', type: 'CNC', centerId: 'c3', status: 'Available', usageHours: 980, lastMaintenance: '2024-02-05', healthScore: 88, temperature: 35, vibration: 0.012 },
  { id: 'PLSM-CUT-01', name: 'Plasma Cutting Table', type: 'Metal Fabrication', centerId: 'c2', status: 'Available', usageHours: 1450, lastMaintenance: '2024-01-30', healthScore: 79, temperature: 50, vibration: 0.025 },
  { id: 'INJ-MOLD-01', name: 'Plastic Injection Molding', type: 'Manufacturing', centerId: 'c1', status: 'Available', usageHours: 1800, lastMaintenance: '2023-12-15', healthScore: 84, temperature: 65, vibration: 0.03 },
  { id: 'BND-MCH-01', name: 'Sheet Metal Bending Machine', type: 'Metal Fabrication', centerId: 'c3', status: 'Available', usageHours: 420, lastMaintenance: '2024-02-20', healthScore: 96, temperature: 28, vibration: 0.006 },
  { id: 'MEAS-TOOL-01', name: 'Coordinate Measuring Machine', type: 'Quality Control', centerId: 'c1', status: 'Available', usageHours: 210, lastMaintenance: '2024-03-12', healthScore: 98, temperature: 24, vibration: 0.001 },
  { id: 'GEN-SET-01', name: 'Diesel Generator Trainer', type: 'Electrical', centerId: 'c2', status: 'In Use', usageHours: 3200, lastMaintenance: '2024-02-25', healthScore: 72, temperature: 58, vibration: 0.045 },
  { id: 'HVAC-SYS-01', name: 'HVAC Training Unit', type: 'HVAC', centerId: 'c2', status: 'Available', usageHours: 1150, lastMaintenance: '2024-01-10', healthScore: 89, temperature: 22, vibration: 0.002 },
  { id: 'CNC-5AX-01', name: '5-Axis Machining Center', type: 'CNC', centerId: 'c3', status: 'In Use', usageHours: 540, lastMaintenance: '2024-03-01', healthScore: 94, temperature: 48, vibration: 0.009 },
  { id: 'PRNT-SL-01', name: 'SLA Resin 3D Printer', type: '3D Printer', centerId: 'c1', status: 'Available', usageHours: 320, lastMaintenance: '2024-02-28', healthScore: 97, temperature: 26, vibration: 0.001 },
  { id: 'DRILL-P-01', name: 'Precision Drill Press', type: 'Workshop', centerId: 'c3', status: 'Available', usageHours: 2100, lastMaintenance: '2023-11-15', healthScore: 81, temperature: 30, vibration: 0.003 },
  { id: 'GRND-S-01', name: 'Surface Grinding Machine', type: 'Workshop', centerId: 'c2', status: 'Under Maintenance', usageHours: 4500, lastMaintenance: '2024-03-05', healthScore: 58, temperature: 60, vibration: 0.07 },
];

export class MockDB {
  static machines = [...initialMachines];
  static centers = [...centers];
  static tickets: MaintenanceTicket[] = [
    { id: 'TKT-001', machineId: 'ELC-KIT-05', issue: 'Controller overheating', priority: 'Critical', assignedTechnician: 'Tech-01', status: 'Open', createdAt: '2024-03-15' },
    { id: 'TKT-002', machineId: 'GRND-S-01', issue: 'Spindle bearing noise', priority: 'High', assignedTechnician: 'Tech-02', status: 'In Progress', createdAt: '2024-03-14' },
  ];
}
