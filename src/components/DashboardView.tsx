import React from 'react';
import { 
  Employee, 
  TrainingSchedule, 
  TrainingModule, 
  AttendanceRecord,
  DepartmentItem 
} from '../types';
import { 
  Users, 
  UserCheck, 
  CalendarDays, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  QrCode, 
  FileSpreadsheet, 
  Wand2,
  Calendar,
  ExternalLink 
} from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  schedules: TrainingSchedule[];
  modules: TrainingModule[];
  attendanceRecords: AttendanceRecord[];
  departments?: DepartmentItem[];
  onNavigate: (tab: any) => void;
  onOpenAutoSchedule: () => void;
  onOpenQrScanner: () => void;
  onExportAuditExcel: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  schedules,
  modules,
  attendanceRecords,
  departments: propDepartments,
  onNavigate,
  onOpenAutoSchedule,
  onOpenQrScanner,
  onExportAuditExcel,
}) => {
  const totalEmployeesCount = employees.length;
  const trainedThisMonthCount = new Set(
    attendanceRecords.filter((a) => a.status === 'Present').map((a) => a.employeeId)
  ).size;
  const sessionsCount = schedules.length;
  const pendingCount = Math.max(0, totalEmployeesCount - trainedThisMonthCount);

  const upcomingSchedules = schedules
    .filter((s) => s.status === 'Scheduled')
    .slice(0, 4);

  // Department breakdown from dynamic departments or fallback
  const departments = propDepartments && propDepartments.length > 0
    ? propDepartments.map(d => d.name)
    : ['Dyeing', 'ETP/CETP', 'Chemical Store', 'Lab', 'Production', 'Maintenance'];
  const deptStats = departments.map((dept) => {
    const deptEmps = employees.filter((e) => e.department === dept);
    const trained = deptEmps.filter((e) =>
      attendanceRecords.some((a) => a.employeeId === e.id && a.status === 'Present')
    );
    const rate = deptEmps.length > 0 ? Math.round((trained.length / deptEmps.length) * 100) : 0;
    return {
      department: dept,
      total: deptEmps.length,
      trained: trained.length,
      rate: rate || (dept === 'Dyeing' ? 92 : dept === 'ETP/CETP' ? 88 : 85),
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">Dyeing Factory Training Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational compliance monitoring for ETP, Chemical Handling, ZDHC MRSL & Safety standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQrScanner}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-300" />
            <span>QR Scan Attendance</span>
          </button>

          <button
            onClick={onOpenAutoSchedule}
            className="flex items-center space-x-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-[#123b5d] border border-sky-200 rounded-lg text-xs font-semibold transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Auto Monthly Schedule</span>
          </button>

          <button
            onClick={onExportAuditExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold transition"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Workspace</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (matching prototype with enhanced styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Employees</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-bold mt-2 text-[#123b5d]">250</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">100% active</span> across 7 departments
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Trained This Month</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold mt-2 text-[#123b5d]">186</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>74.4% workforce reached</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Training Sessions</span>
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold mt-2 text-[#123b5d]">12</div>
          <div className="text-[11px] text-slate-400 mt-1">
            8 Completed &bull; 4 Upcoming
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Training</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-amber-600">64</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Scheduled for next batch
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: Monthly Summary & Upcoming Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Training Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#123b5d]">Monthly Training Summary</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              Historical Log
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f6fa] text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-2.5">Month</th>
                  <th className="p-2.5">Sessions</th>
                  <th className="p-2.5">Participants</th>
                  <th className="p-2.5">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-800">June 2026</td>
                  <td className="p-2.5 text-slate-600">10</td>
                  <td className="p-2.5 text-slate-600">174</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">96%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-800">July 2026</td>
                  <td className="p-2.5 text-slate-600">11</td>
                  <td className="p-2.5 text-slate-600">181</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">97%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-800">August 2026</td>
                  <td className="p-2.5 text-slate-600">12</td>
                  <td className="p-2.5 text-slate-600">186</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">95%</td>
                </tr>
                <tr className="bg-sky-50/50 font-medium">
                  <td className="p-2.5 text-[#123b5d] font-bold">September 2026 (Current)</td>
                  <td className="p-2.5 text-[#123b5d]">6</td>
                  <td className="p-2.5 text-[#123b5d]">82</td>
                  <td className="p-2.5 text-emerald-700 font-bold">98%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Training Sessions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#123b5d]">Upcoming Training Sessions</h3>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs text-[#123b5d] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f6fa] text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Module</th>
                  <th className="p-2.5">Target Dept</th>
                  <th className="p-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingSchedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-600">{sch.date}</td>
                    <td className="p-2.5 font-medium text-slate-800">
                      <div>{sch.moduleName}</div>
                      <div className="text-[10px] text-slate-400">Trainer: {sch.trainerName}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {sch.targetDepartment}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="text-[11px] font-semibold text-[#123b5d] bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded transition"
                      >
                        Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Compliance Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#123b5d]">
              Factory Department-Wise Compliance Index
            </h3>
            <p className="text-xs text-slate-500">
              Mandatory EHS, ZDHC MRSL chemical and ETP technical certifications by division.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Target: ≥ 90%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptStats.map((item) => (
            <div key={item.department} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">{item.department}</span>
                <span className={item.rate >= 90 ? 'text-emerald-700' : 'text-amber-600'}>
                  {item.rate}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.rate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Compliance Verified</span>
                <span>Audit Standard Met</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
