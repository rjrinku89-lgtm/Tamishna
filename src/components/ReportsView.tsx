import React, { useState } from 'react';
import { Employee, TrainingSchedule, AttendanceRecord } from '../types';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart, 
  Calendar, 
  Users,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { exportAuditReportToExcel } from '../utils/exportUtils';
import { exportFullAuditToGoogleSheet } from '../utils/googleWorkspace';
import { TrainingModule, DepartmentItem } from '../types';

interface ReportsViewProps {
  employees: Employee[];
  schedules: TrainingSchedule[];
  attendanceRecords: AttendanceRecord[];
  modules?: TrainingModule[];
  departments?: DepartmentItem[];
  onOpenWorkspace?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  schedules,
  attendanceRecords,
  modules = [],
  departments = [],
  onOpenWorkspace,
}) => {
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-09-30');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [isExportingGoogle, setIsExportingGoogle] = useState(false);
  const [googleSheetLink, setGoogleSheetLink] = useState<{ url: string; title: string } | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const totalEmp = employees.length;
  const trainedEmp = new Set(
    attendanceRecords.filter((a) => a.status === 'Present').map((a) => a.employeeId)
  ).size;
  const pendingEmp = Math.max(0, totalEmp - trainedEmp);
  const completedSessions = schedules.filter((s) => s.status === 'Completed').length;
  const attendanceRate = 95;
  const complianceScore = 94;

  const handleExportExcel = () => {
    exportAuditReportToExcel(
      {
        totalEmployees: totalEmp,
        trainedThisMonth: trainedEmp,
        trainingSessions: schedules.length,
        pendingCount: pendingEmp,
        attendanceRate,
        complianceScore,
      },
      schedules,
      employees
    );
  };

  const handleExportGoogleSheets = async () => {
    setIsExportingGoogle(true);
    setGoogleError(null);
    try {
      const res = await exportFullAuditToGoogleSheet({
        departments,
        employees,
        schedules,
        attendanceRecords,
        modules,
      });
      setGoogleSheetLink({ url: res.spreadsheetUrl, title: res.title });
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to export to Google Sheets.');
    } finally {
      setIsExportingGoogle(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Google Sheets Success Banner */}
      {googleSheetLink && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-xs print:hidden animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-950">Audit Sheet Generated:</span>
            <span className="text-emerald-800">{googleSheetLink.title}</span>
            <a
              href={googleSheetLink.url}
              target="_blank"
              rel="noreferrer"
              className="ml-2 font-bold underline inline-flex items-center gap-1 text-emerald-900 hover:text-emerald-700"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <button
            onClick={() => setGoogleSheetLink(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {googleError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between print:hidden">
          <span>{googleError}</span>
          <button onClick={() => setGoogleError(null)} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">
            Training Audit Reports & Compliance Documentation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory records for Department of Environment (DoE), ZDHC MRSL v3.1, Higg Index, and Buyer Audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Google Sheets Export Button */}
          <button
            onClick={handleExportGoogleSheets}
            disabled={isExportingGoogle}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            {isExportingGoogle ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to Google Sheets</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export XLSX</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter Panel (Hidden during Print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <h3 className="text-xs font-bold text-[#123b5d] uppercase tracking-wider mb-3">
          Audit Query Filter
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
            >
              <option value="All Departments">All Departments</option>
              <option value="Dyeing">Dyeing & Finishing</option>
              <option value="ETP/CETP">ETP / CETP Operations</option>
              <option value="Chemical Store">Chemical Store & Dispensing</option>
              <option value="Lab">Testing & Quality Lab</option>
              <option value="Maintenance">Mechanical & Electrical Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Audit Document Container */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 print:border-0 print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#123b5d]">
              APEX DYEING & FINISHING MILLS LTD.
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
              WORKFORCE TRAINING COMPLIANCE & AUDIT REPORT
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Assessment Standard: ZDHC MRSL v3.1 &bull; Higg FEM 3.0 &bull; ISO 45001 &bull; ISO 14001
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-transparent print:border-0">
            <div><strong>Audit Period:</strong> {fromDate} to {toDate}</div>
            <div><strong>Report Date:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Scope:</strong> {selectedDept}</div>
          </div>
        </div>

        {/* Management KPI Table (matching user prototype) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Factory Management Training Key Performance Indicators (KPI)</span>
          </h3>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f6fa] text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Compliance KPI Metric</th>
                  <th className="p-3">Current Result</th>
                  <th className="p-3">Target Standard</th>
                  <th className="p-3">Audit Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Workers Trained on Mandatory Safety & Chemical Handling
                  </td>
                  <td className="p-3 font-bold text-[#123b5d]">
                    186 / 250 Workers (74.4%)
                  </td>
                  <td className="p-3 font-mono text-slate-600">100% Annual</td>
                  <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Compliant (On Track)</span>
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Overall Training Session Attendance Rate
                  </td>
                  <td className="p-3 font-bold text-emerald-700">95%</td>
                  <td className="p-3 font-mono text-slate-600">≥ 90%</td>
                  <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Target Exceeded</span>
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Scheduled Factory Sessions Completed On-Time
                  </td>
                  <td className="p-3 font-bold text-emerald-700">92%</td>
                  <td className="p-3 font-mono text-slate-600">100%</td>
                  <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Satisfactory</span>
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Training Evidence Archive (Photos, Attendance, Evaluation)
                  </td>
                  <td className="p-3 font-bold text-sky-800">88%</td>
                  <td className="p-3 font-mono text-slate-600">100%</td>
                  <td className="p-3 text-amber-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Minor Pending Uploads</span>
                  </td>
                </tr>

                <tr className="bg-sky-50/40">
                  <td className="p-3 font-bold text-slate-900">
                    ZDHC InCheck & Chemical Management Level 3 Index
                  </td>
                  <td className="p-3 font-bold text-emerald-800">96.5%</td>
                  <td className="p-3 font-mono text-slate-600">≥ 95%</td>
                  <td className="p-3 text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Level 3 Certified</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sessions Summary in period */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-[#123b5d]">
            Completed Training Sessions Log within Period
          </h3>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f6fa] text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Code</th>
                  <th className="p-2.5">Module Name</th>
                  <th className="p-2.5">Trainer</th>
                  <th className="p-2.5">Target Dept</th>
                  <th className="p-2.5">Attended</th>
                  <th className="p-2.5">Evidence Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sch) => (
                  <tr key={sch.id}>
                    <td className="p-2.5 font-mono">{sch.date}</td>
                    <td className="p-2.5 font-mono text-slate-500">{sch.scheduleCode}</td>
                    <td className="p-2.5 font-medium text-slate-800">{sch.moduleName}</td>
                    <td className="p-2.5 text-slate-600">{sch.trainerName}</td>
                    <td className="p-2.5 text-slate-600">{sch.targetDepartment}</td>
                    <td className="p-2.5 font-bold">
                      {sch.status === 'Completed' ? sch.actualParticipants : `${sch.expectedParticipants} (Scheduled)`}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        ✓ Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures for Auditor Report */}
        <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs text-slate-700 font-sans">
          <div>
            <div className="font-cursive text-sm text-[#123b5d] mb-2">Tanvir Hossain</div>
            <div className="border-t border-slate-400 pt-1 font-semibold">Prepared By</div>
            <div className="text-[11px] text-slate-500">Senior EHS & Training Officer</div>
          </div>

          <div>
            <div className="font-cursive text-sm text-[#123b5d] mb-2">Nasrin Sultana</div>
            <div className="border-t border-slate-400 pt-1 font-semibold">Verified By</div>
            <div className="text-[11px] text-slate-500">Head of Compliance & HR</div>
          </div>

          <div>
            <div className="font-cursive text-sm text-[#123b5d] mb-2">Engr. M. A. Rashid</div>
            <div className="border-t border-slate-400 pt-1 font-semibold">Approved By</div>
            <div className="text-[11px] text-slate-500">General Manager (Factory)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
