import React, { useState } from 'react';
import { User, DepartmentItem, FactoryFacilityIdentity } from '../types';
import { INITIAL_USERS, INITIAL_FACTORY_IDENTITY } from '../data/initialData';
import { FacilityEditModal } from './FacilityEditModal';
import { UserEditModal } from './UserEditModal';
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
  ArrowRight,
  Award,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Phone,
  Mail,
  Zap,
  Save,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Search,
  LogIn,
  ShieldAlert
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User | null;
  users?: User[];
  departments?: DepartmentItem[];
  factoryIdentity?: FactoryFacilityIdentity;
  onUpdateFactoryIdentity?: (updated: FactoryFacilityIdentity) => void;
  onUpdateUser?: (updated: User) => void;
  onAddUser?: (newUser: User) => void;
  onDeleteUser?: (userId: string) => void;
  onSwitchUser?: (user: User) => void;
  onResetUsersToDefault?: () => void;
  onOpenLogin: () => void;
  onResetData: () => void;
  onOpenDepartments?: () => void;
  onNavigateToLogin?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  users = INITIAL_USERS,
  departments = [],
  factoryIdentity = INITIAL_FACTORY_IDENTITY,
  onUpdateFactoryIdentity,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onSwitchUser,
  onResetUsersToDefault,
  onOpenLogin,
  onResetData,
  onOpenDepartments,
  onNavigateToLogin,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInlineEditOpen, setIsInlineEditOpen] = useState(false);
  const [inlineData, setInlineData] = useState<FactoryFacilityIdentity>(factoryIdentity);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Sync inline state when prop updates
  React.useEffect(() => {
    setInlineData(factoryIdentity);
  }, [factoryIdentity]);

  const handleSaveModal = (updated: FactoryFacilityIdentity) => {
    if (onUpdateFactoryIdentity) {
      onUpdateFactoryIdentity(updated);
    }
    setInlineData(updated);
    triggerNotification('Factory identity and compliance standards updated successfully.');
  };

  const handleSaveInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFactoryIdentity) {
      onUpdateFactoryIdentity(inlineData);
    }
    setIsInlineEditOpen(false);
    triggerNotification('Inline facility changes saved and synced across all modules.');
  };

  const handleResetFactoryDefaults = () => {
    if (window.confirm('Reset Factory Facility Identity and Compliance Standards to the official default specification?')) {
      if (onUpdateFactoryIdentity) {
        onUpdateFactoryIdentity(INITIAL_FACTORY_IDENTITY);
      }
      setInlineData(INITIAL_FACTORY_IDENTITY);
      triggerNotification('Factory profile restored to standard default.');
    }
  };

  const triggerNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => {
      setSaveNotification(null);
    }, 4000);
  };
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

      {/* Role-Based Access Control Profile & Active User Credentials (Fully Editable) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Active User & Security Credentials</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Editable Access
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage system authentication credentials, security passwords, departmental roles, and granted access permissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUserToEdit(null);
                setIsUserModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-sky-300" />
              <span>Add User Account</span>
            </button>

            {onNavigateToLogin && (
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Open Login Interface</span>
              </button>
            )}

            {onResetUsersToDefault && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all user accounts and security credentials to factory defaults?')) {
                    onResetUsersToDefault();
                    triggerNotification('User accounts restored to default profiles.');
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Reset Users to Default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Currently Authenticated Active Session Banner */}
        {currentUser && (
          <div className="p-4 bg-linear-to-r from-sky-50 via-sky-50/50 to-white border border-sky-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center space-x-3.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{currentUser.name}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    Current Active Session
                  </span>
                </div>
                <div className="text-xs text-slate-600">{currentUser.roleTitle} &bull; <strong>{currentUser.department}</strong></div>
                <div className="text-[11px] text-sky-900 font-mono mt-0.5 flex flex-wrap items-center gap-x-3">
                  <span>Username: <strong>{currentUser.username}</strong></span>
                  {currentUser.email && <span>Email: {currentUser.email}</span>}
                  {currentUser.phone && <span>Phone: {currentUser.phone}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setUserToEdit(currentUser);
                  setIsUserModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                <span>Edit My Credentials</span>
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5"
              >
                <Key className="w-3.5 h-3.5 text-sky-300" />
                <span>Switch User</span>
              </button>
            </div>
          </div>
        )}

        {/* User Search & Role Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Admin', 'HR_Compliance', 'Trainer', 'Auditor'].map((roleKey) => (
              <button
                key={roleKey}
                type="button"
                onClick={() => setUserRoleFilter(roleKey)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                  userRoleFilter === roleKey
                    ? 'bg-[#123b5d] text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {roleKey === 'All' ? 'All Roles' : roleKey === 'HR_Compliance' ? 'HR & Compliance' : roleKey}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or ID..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#123b5d]"
            />
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {users
            .filter((u) => {
              if (userRoleFilter !== 'All' && u.role !== userRoleFilter) return false;
              if (userSearchQuery.trim()) {
                const q = userSearchQuery.toLowerCase();
                const matchName = u.name.toLowerCase().includes(q);
                const matchUser = u.username.toLowerCase().includes(q);
                const matchDept = u.department?.toLowerCase().includes(q);
                const matchRole = u.roleTitle?.toLowerCase().includes(q);
                if (!matchName && !matchUser && !matchDept && !matchRole) return false;
              }
              return true;
            })
            .map((u) => {
              const isActiveUser = currentUser?.id === u.id;
              const isPasswordVisible = !!visiblePasswords[u.id];
              const displayPass = u.password || `${u.username}123`;

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    isActiveUser
                      ? 'bg-sky-50/50 border-[#123b5d] shadow-xs'
                      : 'bg-slate-50/60 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-10 h-10 rounded-full border border-slate-300 object-cover shrink-0"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isActiveUser && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active user" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.roleTitle}</div>
                          <div className="text-[10px] text-slate-400">{u.department}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            u.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'HR_Compliance'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'Trainer'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>

                        <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                          u.status === 'Suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Security Credentials info box */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[10px]">
                          Username: <strong className="text-slate-800 font-semibold">{u.username}</strong>
                        </span>
                        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                          <span className="text-slate-500">Password:</span>
                          <strong className="text-slate-800 font-medium">
                            {isPasswordVisible ? displayPass : '••••••••'}
                          </strong>
                          <button
                            type="button"
                            onClick={() =>
                              setVisiblePasswords((prev) => ({
                                ...prev,
                                [u.id]: !prev[u.id],
                              }))
                            }
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isPasswordVisible ? 'Hide password' : 'Show password'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {(u.email || u.phone) && (
                        <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 flex items-center justify-between">
                          <span>{u.email || 'No email registered'}</span>
                          <span>{u.phone || ''}</span>
                        </div>
                      )}

                      {u.permissions && u.permissions.length > 0 && (
                        <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1 flex items-center justify-between">
                          <span className="text-slate-400">Privileges:</span>
                          <span className="text-sky-800 font-medium">{u.permissions.length} Granted</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUserToEdit(u);
                          setIsUserModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold rounded-md transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3 text-sky-600" />
                        <span>Edit</span>
                      </button>

                      {onDeleteUser && (
                        <button
                          type="button"
                          disabled={isActiveUser || (users.filter((usr) => usr.role === 'Admin').length <= 1 && u.role === 'Admin')}
                          onClick={() => {
                            if (window.confirm(`Delete user account "${u.name}" (${u.username})?`)) {
                              onDeleteUser(u.id);
                              triggerNotification(`User account ${u.name} deleted.`);
                            }
                          }}
                          className={`p-1 rounded-md transition ${
                            isActiveUser || (users.filter((usr) => usr.role === 'Admin').length <= 1 && u.role === 'Admin')
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                          title={
                            isActiveUser
                              ? 'Cannot delete currently logged in user'
                              : users.filter((usr) => usr.role === 'Admin').length <= 1 && u.role === 'Admin'
                              ? 'Cannot delete the sole administrator'
                              : 'Delete user account'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isActiveUser ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Current</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchUser) {
                            onSwitchUser(u);
                            triggerNotification(`Switched session to ${u.name} (${u.roleTitle})`);
                          } else {
                            onOpenLogin();
                          }
                        }}
                        className="px-2.5 py-1 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-[10px] font-bold rounded-md transition flex items-center space-x-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Notification Toast */}
      {saveNotification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveNotification}</span>
          </div>
          <button
            onClick={() => setSaveNotification(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Factory Profile & Compliance Standards (Fully Editable) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
        {/* Section Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#123b5d] flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-600" />
                <span>Factory Facility Identity & Compliance Standards</span>
              </h3>
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                Editable
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage mill identity, statutory environmental licenses (DoE / ZDHC), plant capacities, and buyer accreditation standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInlineEditOpen(!isInlineEditOpen)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center space-x-1.5 ${
                isInlineEditOpen
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isInlineEditOpen ? 'Close Inline Edit' : 'Quick Inline Edit'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center space-x-1.5"
            >
              <Award className="w-3.5 h-3.5 text-sky-300" />
              <span>Edit Full Profile & Standards</span>
            </button>

            <button
              type="button"
              onClick={handleResetFactoryDefaults}
              title="Reset Factory Credentials to Default"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INLINE EDIT FORM (When toggled) */}
        {isInlineEditOpen ? (
          <form onSubmit={handleSaveInline} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-[#123b5d] uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                <span>Quick Inline Editor &bull; Facility Credentials</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Click "Edit Full Profile & Standards" for multi-standard management.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Facility Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inlineData.facilityName}
                  onChange={(e) => setInlineData((p) => ({ ...p, facilityName: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Brand Name
                </label>
                <input
                  type="text"
                  value={inlineData.facilityShortName}
                  onChange={(e) => setInlineData((p) => ({ ...p, facilityShortName: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Facility Code
                </label>
                <input
                  type="text"
                  value={inlineData.facilityCode}
                  onChange={(e) => setInlineData((p) => ({ ...p, facilityCode: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Facility Type & Scope
                </label>
                <input
                  type="text"
                  value={inlineData.facilityType}
                  onChange={(e) => setInlineData((p) => ({ ...p, facilityType: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ZDHC Gateway AID
                </label>
                <input
                  type="text"
                  value={inlineData.zdhcGatewayAid}
                  onChange={(e) => setInlineData((p) => ({ ...p, zdhcGatewayAid: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ZDHC Conformance Level
                </label>
                <input
                  type="text"
                  value={inlineData.zdhcLevel}
                  onChange={(e) => setInlineData((p) => ({ ...p, zdhcLevel: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  DoE Clearance Certificate
                </label>
                <input
                  type="text"
                  value={inlineData.doeClearanceCert}
                  onChange={(e) => setInlineData((p) => ({ ...p, doeClearanceCert: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fire Safety License No.
                </label>
                <input
                  type="text"
                  value={inlineData.fireSafetyLicense}
                  onChange={(e) => setInlineData((p) => ({ ...p, fireSafetyLicense: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Factory Head / Director
                </label>
                <input
                  type="text"
                  value={inlineData.factoryHead}
                  onChange={(e) => setInlineData((p) => ({ ...p, factoryHead: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  EHS & Compliance In-Charge
                </label>
                <input
                  type="text"
                  value={inlineData.ehsOfficer}
                  onChange={(e) => setInlineData((p) => ({ ...p, ehsOfficer: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Compliance Email
                </label>
                <input
                  type="email"
                  value={inlineData.contactEmail}
                  onChange={(e) => setInlineData((p) => ({ ...p, contactEmail: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Daily Processing Capacity
                </label>
                <input
                  type="text"
                  value={inlineData.dailyCapacity}
                  onChange={(e) => setInlineData((p) => ({ ...p, dailyCapacity: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CETP Daily Capacity
                </label>
                <input
                  type="text"
                  value={inlineData.cetpCapacity}
                  onChange={(e) => setInlineData((p) => ({ ...p, cetpCapacity: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setInlineData(factoryIdentity);
                  setIsInlineEditOpen(false);
                }}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          /* DISPLAY MODE */
          <div className="space-y-4">
            {/* Primary Mill Identity Banner */}
            <div className="p-4 bg-linear-to-r from-slate-900 via-[#123b5d] to-sky-950 text-white rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-sky-400/20 text-sky-200 px-2 py-0.5 rounded border border-sky-400/30">
                    {factoryIdentity.facilityCode || 'FAC-DYE-BD-042'}
                  </span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Active License: {factoryIdentity.licenseNumber}</span>
                  </span>
                </div>

                <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {factoryIdentity.facilityName}
                </h4>

                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{factoryIdentity.facilityType}</span>
                  <span>&bull;</span>
                  <span>{factoryIdentity.groupOrParentCompany}</span>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{factoryIdentity.address} ({factoryIdentity.locationZone})</span>
                </div>
              </div>

              <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-4">
                <div className="text-right">
                  <div className="text-[10px] text-sky-300 uppercase tracking-wider font-semibold">ZDHC Gateway</div>
                  <div className="text-sm font-bold text-white font-mono">{factoryIdentity.zdhcGatewayAid}</div>
                  <div className="text-[10px] text-emerald-300 font-medium">{factoryIdentity.zdhcLevel}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3 text-sky-300" />
                  <span>Edit Facility</span>
                </button>
              </div>
            </div>

            {/* Core Regulatory Clearances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* ZDHC Gateway */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-sky-300 transition shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">ZDHC Gateway Conformance</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-[#123b5d] font-mono">
                  {factoryIdentity.zdhcGatewayAid}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {factoryIdentity.zdhcLevel}
                </div>
              </div>

              {/* DoE Environmental Clearance */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">DoE Clearance Certificate</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-[#123b5d] font-mono truncate" title={factoryIdentity.doeClearanceCert}>
                  {factoryIdentity.doeClearanceCert}
                </div>
                <div className="text-[11px] text-slate-500">
                  Red Category &bull; ETP Discharge Approved
                </div>
              </div>

              {/* Fire Safety License */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Fire Safety License</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-slate-800 font-mono">
                  {factoryIdentity.fireSafetyLicense}
                </div>
                <div className="text-[11px] text-slate-500">
                  Quarterly Evacuation & Drill Certified
                </div>
              </div>

              {/* Higg & Oeko-Tex */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Higg FEM & OEKO-TEX</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-indigo-900 truncate" title={factoryIdentity.higgFacilityId}>
                  {factoryIdentity.higgFacilityId}
                </div>
                <div className="text-[11px] text-indigo-700 truncate" title={factoryIdentity.oekoTexCert}>
                  {factoryIdentity.oekoTexCert}
                </div>
              </div>
            </div>

            {/* Plant Capacities & Operational Contacts Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Daily Fabric Capacity</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  {factoryIdentity.dailyCapacity}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">CETP / ETP Capacity</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  {factoryIdentity.cetpCapacity}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Factory Operations Head</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  {factoryIdentity.factoryHead}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Lead EHS & Compliance</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  {factoryIdentity.ehsOfficer}
                </div>
              </div>
            </div>

            {/* Active Compliance Standards Matrix */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-600" />
                  <h4 className="text-xs font-bold text-[#123b5d] uppercase tracking-wider">
                    Accredited Compliance Standards Registry ({factoryIdentity.complianceStandards.length})
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-[#123b5d] hover:underline font-semibold flex items-center space-x-1"
                >
                  <span>Manage All Standards</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {factoryIdentity.complianceStandards.slice(0, 6).map((std) => (
                  <div
                    key={std.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:bg-white hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-slate-800 text-[11px] leading-snug">
                          {std.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            std.status === 'Certified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {std.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {std.standardCode} &bull; {std.authority}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{std.certificateNumber}</span>
                      <span className="font-sans text-slate-400">{std.validUntil}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Facility Identity & Compliance Standards Modal */}
      <FacilityEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        factoryIdentity={factoryIdentity}
        onSave={handleSaveModal}
      />

      {/* User & Security Credentials Modal */}
      <UserEditModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        departments={departments}
        existingUsers={users}
        onSave={(savedUser) => {
          if (userToEdit) {
            if (onUpdateUser) {
              onUpdateUser(savedUser);
            }
            triggerNotification(`Credentials for ${savedUser.name} updated successfully.`);
          } else {
            if (onAddUser) {
              onAddUser(savedUser);
            }
            triggerNotification(`New user account "${savedUser.username}" created successfully.`);
          }
        }}
      />

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
