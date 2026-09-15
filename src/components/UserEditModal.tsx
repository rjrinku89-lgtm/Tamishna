import React, { useState, useEffect } from 'react';
import { User, UserRole, DepartmentItem } from '../types';
import { 
  X, 
  Shield, 
  User as UserIcon, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Building2, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null; // null means create new user
  departments: DepartmentItem[];
  existingUsers: User[];
  onSave: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
];

const AVAILABLE_PERMISSIONS = [
  'Full System Admin',
  'Manage Users & Passwords',
  'Edit Factory Identity & Clearances',
  'Department Configuration',
  'Employee Records (Add/Edit/Delete)',
  'Training Modules & Schedules',
  'QR Attendance & Scanner',
  'Issue & Print Certificates',
  'Photo & Evidence Vault',
  'Audit & Excel Export',
];

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  departments,
  existingUsers,
  onSave,
}) => {
  const [formData, setFormData] = useState<User>({
    id: '',
    username: '',
    password: '',
    name: '',
    role: 'Trainer',
    roleTitle: '',
    department: 'Plant Operations',
    email: '',
    phone: '',
    status: 'Active',
    avatarUrl: PRESET_AVATARS[0],
    permissions: ['Conduct Training Sessions', 'QR Attendance Scanner'],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        password: userToEdit.password || `${userToEdit.username}123`,
        permissions: userToEdit.permissions || getDefaultPermissions(userToEdit.role),
        status: userToEdit.status || 'Active',
      });
    } else {
      // Default new user template
      const defaultRole: UserRole = 'Trainer';
      setFormData({
        id: `usr-${Date.now().toString().slice(-4)}`,
        username: '',
        password: 'Pass' + Math.floor(1000 + Math.random() * 9000),
        name: '',
        role: defaultRole,
        roleTitle: 'EHS Safety Officer & Trainer',
        department: departments[0]?.name || 'Dyeing',
        email: '',
        phone: '+880 17',
        status: 'Active',
        avatarUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        permissions: getDefaultPermissions(defaultRole),
        lastLogin: 'Never',
      });
    }
    setError('');
    setShowPassword(false);
  }, [userToEdit, isOpen, departments]);

  if (!isOpen) return null;

  function getDefaultPermissions(role: UserRole): string[] {
    switch (role) {
      case 'Admin':
        return [
          'Full System Admin',
          'Manage Users & Passwords',
          'Edit Factory Identity & Clearances',
          'Department Configuration',
          'Employee Records (Add/Edit/Delete)',
          'Training Modules & Schedules',
          'QR Attendance & Scanner',
          'Issue & Print Certificates',
          'Photo & Evidence Vault',
          'Audit & Excel Export',
        ];
      case 'HR_Compliance':
        return [
          'Employee Records (Add/Edit/Delete)',
          'Training Modules & Schedules',
          'QR Attendance & Scanner',
          'Photo & Evidence Vault',
          'Audit & Excel Export',
        ];
      case 'Trainer':
        return [
          'Training Modules & Schedules',
          'QR Attendance & Scanner',
          'Photo & Evidence Vault',
          'Issue & Print Certificates',
        ];
      case 'Auditor':
        return ['Audit & Excel Export'];
      default:
        return [];
    }
  }

  const handleRoleChange = (newRole: UserRole) => {
    let suggestedTitle = formData.roleTitle;
    if (!userToEdit || !formData.roleTitle) {
      if (newRole === 'Admin') suggestedTitle = 'General Manager / System Administrator';
      else if (newRole === 'HR_Compliance') suggestedTitle = 'Compliance & HR Officer';
      else if (newRole === 'Trainer') suggestedTitle = 'Senior EHS & Chemical Safety Trainer';
      else if (newRole === 'Auditor') suggestedTitle = 'Lead Factory Compliance Auditor';
    }

    setFormData((prev) => ({
      ...prev,
      role: newRole,
      roleTitle: suggestedTitle,
      permissions: getDefaultPermissions(newRole),
    }));
  };

  const handleTogglePermission = (perm: string) => {
    const current = formData.permissions || [];
    if (current.includes(perm)) {
      setFormData((prev) => ({
        ...prev,
        permissions: current.filter((p) => p !== perm),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...current, perm],
      }));
    }
  };

  const generateRandomPassword = () => {
    const randomWords = ['Apex', 'Safeguard', 'DyeMill', 'Zdhc', 'Audit', 'EcoPro'];
    const word = randomWords[Math.floor(Math.random() * randomWords.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const pass = `${word}@${num}`;
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = formData.username.trim().toLowerCase();
    const trimmedName = formData.name.trim();

    if (!trimmedUsername) {
      setError('Username cannot be empty.');
      return;
    }

    if (!trimmedName) {
      setError('Full user name cannot be empty.');
      return;
    }

    if (!formData.password || formData.password.trim().length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // Check duplicate username
    const duplicate = existingUsers.find(
      (u) => u.id !== formData.id && u.username.toLowerCase() === trimmedUsername
    );
    if (duplicate) {
      setError(`The username "${formData.username}" is already taken by ${duplicate.name}.`);
      return;
    }

    onSave({
      ...formData,
      username: trimmedUsername,
      name: trimmedName,
      password: formData.password.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                {userToEdit ? 'Edit User Credentials & Access Role' : 'Create New System User Account'}
              </h3>
              <p className="text-xs text-sky-200/90">
                Configure plant authentication, security credentials, role-based permissions & authorizations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Basic Identity */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1. Identity & System Role
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Asaduzzaman Khan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  System Role Authorization <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900 font-semibold bg-white"
                >
                  <option value="Admin">Admin (Full Plant Governance & User Management)</option>
                  <option value="HR_Compliance">HR & Compliance (Worker Records & Schedules)</option>
                  <option value="Trainer">Trainer (Sessions, QR Scanning & Attendance)</option>
                  <option value="Auditor">Auditor (Read-Only Ledger & Excel Exports)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Designation / Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior EHS Specialist"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                  <option value="Plant Operations">Plant Operations (Cross-Sectional)</option>
                  <option value="Executive Management">Executive Management</option>
                  <option value="External Audit">External Audit / Buyer Inspection</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Security Credentials (Username & Password) */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              2. Authentication & Security Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Login Username / ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. asad.khan"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Used for sign-in portal & password verification.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Account Password / PIN <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900 font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Min 4 characters. Stored securely for in-plant terminal login.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="user@apexdyeing.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+880 1711-000000"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] text-slate-900 bg-white"
                >
                  <option value="Active">Active (Permitted to log in)</option>
                  <option value="Suspended">Suspended (Access temporarily revoked)</option>
                  <option value="Inactive">Inactive (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Profile Avatar Photo
                </label>
                <div className="flex items-center space-x-2">
                  <img
                    src={formData.avatarUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-full border border-slate-300 object-cover shrink-0"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: url })}
                        className={`w-7 h-7 rounded-full border-2 transition overflow-hidden shrink-0 ${
                          formData.avatarUrl === url
                            ? 'border-[#123b5d] scale-110'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Granular Permissions */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. System Access Privileges & Authorizations
              </span>
              <span className="text-[11px] text-slate-500">
                {(formData.permissions || []).length} Granted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isChecked = (formData.permissions || []).includes(perm);
                return (
                  <label
                    key={perm}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(perm)}
                      className="rounded border-slate-300 text-[#123b5d] focus:ring-[#123b5d]"
                    />
                    <span className="text-[11px]">{perm}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 text-sky-300" />
              <span>{userToEdit ? 'Save User Credentials' : 'Create User Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
