export type Department = string;

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  manager: string;
  managerPhone?: string;
  description: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  color: string;
  status: 'Active' | 'Inactive';
  floorLocation?: string;
  complianceStandard?: string;
  employeeCount?: number;
}

export type ModuleCategory = 
  | 'Safety'
  | 'Environment'
  | 'Quality'
  | 'Compliance'
  | 'Technical'
  | 'HR';

export type ModuleFrequency = 
  | 'Monthly'
  | 'Quarterly'
  | 'Half-yearly'
  | 'Yearly'
  | 'As required';

export type SessionStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export type UserRole = 'Admin' | 'HR_Compliance' | 'Trainer' | 'Auditor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarUrl?: string;
}

export interface Employee {
  id: string;
  eid: string;
  name: string;
  department: Department;
  designation: string;
  phone: string;
  email?: string;
  bloodGroup: string;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  qrCode?: string;
  photoUrl?: string;
}

export type MaterialFileType = 'pdf' | 'ppt' | 'word' | 'other';

export interface ModuleMaterial {
  id: string;
  name: string;
  fileType: MaterialFileType;
  fileExtension: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  dataUrl?: string; // base64 / blob URL for viewing & downloading
  description?: string;
}

export interface TrainingModule {
  id: string;
  code: string;
  name: string;
  category: ModuleCategory;
  frequency: ModuleFrequency;
  targetDepartments: string[];
  durationMinutes: number;
  description: string;
  complianceStandard: string;
  requiredPassingScore: number;
  materials?: ModuleMaterial[];
}

export interface TrainingSchedule {
  id: string;
  scheduleCode: string;
  moduleId: string;
  moduleName: string;
  category: ModuleCategory;
  date: string;
  startTime: string;
  endTime: string;
  trainerName: string;
  trainerDesignation: string;
  targetDepartment: string;
  venue: string;
  expectedParticipants: number;
  actualParticipants: number;
  status: SessionStatus;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  scheduleId: string;
  employeeId: string;
  employeeEid: string;
  employeeName: string;
  department: Department;
  status: AttendanceStatus;
  checkInTime?: string;
  verificationMethod: 'QR Code' | 'Manual ID' | 'Excel Import';
  score?: number;
  remarks?: string;
}

export interface TrainingPhoto {
  id: string;
  scheduleId: string;
  scheduleTitle: string;
  date: string;
  category: 'Trainer Delivery' | 'Group Photo' | 'Practical / PPE Drill' | 'Attendance Sheet' | 'Evaluation Sheet';
  imageUrl: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  employeeId: string;
  employeeEid: string;
  employeeName: string;
  department: Department;
  designation: string;
  moduleId: string;
  moduleName: string;
  category: ModuleCategory;
  completionDate: string;
  validUntil: string;
  trainerName: string;
  score: number;
  status: 'Valid' | 'Expired';
}

export interface EvidenceChecklist {
  attendanceRecord: boolean;
  trainingPhoto: boolean;
  trainingMaterial: boolean;
  evaluationQuiz: boolean;
}
