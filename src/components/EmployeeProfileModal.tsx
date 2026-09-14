import React, { useEffect, useState } from 'react';
import { Employee, AttendanceRecord, TrainingSchedule, TrainingModule, Certificate } from '../types';
import { generateQRCode } from '../utils/exportUtils';
import { 
  X, 
  QrCode, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  Briefcase, 
  Droplet, 
  AlertCircle,
  Printer
} from 'lucide-react';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  attendanceRecords: AttendanceRecord[];
  schedules: TrainingSchedule[];
  modules: TrainingModule[];
  certificates: Certificate[];
  onViewCertificate: (cert: Certificate) => void;
  onIssueCertificate?: (employee: Employee, module: TrainingModule) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  attendanceRecords,
  schedules,
  modules,
  certificates,
  onViewCertificate,
  onIssueCertificate,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && employee) {
      const data = `DYEING-FACTORY-EMP:${employee.eid}|NAME:${employee.name}|DEPT:${employee.department}`;
      generateQRCode(data).then(setQrUrl);
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  // Filter employee's attendance records
  const empAttendance = attendanceRecords.filter(
    (a) => a.employeeId === employee.id || a.employeeEid === employee.eid
  );

  // Mandatory modules for this department
  const relevantModules = modules.filter(
    (m) =>
      m.targetDepartments.includes('All Workers') ||
      m.targetDepartments.some((d) => employee.department.includes(d) || d.includes(employee.department))
  );

  // Completed modules by employee
  const completedModuleIds = new Set<string>();
  empAttendance.forEach((att) => {
    if (att.status === 'Present') {
      const sch = schedules.find((s) => s.id === att.scheduleId);
      if (sch) {
        completedModuleIds.add(sch.moduleId);
      }
    }
  });

  const empCertificates = certificates.filter(
    (c) => c.employeeId === employee.id || c.employeeEid === employee.eid
  );

  const complianceRate = relevantModules.length > 0
    ? Math.min(100, Math.round((completedModuleIds.size / relevantModules.length) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>Employee Training Passport & History</span>
              <span className="bg-sky-500/30 text-sky-200 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {employee.eid}
              </span>
            </h3>
            <p className="text-xs text-white/80">
              Department of Dyeing, ETP & Compliance Continuous Training Record
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Employee Bio & Badge Card */}
          <div className="bg-gradient-to-r from-slate-50 to-sky-50/40 p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-6">
            {/* Photo / Avatar */}
            <div className="relative shrink-0">
              <img
                src={employee.photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'}
                alt={employee.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <span className={`absolute bottom-0 right-1 px-2 py-0.5 text-[10px] font-bold rounded-full border border-white ${
                employee.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {employee.status}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-1.5">
              <h2 className="text-xl font-bold text-[#123b5d]">{employee.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {employee.designation} &bull; <strong className="text-slate-800">{employee.department}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-red-500" />
                  Blood: <strong className="text-slate-800">{employee.bloodGroup}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined: {employee.joiningDate}
                </span>
              </div>

              {/* Compliance Progress Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Mandatory Training Compliance</span>
                  <span className={complianceRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                    {complianceRate}% Complete ({completedModuleIds.size}/{relevantModules.length} Modules)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      complianceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${complianceRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* QR Code ID Badge Box */}
            <div className="shrink-0 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center flex flex-col items-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Employee QR Code" className="w-20 h-20" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 animate-pulse rounded" />
              )}
              <div className="text-[10px] font-mono text-slate-500 mt-1">{employee.eid}</div>
              <button 
                onClick={() => window.print()}
                className="mt-1 text-[10px] text-[#123b5d] hover:underline flex items-center gap-1 font-medium"
              >
                <Printer className="w-3 h-3" />
                <span>Print Badge</span>
              </button>
            </div>
          </div>

          {/* Mandatory Department Compliance Matrix */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Required Department Modules Status</span>
              <span className="text-xs font-normal text-slate-500">
                Department: {employee.department}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {relevantModules.map((mod) => {
                const isCompleted = completedModuleIds.has(mod.id);
                const hasCert = empCertificates.find((c) => c.moduleId === mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                      isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold flex items-center gap-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span>{mod.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-5">
                        Freq: {mod.frequency} &bull; Min Score: {mod.requiredPassingScore}%
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {hasCert ? (
                        <button
                          onClick={() => onViewCertificate(hasCert)}
                          className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded font-semibold text-[10px] flex items-center gap-1 transition"
                        >
                          <Award className="w-3 h-3 text-sky-600" />
                          <span>View Cert</span>
                        </button>
                      ) : isCompleted ? (
                        <button
                          onClick={() => onIssueCertificate && onIssueCertificate(employee, mod)}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-semibold text-[10px] flex items-center gap-1 transition"
                        >
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>Issue Cert</span>
                        </button>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-medium text-[10px]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automatic Training History Log */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Historical Training Log & Attendance Register</span>
              <span className="text-xs font-normal text-slate-500">
                Total Recorded Sessions: {empAttendance.length}
              </span>
            </h4>

            {empAttendance.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                No prior training sessions recorded for this employee.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f2f6fa] text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Training Module</th>
                      <th className="p-2.5">Trainer</th>
                      <th className="p-2.5">Attendance</th>
                      <th className="p-2.5">Test Score</th>
                      <th className="p-2.5">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empAttendance.map((rec) => {
                      const sch = schedules.find((s) => s.id === rec.scheduleId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-600">
                            {sch?.date || '2026-08-20'}
                          </td>
                          <td className="p-2.5 font-medium text-slate-800">
                            {sch?.moduleName || 'Industrial Safety Drill'}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {sch?.trainerName || 'Safety Trainer'}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                                rec.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {rec.score !== undefined ? `${rec.score}%` : '-'}
                          </td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                            {rec.verificationMethod}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Audit compliance passport conforms to Higg FEM 3.0 & ZDHC training requirements
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
