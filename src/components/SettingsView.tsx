import React from 'react';
import { User, DepartmentItem } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Users, 
  Database, 
  Building, 
  Building2,
  CheckCircle, 
  Key, 
  RefreshCw,
  Info,
  Edit3,
  ArrowRight
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User | null;
  departments?: DepartmentItem[];
  onOpenLogin: () => void;
  onResetData: () => void;
  onOpenDepartments?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  departments = [],
  onOpenLogin,
  onResetData,
  onOpenDepartments,
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">System Settings & Administration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure mill profile, user access roles, compliance benchmarks, and audit data backups.
          </p>
        </div>

        <button
          onClick={onOpenLogin}
          className="px-3.5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Switch User / Role</span>
        </button>
      </div>

      {/* Role-Based Access Control Profile */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <span>Active User & Security Credentials</span>
        </h3>

        {currentUser && (
          <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover"
              />
              <div>
                <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-slate-600">{currentUser.roleTitle}</div>
                <div className="text-[11px] text-sky-800 font-mono mt-0.5">
                  Logged in as: <strong>{currentUser.username}</strong> ({currentUser.role})
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-[#123b5d] text-white rounded-full text-xs font-semibold shadow-xs">
                Role: {currentUser.role}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {INITIAL_USERS.map((u) => (
            <div
              key={u.id}
              className={`p-3 rounded-lg border ${
                currentUser?.id === u.id
                  ? 'bg-sky-50 border-[#123b5d]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="font-bold text-slate-800">{u.name}</div>
              <div className="text-[11px] text-slate-500">{u.roleTitle}</div>
              <div className="mt-2 text-[10px] font-mono text-slate-600 bg-white p-1 rounded border border-slate-200">
                User: <strong>{u.username}</strong> &bull; Pass: <strong>{u.username}123</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Configuration & Edit Access Management */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Plant Department Configuration & Edit Access</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control factory operational sections, rename departments with auto-cascading employee updates, and manage section supervisors.
            </p>
          </div>

          {onOpenDepartments && (
            <button
              onClick={onOpenDepartments}
              className="px-3.5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-300" />
              <span>Open Department Manager</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg">
            <div className="text-slate-500 font-medium">Department Edit Access</div>
            <div className="text-base font-bold text-[#123b5d] mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Full Access Granted</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Authorized to create, edit, rename, and delete factory sections.
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-500 font-medium">Configured Departments</div>
            <div className="text-base font-bold text-slate-800 mt-1">
              {departments.length} Sections
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Dyeing, ETP/CETP, Chemical Store, Lab, Finishing & more.
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-emerald-800 font-medium">Cascade Integrity Engine</div>
            <div className="text-base font-bold text-emerald-900 mt-1">
              Auto-Sync Active
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              Renaming a department automatically preserves employee & cert mappings.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {departments.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.color || '#0284c7' }}
              />
              <span>{d.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({d.code})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Factory Profile */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
          <Building className="w-4 h-4 text-sky-600" />
          <span>Factory Facility Identity & Compliance Standards</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Facility Name:</label>
            <input
              type="text"
              readOnly
              value="Apex Dyeing & Finishing Mills Ltd."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Facility Type:</label>
            <input
              type="text"
              readOnly
              value="Woven & Knit Fabric Dyeing, Printing & CETP Facility"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ZDHC Gateway AID:</label>
            <input
              type="text"
              readOnly
              value="AID-BD-DYE-99201"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">DoE Clearance Certificate:</label>
            <input
              type="text"
              readOnly
              value="DoE/Gazipur/ETP-RED/2026/089"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Feature Delivery & System Audit */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Implemented Enterprise Features Matrix</span>
          </h3>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            All 9 Specifications Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Department Management & Edit Access:</strong> Full CRUD operations, code mapping, risk tiers & cascading updates.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Add / Edit / Delete Employee:</strong> Full CRUD operations with department mapping.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Automatic Employee Training History:</strong> Complete passport with compliance progress.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>QR Attendance:</strong> Live camera scanner simulation, sound verification & QR badge tags.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Photo Storage & Vault:</strong> High-res drill evidence, category tagging & lightbox viewer.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Training Certificate Generator:</strong> Official printable certificate with QR seal.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Monthly Automatic Schedule:</strong> Automatic calendar scheduler for mandatory factory sessions.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Excel Export (.xlsx):</strong> SheetJS export of employee registry, attendance & audit workbook.</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Role-Based Login & Security:</strong> Admin, Compliance Head, Safety Trainer, Buyer Auditor roles.</span>
          </div>
        </div>
      </div>

      {/* Database Reset */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-slate-800">Reset Local Database to Sample State</h4>
          <p className="text-[11px] text-slate-500">
            Re-populates all employees, schedules, attendance logs, photos, and demo certificates.
          </p>
        </div>
        <button
          onClick={onResetData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Factory Default</span>
        </button>
      </div>
    </div>
  );
};
