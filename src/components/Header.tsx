import React from 'react';
import { User } from '../types';
import { Factory, ShieldCheck, UserCheck, LogIn, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onQuickExport: () => void;
  onOpenWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onQuickExport,
  onOpenWorkspace,
}) => {
  return (
    <header className="bg-[#123b5d] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <Factory className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight m-0 text-white flex items-center gap-2">
            <span>Employee Training Management System</span>
            <span className="text-[10px] uppercase font-sans font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full">
              Enterprise v2.5
            </span>
          </h1>
          <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
            <span>Apex Dyeing & Finishing Mills Ltd.</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ETP / Production / Safety / ZDHC Compliance</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
        {/* Quick Excel Export button */}
        <button
          onClick={onQuickExport}
          title="Export Full Audit Compliance Report"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>Audit Export (XLSX)</span>
        </button>

        {/* Google Workspace Button */}
        {onOpenWorkspace && (
          <button
            onClick={onOpenWorkspace}
            title="Google Sheets & Google Calendar Sync Hub"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">Google Workspace</span>
          </button>
        )}

        {/* User Role Card */}
        {currentUser ? (
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-lg text-left transition"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-sky-300"
            />
            <div className="hidden sm:block text-xs">
              <div className="font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-sky-200">{currentUser.roleTitle}</div>
            </div>
            <span className="px-1.5 py-0.5 bg-sky-500/30 text-sky-200 text-[10px] font-bold rounded">
              {currentUser.role}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
