import React, { useState } from 'react';
import { DepartmentItem, Employee, TrainingSchedule, User, AttendanceRecord } from '../types';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  FileText, 
  X, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
  ClipboardCheck,
  BarChart3
} from 'lucide-react';

interface DepartmentsViewProps {
  departments: DepartmentItem[];
  employees: Employee[];
  schedules: TrainingSchedule[];
  attendanceRecords?: AttendanceRecord[];
  currentUser?: User | null;
  canEdit: boolean;
  onAddDepartment: (department: DepartmentItem) => void;
  onEditDepartment: (originalName: string, updatedDepartment: DepartmentItem) => void;
  onDeleteDepartment: (departmentId: string, departmentName: string, reassignToDeptName?: string) => void;
  onNavigateToEmployeesWithFilter?: (departmentName: string) => void;
  onViewEmployeesInDept?: (departmentName: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  employees,
  schedules,
  attendanceRecords = [],
  currentUser,
  canEdit,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onNavigateToEmployeesWithFilter,
  onViewEmployeesInDept,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Selected department for summary section
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(() => {
    return departments[0]?.id || '';
  });

  const selectedDept = 
    departments.find((d) => d.id === selectedDepartmentId) || 
    departments[0] || 
    null;

  const navigateToEmployees = (deptName: string) => {
    if (onNavigateToEmployeesWithFilter) {
      onNavigateToEmployeesWithFilter(deptName);
    } else if (onViewEmployeesInDept) {
      onViewEmployeesInDept(deptName);
    }
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);
  const [reassignDeptName, setReassignDeptName] = useState<string>('');
  const [viewStaffDept, setViewStaffDept] = useState<DepartmentItem | null>(null);

  // Add Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formPhone, setFormPhone] = useState('+880 17');
  const [formFloor, setFormFloor] = useState('');
  const [formRisk, setFormRisk] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formCompliance, setFormCompliance] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#0284c7');
  const [formError, setFormError] = useState('');

  // Pre-fill Edit Form
  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormManager(dept.manager);
    setFormPhone(dept.managerPhone || '+880 17');
    setFormFloor(dept.floorLocation || '');
    setFormRisk(dept.riskLevel);
    setFormCompliance(dept.complianceStandard || '');
    setFormDesc(dept.description);
    setFormColor(dept.color || '#0284c7');
    setFormError('');
  };

  const handleOpenAdd = () => {
    setIsAddModalOpen(true);
    setFormName('');
    setFormCode(`SEC-0${departments.length + 1}`);
    setFormManager('');
    setFormPhone('+880 17');
    setFormFloor('Main Plant Ground Floor');
    setFormRisk('Medium');
    setFormCompliance('ZDHC MRSL & Factory Safety Standard');
    setFormDesc('');
    setFormColor('#0284c7');
    setFormError('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setFormError('Department Name and Code are required.');
      return;
    }

    if (departments.some(d => d.name.toLowerCase() === formName.trim().toLowerCase())) {
      setFormError(`A department named "${formName.trim()}" already exists.`);
      return;
    }

    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      manager: formManager.trim() || 'Department Supervisor',
      managerPhone: formPhone.trim(),
      floorLocation: formFloor.trim() || 'Factory Facility',
      riskLevel: formRisk,
      complianceStandard: formCompliance.trim() || 'ISO 45001 & Factory Code',
      description: formDesc.trim() || `${formName.trim()} operations and workforce.`,
      color: formColor,
      status: 'Active',
    };

    onAddDepartment(newDept);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    if (!formName.trim() || !formCode.trim()) {
      setFormError('Department Name and Code are required.');
      return;
    }

    // Check if new name collides with another department
    if (
      formName.trim().toLowerCase() !== editingDept.name.toLowerCase() &&
      departments.some(d => d.id !== editingDept.id && d.name.toLowerCase() === formName.trim().toLowerCase())
    ) {
      setFormError(`A department named "${formName.trim()}" already exists.`);
      return;
    }

    const updated: DepartmentItem = {
      ...editingDept,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      manager: formManager.trim() || editingDept.manager,
      managerPhone: formPhone.trim(),
      floorLocation: formFloor.trim(),
      riskLevel: formRisk,
      complianceStandard: formCompliance.trim(),
      description: formDesc.trim(),
      color: formColor,
    };

    onEditDepartment(editingDept.name, updated);
    setEditingDept(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingDept) return;
    onDeleteDepartment(deletingDept.id, deletingDept.name, reassignDeptName || undefined);
    setDeletingDept(null);
    setReassignDeptName('');
  };

  // Filtered list
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.floorLocation && dept.floorLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dept.complianceStandard && dept.complianceStandard.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk = riskFilter === 'All' || dept.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' || dept.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Calculate overall plant stats
  const totalWorkforce = employees.length;
  const highRiskCount = departments.filter(d => d.riskLevel === 'High').length;
  const activeCount = departments.filter(d => d.status === 'Active').length;

  // Selected department specific metrics calculated from employee and attendance state
  const selectedDeptEmployees = selectedDept
    ? employees.filter((e) => e.department.toLowerCase() === selectedDept.name.toLowerCase())
    : [];
  const totalDeptEmployees = selectedDeptEmployees.length;
  const activeDeptEmployees = selectedDeptEmployees.filter((e) => e.status === 'Active').length;

  // Department-specific attendance records
  const deptAttendance = selectedDept
    ? (attendanceRecords || []).filter((att) => {
        const matchDept = att.department?.toLowerCase() === selectedDept.name.toLowerCase();
        const matchEmp = selectedDeptEmployees.some(
          (emp) => emp.id === att.employeeId || emp.eid === att.employeeEid
        );
        return matchDept || matchEmp;
      })
    : [];

  // Training completion: unique employees in this department who have attended training (status === 'Present')
  const trainedDeptEmployees = selectedDeptEmployees.filter((emp) =>
    (attendanceRecords || []).some(
      (att) =>
        (att.employeeId === emp.id || att.employeeEid === emp.eid) &&
        att.status === 'Present'
    )
  );

  const trainedCount = trainedDeptEmployees.length;
  const pendingCount = Math.max(0, totalDeptEmployees - trainedCount);
  const trainingCompletionRate = totalDeptEmployees > 0
    ? Math.round((trainedCount / totalDeptEmployees) * 100)
    : 0;

  const presentAttendanceCount = deptAttendance.filter((a) => a.status === 'Present').length;
  const absentAttendanceCount = deptAttendance.filter((a) => a.status === 'Absent').length;
  const totalAttendanceLogs = deptAttendance.length;
  const scoredAttendance = deptAttendance.filter(
    (a) => typeof a.score === 'number' && a.score > 0
  );
  const averageScore = scoredAttendance.length > 0
    ? Math.round(
        scoredAttendance.reduce((sum, a) => sum + (a.score || 0), 0) / scoredAttendance.length
      )
    : null;

  const deptSchedules = selectedDept
    ? schedules.filter(
        (s) =>
          s.targetDepartment === selectedDept.name ||
          s.targetDepartment === 'All Departments' ||
          s.targetDepartment.toLowerCase().includes(selectedDept.name.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Title & Edit Access Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#123b5d]">Plant Department Management & Access</h2>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Edit Access Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure factory operational units, modify department names, assign unit supervisors, and control safety risk categorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Access Permissions & Audit Status Notice */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#123b5d] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>Department Editing Privileges Granted</span>
              <span className="text-[10px] bg-sky-200 text-sky-900 font-mono px-1.5 py-0.2 rounded">
                Role: {currentUser?.role || 'Admin'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              You have full administrative authorization to create new factory sections, update existing department codes, and cascade name changes across employee records.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-sky-900 bg-white px-3 py-1.5 rounded-lg border border-sky-200 whitespace-nowrap">
          Authorized User: <strong>{currentUser?.name || 'Administrator'}</strong>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Departments</div>
            <div className="text-2xl font-black text-[#123b5d] mt-1">{departments.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeCount} active operational units</div>
          </div>
          <div className="p-3 bg-slate-100 text-[#123b5d] rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Plant Personnel</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{totalWorkforce}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Allocated across departments</div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">High Risk Safety Zones</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{highRiskCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Strict ZDHC & EHS supervision</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Training Schedules</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{schedules.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Cross-department drills</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Selected Department Summary & Training Completion Section */}
      {selectedDept && (
        <div id="selected-dept-summary" className="bg-white rounded-xl border-2 border-sky-200 shadow-sm overflow-hidden">
          {/* Section Header with Identity & Dropdown Switcher */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-sky-50/60 to-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0"
                style={{ backgroundColor: selectedDept.color || '#0284c7' }}
              >
                {selectedDept.code}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded">
                    Selected Department Summary
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      selectedDept.riskLevel === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : selectedDept.riskLevel === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedDept.riskLevel} Risk Zone
                  </span>
                  {selectedDept.status === 'Inactive' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Inactive
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#123b5d] mt-0.5 flex items-center gap-2">
                  <span>{selectedDept.name}</span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    [{selectedDept.code}]
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Supervisor: <strong className="text-slate-700">{selectedDept.manager}</strong></span>
                  <span>&bull;</span>
                  <span>Location: <strong className="text-slate-700">{selectedDept.floorLocation || 'Main Plant'}</strong></span>
                </p>
              </div>
            </div>

            {/* Department Quick Switcher Dropdown */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold pl-1.5 whitespace-nowrap">
                Select Department:
              </span>
              <select
                value={selectedDept.id}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold text-[#123b5d] bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Department Switcher Chips */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Switch Section:
            </span>
            {departments.map((dept) => {
              const isSelected = selectedDept.id === dept.id;
              const deptEmpsCount = employees.filter((e) => e.department.toLowerCase() === dept.name.toLowerCase()).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartmentId(dept.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#123b5d] text-white font-bold shadow-2xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#38bdf8' : (dept.color || '#0284c7') }}
                  />
                  <span>{dept.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-sky-100 font-mono' : 'bg-slate-100 text-slate-600 font-mono'
                  }`}>
                    {deptEmpsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Summary Metrics Grid */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Number of Employees specifically for selected department */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Department Workforce</span>
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#123b5d]">{totalDeptEmployees}</span>
                  <span className="text-xs font-semibold text-slate-500">Employees</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                  <span>{activeDeptEmployees} Active Personnel</span>
                  <span className="font-mono text-slate-500">
                    {totalWorkforce > 0 ? Math.round((totalDeptEmployees / totalWorkforce) * 100) : 0}% of Plant Total
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Unit Code:</span>
                <span className="font-semibold text-slate-700">{selectedDept.code} &bull; {selectedDept.name}</span>
              </div>
            </div>

            {/* Metric 2: Training Completion Percentage specifically for selected department */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Training Completion</span>
                <div className={`p-2 rounded-lg ${
                  trainingCompletionRate >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : trainingCompletionRate >= 50
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${
                    trainingCompletionRate >= 80
                      ? 'text-emerald-700'
                      : trainingCompletionRate >= 50
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}>
                    {trainingCompletionRate}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Completed</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      trainingCompletionRate >= 80
                        ? 'bg-emerald-500'
                        : trainingCompletionRate >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, trainingCompletionRate))}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                  <span>
                    <strong>{trainedCount}</strong> of <strong>{totalDeptEmployees}</strong> Trained
                  </span>
                  {pendingCount > 0 ? (
                    <span className="text-amber-700 font-semibold">{pendingCount} Pending</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">100% Certified</span>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Verification Source:</span>
                <span className="font-semibold text-slate-700">Attendance State</span>
              </div>
            </div>

            {/* Metric 3: Attendance Verification Sessions */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Attendance Verification</span>
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">{presentAttendanceCount}</span>
                  <span className="text-xs font-semibold text-slate-500">Present Records</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                  <span>{totalAttendanceLogs} Total Logs in Dept</span>
                  {absentAttendanceCount > 0 && (
                    <span className="text-rose-600 font-medium">{absentAttendanceCount} Absent</span>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Assessment Avg:</span>
                <span className="font-bold text-slate-800">
                  {averageScore !== null ? `${averageScore}% Score` : 'Evaluated'}
                </span>
              </div>
            </div>

            {/* Metric 4: Standards & Staff Actions */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Compliance & Actions</span>
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">
                  {selectedDept.complianceStandard || 'ZDHC & ISO 45001'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <strong>{deptSchedules.length}</strong> Training Sessions Mapped
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200">
                <button
                  onClick={() => navigateToEmployees(selectedDept.name)}
                  className="w-full py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View {selectedDept.name} Staff ({totalDeptEmployees})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search department, code, manager, location..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span>Safety Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Risk Tiers</option>
              <option value="High">High Risk (Chemical / Steam / ETP)</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.department === dept.name);
          const deptSchedules = schedules.filter(
            (s) => s.targetDepartment === dept.name || s.targetDepartment === 'All Departments'
          );

          const isHighRisk = dept.riskLevel === 'High';
          const isMedRisk = dept.riskLevel === 'Medium';
          const isSelected = selectedDept?.id === dept.id;

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDepartmentId(dept.id)}
              className={`bg-white rounded-xl transition-all shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer ${
                isSelected
                  ? 'border-2 border-[#123b5d] ring-2 ring-sky-200 bg-sky-50/10'
                  : 'border border-slate-200 hover:border-sky-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                      style={{ backgroundColor: dept.color || '#0284c7' }}
                    >
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                        <span>{dept.name}</span>
                        {dept.status === 'Inactive' && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{dept.floorLocation || 'Main Plant'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        isHighRisk
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isMedRisk
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {dept.riskLevel} Risk
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#123b5d] text-white rounded-md flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-sky-300" />
                        <span>In Summary</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 min-h-[32px]">
                  {dept.description}
                </p>
              </div>

              {/* Department Details & Metrics */}
              <div className="p-4 bg-slate-50/50 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Unit Head / Manager:</span>
                  <span className="font-semibold text-slate-800">{dept.manager}</span>
                </div>

                {dept.managerPhone && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Contact:</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-700">{dept.managerPhone}</span>
                  </div>
                )}

                {dept.complianceStandard && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 leading-snug">
                    <span className="font-medium text-slate-700">Standards: </span>
                    <span className="text-sky-800 font-medium">{dept.complianceStandard}</span>
                  </div>
                )}

                {/* Worker allocation bar */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>Assigned Personnel</span>
                    </span>
                    <span className="text-[#123b5d] font-bold">{deptEmployees.length} Workers</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(10, (deptEmployees.length / (totalWorkforce || 1)) * 100))}%`,
                        backgroundColor: dept.color || '#0284c7',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewStaffDept(dept);
                    }}
                    className="text-xs font-semibold text-[#123b5d] hover:text-[#0a2339] flex items-center gap-1 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Staff ({deptEmployees.length})</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDepartmentId(dept.id);
                      const summaryEl = document.getElementById('selected-dept-summary');
                      if (summaryEl) {
                        summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#123b5d] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Select department to display in summary section"
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>{isSelected ? 'Selected' : 'Summary'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        title="Edit Department Details"
                        className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDeletingDept(dept);
                          // Default reassign target to first other department
                          const other = departments.find(d => d.id !== dept.id);
                          setReassignDeptName(other ? other.name : '');
                        }}
                        title="Delete Department"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-700">No departments match your search filter</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or risk tier filter, or create a new department.
          </p>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-[#123b5d] text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Add New Department
            </button>
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#123b5d]" />
                <h3 className="font-bold text-base text-slate-900">Add New Factory Department</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Yarn Dyeing / ETP"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. YRN-DYE"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Head / Manager</label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    placeholder="e.g. Engr. Kabir Ahmed"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+880 1711-000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Safety Risk Tier</label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="High">High (Chemical / Steam / ETP / Pressure)</option>
                    <option value="Medium">Medium (Machinery / Thermal / Noise)</option>
                    <option value="Low">Low (Administrative / Quality)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Location / Bay</label>
                  <input
                    type="text"
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    placeholder="e.g. Main Shed - Bay D"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance & Standard Focus</label>
                <input
                  type="text"
                  value={formCompliance}
                  onChange={(e) => setFormCompliance(e.target.value)}
                  placeholder="e.g. ZDHC MRSL Level 3, DoE Clearance, ISO 45001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief summary of section operations and process hazards..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Badge Accent Color</label>
                <div className="flex items-center gap-2">
                  {['#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626', '#4f46e5', '#0891b2', '#475569'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full transition ${
                        formColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Edit Department: <span className="text-[#123b5d]">{editingDept.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingDept(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Auto-Cascade Protection:</strong> If you change the department name, all assigned employee profiles, attendance logs, and certificates will automatically synchronize with the new name!
              </div>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Head / Manager</label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Safety Risk Tier</label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="High">High (Chemical / Steam / ETP)</option>
                    <option value="Medium">Medium (Machinery / Thermal / Noise)</option>
                    <option value="Low">Low (Administrative / Quality)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Location / Bay</label>
                  <input
                    type="text"
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance & Standard Focus</label>
                <input
                  type="text"
                  value={formCompliance}
                  onChange={(e) => setFormCompliance(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Badge Accent Color</label>
                <div className="flex items-center gap-2">
                  {['#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626', '#4f46e5', '#0891b2', '#475569'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full transition ${
                        formColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save & Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Department Modal */}
      {deletingDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Confirm Department Removal</h3>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to remove the department{' '}
              <strong className="text-slate-900">"{deletingDept.name}"</strong> ({deletingDept.code})?
            </p>

            {/* Check affected employees */}
            {(() => {
              const affectedEmps = employees.filter((e) => e.department === deletingDept.name);
              const otherDepts = departments.filter((d) => d.id !== deletingDept.id);

              return (
                <div className="mt-4 space-y-3">
                  {affectedEmps.length > 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-700" />
                        <span>{affectedEmps.length} Employees currently assigned!</span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        Please choose which active department to transfer these workers to:
                      </p>
                      <select
                        value={reassignDeptName}
                        onChange={(e) => setReassignDeptName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-amber-300 rounded bg-white text-xs font-medium"
                      >
                        {otherDepts.map((d) => (
                          <option key={d.id} value={d.name}>
                            Transfer to {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      No employees are currently assigned to this department. It is safe to remove.
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setDeletingDept(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs text-xs"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. View Staff Modal */}
      {viewStaffDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: viewStaffDept.color || '#0284c7' }}
                >
                  {viewStaffDept.code}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {viewStaffDept.name} Department Personnel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lead Supervisor: {viewStaffDept.manager}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewStaffDept(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {employees.filter((e) => e.department === viewStaffDept.name).length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No employees are currently allocated to this department.
                </div>
              ) : (
                employees
                  .filter((e) => e.department === viewStaffDept.name)
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:bg-sky-50/50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            emp.photoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {emp.designation} &bull; <span className="font-mono">{emp.eid}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {emp.status}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {emp.bloodGroup} &bull; Joined {emp.joiningDate}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total: <strong>{employees.filter((e) => e.department === viewStaffDept.name).length} employees</strong>
              </span>

              <button
                onClick={() => {
                  const deptName = viewStaffDept.name;
                  setViewStaffDept(null);
                  navigateToEmployees(deptName);
                }}
                className="px-3.5 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
              >
                <span>Manage Staff in Employees View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
