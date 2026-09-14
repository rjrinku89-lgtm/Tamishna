import React, { useState, useEffect } from 'react';
import { Employee, Department, DepartmentItem } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Edit, 
  Trash2, 
  Award, 
  QrCode, 
  X, 
  Check, 
  Phone, 
  Briefcase,
  AlertCircle,
  Building2,
  ExternalLink
} from 'lucide-react';
import { exportEmployeesToExcel } from '../utils/exportUtils';

interface EmployeesViewProps {
  employees: Employee[];
  departments?: (DepartmentItem | string)[];
  initialSelectedDept?: string;
  onAddEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onSelectEmployeeProfile: (employee: Employee) => void;
  onOpenDepartments?: () => void;
  canEdit: boolean;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments: propDepartments,
  initialSelectedDept,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onSelectEmployeeProfile,
  onOpenDepartments,
  canEdit,
}) => {
  // Normalize departments list to string array
  const departmentNames: string[] = propDepartments
    ? propDepartments.map(d => typeof d === 'string' ? d : d.name)
    : [
        'Dyeing',
        'ETP/CETP',
        'Chemical Store',
        'Lab',
        'Finishing',
        'Maintenance',
        'Production',
        'HR/Compliance',
        'Security',
      ];

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>(initialSelectedDept || 'All');

  useEffect(() => {
    if (initialSelectedDept) {
      setSelectedDept(initialSelectedDept);
    }
  }, [initialSelectedDept]);
  
  // Add Employee Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEid, setNewEid] = useState(`EMP-00${employees.length + 1}`);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState<Department>(departmentNames[0] || 'Dyeing');
  const [newDesignation, setNewDesignation] = useState('Machine Operator');
  const [newPhone, setNewPhone] = useState('+880 1711-');
  const [newBloodGroup, setNewBloodGroup] = useState('B+');
  const [formError, setFormError] = useState('');

  // Edit Employee State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const departments: Department[] = departmentNames;

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEid.trim() || !newName.trim()) {
      setFormError('Please enter Employee ID and Full Name.');
      return;
    }

    if (employees.some((e) => e.eid.toUpperCase() === newEid.trim().toUpperCase())) {
      setFormError(`Employee ID ${newEid} already exists.`);
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      eid: newEid.trim().toUpperCase(),
      name: newName.trim(),
      department: newDept,
      designation: newDesignation.trim() || 'Operator',
      phone: newPhone.trim() || '+880 1700-000000',
      bloodGroup: newBloodGroup,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    onAddEmployee(newEmp);
    setIsAddOpen(false);
    setNewName('');
    setNewEid(`EMP-00${employees.length + 2}`);
    setFormError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    onEditEmployee(editingEmployee);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar & Quick Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">Factory Employee Database</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage worker profiles, department allocations, QR badges, and continuous training records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDepartments && (
            <button
              onClick={onOpenDepartments}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Manage Departments</span>
            </button>
          )}

          <button
            onClick={() => exportEmployeesToExcel(employees)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Employee Collapsible Card / Panel */}
      {isAddOpen && (
        <div className="bg-sky-50/50 border-2 border-[#123b5d]/30 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
            <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Register New Employee</span>
            </h3>
            <button
              onClick={() => setIsAddOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={newEid}
                  onChange={(e) => setNewEid(e.target.value)}
                  placeholder="e.g. EMP-009"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Md. Mostafizur Rahman"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Department</label>
                  {onOpenDepartments && (
                    <button
                      type="button"
                      onClick={onOpenDepartments}
                      className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-0.5"
                    >
                      <span>Edit Depts</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value as Department)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="e.g. Dyeing Operator"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+880 17..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Save Employee</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Department Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, name, or designation..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] bg-white font-medium"
          >
            <option value="All">All Departments ({employees.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d} ({employees.filter((e) => e.department === d).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f6fa] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Phone & Blood</th>
                <th className="p-3">Training Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const isUpToDate = emp.eid === 'EMP-001' || emp.eid === 'EMP-004' || emp.eid === 'EMP-005';
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#123b5d] whitespace-nowrap">
                      {emp.eid}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={emp.photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-800 hover:text-[#123b5d] cursor-pointer" onClick={() => onSelectEmployeeProfile(emp)}>
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-400">Joined: {emp.joiningDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {emp.designation}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      <div>{emp.phone}</div>
                      <div className="text-[10px] text-red-700 font-semibold">Blood: {emp.bloodGroup}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {isUpToDate ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Up to date
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          2 pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      {/* View Training Passport */}
                      <button
                        onClick={() => onSelectEmployeeProfile(emp)}
                        title="View Training Passport & History"
                        className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#123b5d] rounded text-[11px] font-semibold transition"
                      >
                        Passport
                      </button>

                      {/* Edit Employee */}
                      {canEdit && (
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          title="Edit Employee Information"
                          className="p-1 text-slate-500 hover:text-[#123b5d] hover:bg-slate-100 rounded transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Employee */}
                      {canEdit && (
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete Employee"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-base">Edit Employee Profile ({editingEmployee.eid})</h3>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Department</label>
                    {onOpenDepartments && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmployee(null);
                          onOpenDepartments();
                        }}
                        className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-0.5"
                      >
                        <span>Edit Depts</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        department: e.target.value as Department,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingEmployee.designation}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, designation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingEmployee.phone}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#123b5d]"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123b5d] text-white rounded-lg font-semibold hover:bg-[#0e2f4a]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Employee Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">{deleteTarget.name}</strong> ({deleteTarget.eid})? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteEmployee(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
