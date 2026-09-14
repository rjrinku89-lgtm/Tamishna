import React, { useState } from 'react';
import { Certificate, Employee, TrainingModule, DepartmentItem } from '../types';
import { Award, Search, Printer, Plus, CheckCircle, ShieldCheck, X } from 'lucide-react';

interface CertificatesViewProps {
  certificates: Certificate[];
  employees: Employee[];
  modules: TrainingModule[];
  departments?: (DepartmentItem | string)[];
  onViewCertificate: (cert: Certificate) => void;
  onAddCertificate: (cert: Certificate) => void;
  canEdit: boolean;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  employees,
  modules,
  departments: propDepartments,
  onViewCertificate,
  onAddCertificate,
  canEdit,
}) => {
  const departmentNames: string[] = propDepartments
    ? propDepartments.map(d => typeof d === 'string' ? d : d.name)
    : ['Dyeing', 'ETP/CETP', 'Chemical Store', 'Lab', 'Maintenance', 'Finishing', 'Production', 'HR/Compliance', 'Security'];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // New Cert State
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [moduleId, setModuleId] = useState(modules[0]?.id || '');
  const [score, setScore] = useState(90);

  const filtered = certificates.filter((c) => {
    const matchesSearch =
      c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeEid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || c.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === empId);
    const mod = modules.find((m) => m.id === moduleId);
    if (!emp || !mod) return;

    const certCode = `ZDHC-CERT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certCode,
      employeeId: emp.id,
      employeeEid: emp.eid,
      employeeName: emp.name,
      department: emp.department,
      designation: emp.designation,
      moduleId: mod.id,
      moduleName: mod.name,
      category: mod.category,
      completionDate: today,
      validUntil: nextYear.toISOString().split('T')[0],
      trainerName: 'Tanvir Hossain (EHS Specialist)',
      score: Number(score) || 85,
      status: 'Valid',
    };

    onAddCertificate(newCert);
    setIsIssueModalOpen(false);
    onViewCertificate(newCert);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">
            Employee Training Certificates Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifiable compliance credentials, QR-backed certificates, and renewal tracker for buyer audits.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Training Certificate</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search certificate no, employee, or module..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-[#123b5d]"
          >
            <option value="All">All Departments</option>
            {departmentNames.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-xl border-2 border-slate-200 hover:border-amber-400 p-5 shadow-xs transition flex flex-col justify-between space-y-4 relative overflow-hidden group"
          >
            {/* Subtle Gold Ribbon / Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
              <div className="absolute transform rotate-45 bg-amber-500 text-white font-bold text-[9px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
                CERTIFIED
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-[11px] font-bold text-[#123b5d]">
                    {cert.certificateNumber}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Category: {cert.category}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 leading-snug">
                  {cert.employeeName}
                </h4>
                <div className="text-xs text-slate-600">
                  {cert.employeeEid} &bull; <strong className="text-slate-800">{cert.department}</strong>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-[#123b5d] line-clamp-1">{cert.moduleName}</div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Score: <strong className="text-emerald-700">{cert.score}%</strong></span>
                  <span>Issued: {cert.completionDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                Valid thru: {cert.validUntil}
              </span>
              <button
                onClick={() => onViewCertificate(cert)}
                className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View & Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Issue Certificate Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Issue Training Certificate</span>
              </h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee:</label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.eid} - {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Training Module:</label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evaluation Score (%):</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white font-semibold rounded-lg shadow"
                >
                  Generate & Sign Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
