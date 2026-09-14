import React, { useState } from 'react';
import { 
  Employee, 
  TrainingSchedule, 
  AttendanceRecord, 
  AttendanceStatus 
} from '../types';
import { 
  CheckSquare, 
  QrCode, 
  FileSpreadsheet, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Award,
  AlertCircle
} from 'lucide-react';
import { exportAttendanceToExcel } from '../utils/exportUtils';

interface AttendanceViewProps {
  schedules: TrainingSchedule[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  selectedScheduleId: string;
  onSelectSchedule: (scheduleId: string) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onBulkMarkPresent: (scheduleId: string) => void;
  onOpenQrScanner: () => void;
  canEdit: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  schedules,
  employees,
  attendanceRecords,
  selectedScheduleId,
  onSelectSchedule,
  onUpdateAttendance,
  onBulkMarkPresent,
  onOpenQrScanner,
  canEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId) || schedules[0];

  // Records for this schedule
  const currentRecords = currentSchedule
    ? attendanceRecords.filter((a) => a.scheduleId === currentSchedule.id)
    : [];

  // Generate missing records for employees if they are not in currentRecords yet
  const fullWorkerList = employees.map((emp) => {
    const existing = currentRecords.find(
      (r) => r.employeeId === emp.id || r.employeeEid === emp.eid
    );
    if (existing) return existing;

    return {
      id: `att-temp-${emp.id}`,
      scheduleId: currentSchedule?.id || '',
      employeeId: emp.id,
      employeeEid: emp.eid,
      employeeName: emp.name,
      department: emp.department,
      status: 'Absent' as AttendanceStatus,
      verificationMethod: 'Manual ID' as const,
      remarks: 'Not checked in',
    };
  });

  const filteredWorkers = fullWorkerList.filter((w) =>
    w.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.employeeEid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = fullWorkerList.filter((w) => w.status === 'Present').length;
  const absentCount = fullWorkerList.filter((w) => w.status === 'Absent').length;
  const lateCount = fullWorkerList.filter((w) => w.status === 'Late').length;
  const attendanceRate = fullWorkerList.length > 0 
    ? Math.round((presentCount / fullWorkerList.length) * 100) 
    : 0;

  const handleStatusChange = (record: AttendanceRecord, newStatus: AttendanceStatus) => {
    const updated: AttendanceRecord = {
      ...record,
      status: newStatus,
      checkInTime: newStatus === 'Present' || newStatus === 'Late'
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined,
      verificationMethod: 'Manual ID',
    };
    onUpdateAttendance(updated);
  };

  const handleScoreChange = (record: AttendanceRecord, scoreVal: number) => {
    const updated: AttendanceRecord = {
      ...record,
      score: scoreVal,
    };
    onUpdateAttendance(updated);
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Action Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">Worker Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric & QR badge verification register for statutory factory compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQrScanner}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <QrCode className="w-4 h-4 text-sky-300" />
            <span>Launch QR Scanner</span>
          </button>

          {currentSchedule && (
            <button
              onClick={() => exportAttendanceToExcel(currentSchedule, fullWorkerList)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export Register (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Session Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Training Session:
            </label>
            <select
              value={currentSchedule?.id || ''}
              onChange={(e) => onSelectSchedule(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] bg-white font-medium"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} &bull; {s.moduleName} ({s.scheduleCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trainer & Target:
            </label>
            <div className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium truncate">
              {currentSchedule?.trainerName} &bull; {currentSchedule?.targetDepartment}
            </div>
          </div>

          <div className="flex gap-2">
            {canEdit && currentSchedule && (
              <button
                onClick={() => onBulkMarkPresent(currentSchedule.id)}
                className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-[#123b5d] border border-sky-300 text-xs font-semibold rounded-lg transition text-center"
              >
                Mark All Present
              </button>
            )}
          </div>
        </div>

        {/* Live Attendance Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Total Registered</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{fullWorkerList.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
            <div className="text-[11px] text-emerald-700 font-medium">Present</div>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">{presentCount}</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
            <div className="text-[11px] text-red-700 font-medium">Absent</div>
            <div className="text-xl font-bold text-red-800 mt-0.5">{absentCount}</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-center">
            <div className="text-[11px] text-[#123b5d] font-medium">Attendance Rate</div>
            <div className="text-xl font-bold text-[#123b5d] mt-0.5">{attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search worker name or ID in session..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
            />
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredWorkers.length} of {fullWorkerList.length} workers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f6fa] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Worker Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Attendance Status</th>
                <th className="p-3">Check-in Time</th>
                <th className="p-3">Verification</th>
                <th className="p-3">Post-Test Score (%)</th>
                <th className="p-3 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-[#123b5d] whitespace-nowrap">
                    {record.employeeEid}
                  </td>
                  <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                    {record.employeeName}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {record.department}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStatusChange(record, 'Present')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                          record.status === 'Present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        ✓ Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(record, 'Absent')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                          record.status === 'Absent'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        ✕ Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(record, 'Late')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                          record.status === 'Late'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                    {record.checkInTime || '-'}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                      record.verificationMethod === 'QR Code'
                        ? 'bg-sky-100 text-[#123b5d] border border-sky-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {record.verificationMethod}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={record.score !== undefined ? record.score : ''}
                      onChange={(e) =>
                        handleScoreChange(record, parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="e.g. 85"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold focus:ring-1 focus:ring-[#123b5d]"
                    />
                  </td>
                  <td className="p-3 text-right text-slate-500 text-[11px] whitespace-nowrap">
                    {record.remarks || 'Standard verified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
