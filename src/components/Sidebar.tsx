import React from 'react';
import { 
  BarChart3, 
  Users, 
  Building2,
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Camera, 
  Award, 
  FileText, 
  Settings,
  ShieldAlert,
  FileSpreadsheet,
  LogIn
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'employees' 
  | 'departments'
  | 'modules' 
  | 'schedule' 
  | 'attendance' 
  | 'photos' 
  | 'certificates' 
  | 'reports' 
  | 'workspace'
  | 'settings'
  | 'login';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: {
    employees: number;
    departments?: number;
    modules: number;
    schedules: number;
    pendingTraining: number;
    photos?: number;
  };
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  counts,
  userRole,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'employees' as NavTab,
      label: 'Employees',
      icon: Users,
      badge: counts.employees.toString(),
    },
    {
      id: 'departments' as NavTab,
      label: 'Departments',
      icon: Building2,
      badge: counts.departments ? counts.departments.toString() : null,
    },
    {
      id: 'modules' as NavTab,
      label: 'Training Modules',
      icon: BookOpen,
      badge: counts.modules.toString(),
    },
    {
      id: 'schedule' as NavTab,
      label: 'Training Schedule',
      icon: Calendar,
      badge: counts.schedules.toString(),
    },
    {
      id: 'attendance' as NavTab,
      label: 'Attendance & QR',
      icon: CheckSquare,
      badge: null,
    },
    {
      id: 'photos' as NavTab,
      label: 'Photo & Audit Vault',
      icon: Camera,
      badge: counts.photos ? counts.photos.toString() : null,
    },
    {
      id: 'certificates' as NavTab,
      label: 'Certificates',
      icon: Award,
      badge: 'New',
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & Audits',
      icon: FileText,
      badge: null,
    },
    {
      id: 'workspace' as NavTab,
      label: 'Google Workspace',
      icon: FileSpreadsheet,
      badge: 'Live',
    },
    {
      id: 'settings' as NavTab,
      label: 'System Settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'login' as NavTab,
      label: 'Login Portal',
      icon: LogIn,
      badge: 'Auth',
    },
  ];

  return (
    <nav className="w-60 bg-white border-r border-slate-200 p-3 flex flex-col justify-between shrink-0 min-h-[calc(100vh-70px)] sticky top-[70px] self-start print:hidden">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-[#e8f1f8] text-[#123b5d] font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#123b5d]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                    item.badge === 'New'
                      ? 'bg-amber-100 text-amber-800'
                      : isActive
                      ? 'bg-[#123b5d] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compliance & Audit Quick Badge */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1 text-[#123b5d]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Audit Readiness</span>
            </span>
            <span className="text-emerald-700 font-extrabold">95%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[95%]" />
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            ZDHC MRSL Level 3 & ISO 45001 compliance criteria met.
          </div>
        </div>
      </div>
    </nav>
  );
};
