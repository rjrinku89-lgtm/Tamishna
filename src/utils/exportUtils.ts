import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import { Employee, TrainingSchedule, AttendanceRecord } from '../types';

/**
 * Generate a data URL for a QR Code
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 250,
      margin: 1.5,
      color: {
        dark: '#123b5d',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Export employees list to Excel (.xlsx)
 */
export function exportEmployeesToExcel(employees: Employee[], filename = 'Dyeing_Factory_Employees.xlsx') {
  const data = employees.map(emp => ({
    'Employee ID': emp.eid,
    'Full Name': emp.name,
    'Department': emp.department,
    'Designation': emp.designation,
    'Phone': emp.phone,
    'Blood Group': emp.bloodGroup,
    'Joining Date': emp.joiningDate,
    'Status': emp.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];

  XLSX.writeFile(workbook, filename);
}

/**
 * Export attendance register to Excel (.xlsx)
 */
export function exportAttendanceToExcel(
  schedule: TrainingSchedule,
  records: AttendanceRecord[],
  filename?: string
) {
  const file = filename || `Attendance_${schedule.scheduleCode}_${schedule.date}.xlsx`;

  const headerInfo = [
    { 'A': 'DYEING FACTORY EMPLOYEE TRAINING ATTENDANCE REGISTER' },
    { 'A': `Training Session: ${schedule.moduleName} (${schedule.scheduleCode})` },
    { 'A': `Date: ${schedule.date} | Trainer: ${schedule.trainerName} | Venue: ${schedule.venue}` },
    { 'A': `Target Department: ${schedule.targetDepartment} | Total Registered: ${records.length}` },
    {}, // empty row
  ];

  const tableData = records.map((rec, index) => ({
    'SL': index + 1,
    'Employee ID': rec.employeeEid,
    'Employee Name': rec.employeeName,
    'Department': rec.department,
    'Status': rec.status,
    'Check-in Time': rec.checkInTime || '-',
    'Verification': rec.verificationMethod,
    'Post-Test Score': rec.score !== undefined ? `${rec.score}%` : 'N/A',
    'Remarks': rec.remarks || 'Completed',
  }));

  const worksheet = XLSX.utils.json_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
  ];

  XLSX.writeFile(workbook, file);
}

/**
 * Export Comprehensive Audit Compliance Report to Excel
 */
export function exportAuditReportToExcel(
  summaryStats: {
    totalEmployees: number;
    trainedThisMonth: number;
    trainingSessions: number;
    pendingCount: number;
    attendanceRate: number;
    complianceScore: number;
  },
  schedules: TrainingSchedule[],
  employees: Employee[],
  filename = 'ZDHC_Compliance_Training_Audit_Report.xlsx'
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary & KPIs
  const kpiData = [
    { KPI: 'Factory Name', Value: 'Apex Dyeing & Finishing Mills Ltd.' },
    { KPI: 'Standard Covered', Value: 'ZDHC MRSL v3.1, Higg FEM, ISO 45001, DoE Bangladesh' },
    { KPI: 'Audit Report Date', Value: new Date().toLocaleDateString() },
    { KPI: 'Total Active Workforce', Value: summaryStats.totalEmployees },
    { KPI: 'Workers Trained This Month', Value: summaryStats.trainedThisMonth },
    { KPI: 'Completed Sessions', Value: summaryStats.trainingSessions },
    { KPI: 'Workers Pending Mandatory Training', Value: summaryStats.pendingCount },
    { KPI: 'Overall Attendance Rate', Value: `${summaryStats.attendanceRate}%` },
    { KPI: 'Compliance Readiness Index', Value: `${summaryStats.complianceScore}%` },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(kpiData);
  summarySheet['!cols'] = [{ wch: 32 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // Sheet 2: Training Sessions
  const sessionsData = schedules.map(s => ({
    'Schedule Code': s.scheduleCode,
    'Training Module': s.moduleName,
    'Category': s.category,
    'Date': s.date,
    'Trainer': s.trainerName,
    'Target Dept': s.targetDepartment,
    'Venue': s.venue,
    'Expected': s.expectedParticipants,
    'Actual Attended': s.actualParticipants,
    'Status': s.status,
  }));
  const sessionsSheet = XLSX.utils.json_to_sheet(sessionsData);
  sessionsSheet['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Training Sessions');

  XLSX.writeFile(workbook, filename);
}
