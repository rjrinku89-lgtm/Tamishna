import React, { useState, useEffect } from 'react';
import {
  TrainingSchedule,
  TrainingModule,
  Employee,
  AttendanceRecord,
  DepartmentItem,
} from '../types';
import {
  googleSignIn,
  googleLogout,
  initAuth,
  getAccessToken,
  exportSchedulesToGoogleSheet,
  exportAttendanceToGoogleSheet,
  exportFullAuditToGoogleSheet,
  readGoogleSpreadsheet,
  createCalendarEvent,
  listCalendarEvents,
  syncScheduleToCalendar,
  deleteCalendarEvent,
  GoogleCalendarEventItem,
  CreatedSpreadsheetResult,
} from '../utils/googleWorkspace';
import { User as FirebaseUser } from 'firebase/auth';
import {
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Table,
  UploadCloud,
  Layers,
  Users,
  ShieldCheck,
  Check,
  X,
  Copy,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface GoogleWorkspaceViewProps {
  schedules: TrainingSchedule[];
  modules: TrainingModule[];
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  departments: DepartmentItem[];
}

export const GoogleWorkspaceView: React.FC<GoogleWorkspaceViewProps> = ({
  schedules,
  modules,
  employees,
  attendanceRecords,
  departments,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sheets' | 'calendar'>('sheets');
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets state
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<CreatedSpreadsheetResult[]>([]);
  const [readSheetUrl, setReadSheetUrl] = useState('');
  const [readSheetRange, setReadSheetRange] = useState('A1:Z30');
  const [isReadingSheet, setIsReadingSheet] = useState(false);
  const [readSheetData, setReadSheetData] = useState<{ range: string; values: string[][] } | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [syncingScheduleId, setSyncingScheduleId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive Confirmation Dialog State
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<GoogleCalendarEventItem | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, userToken) => {
        setGoogleUser(user);
        setToken(userToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch calendar events whenever user is authenticated and activeSubTab is calendar
  useEffect(() => {
    if (token && activeSubTab === 'calendar') {
      loadCalendarEvents();
    }
  }, [token, activeSubTab]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google Sign-in failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setToken(null);
      setCalendarEvents([]);
    } catch (err: any) {
      console.error(err);
    }
  };

  // ==============================
  // SHEETS HANDLERS
  // ==============================
  const handleExportFullAudit = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }
    setExportLoading('audit');
    setSheetError(null);
    try {
      const result = await exportFullAuditToGoogleSheet({
        departments,
        employees,
        schedules,
        attendanceRecords,
        modules,
      });
      setExportHistory((prev) => [result, ...prev]);
    } catch (err: any) {
      setSheetError(err.message || 'Export to Google Sheets failed');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportSchedules = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }
    setExportLoading('schedules');
    setSheetError(null);
    try {
      const result = await exportSchedulesToGoogleSheet(schedules, modules);
      setExportHistory((prev) => [result, ...prev]);
    } catch (err: any) {
      setSheetError(err.message || 'Export to Google Sheets failed');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportAttendance = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }
    setExportLoading('attendance');
    setSheetError(null);
    try {
      const result = await exportAttendanceToGoogleSheet(
        attendanceRecords,
        employees,
        schedules,
        modules
      );
      setExportHistory((prev) => [result, ...prev]);
    } catch (err: any) {
      setSheetError(err.message || 'Export to Google Sheets failed');
    } finally {
      setExportLoading(null);
    }
  };

  const handleReadSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readSheetUrl.trim()) return;
    if (!token) {
      await handleSignIn();
      return;
    }
    setIsReadingSheet(true);
    setSheetError(null);
    setReadSheetData(null);
    try {
      const data = await readGoogleSpreadsheet(readSheetUrl.trim(), readSheetRange.trim() || 'A1:Z30');
      setReadSheetData(data);
    } catch (err: any) {
      setSheetError(err.message || 'Failed to read Google Sheet');
    } finally {
      setIsReadingSheet(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==============================
  // CALENDAR HANDLERS
  // ==============================
  const loadCalendarEvents = async () => {
    setIsLoadingEvents(true);
    setCalendarMessage(null);
    try {
      const events = await listCalendarEvents('primary', 30);
      setCalendarEvents(events);
    } catch (err: any) {
      setCalendarMessage({ type: 'error', text: err.message || 'Failed to load Google Calendar events' });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSyncSingleSchedule = async (schedule: TrainingSchedule) => {
    if (!token) {
      await handleSignIn();
      return;
    }
    setSyncingScheduleId(schedule.id);
    setCalendarMessage(null);
    try {
      const mod = modules.find((m) => m.id === schedule.moduleId);
      const created = await syncScheduleToCalendar(schedule, mod);
      setCalendarMessage({
        type: 'success',
        text: `Synced "${schedule.moduleName}" to Google Calendar successfully!`,
      });
      await loadCalendarEvents();
    } catch (err: any) {
      setCalendarMessage({ type: 'error', text: err.message || 'Failed to sync event to Google Calendar' });
    } finally {
      setSyncingScheduleId(null);
    }
  };

  const handleSyncAllSchedules = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }
    setIsSyncingAll(true);
    setCalendarMessage(null);
    try {
      let count = 0;
      for (const sch of schedules) {
        const mod = modules.find((m) => m.id === sch.moduleId);
        await syncScheduleToCalendar(sch, mod);
        count++;
      }
      setCalendarMessage({
        type: 'success',
        text: `Successfully synced all ${count} training schedules to your primary Google Calendar!`,
      });
      await loadCalendarEvents();
    } catch (err: any) {
      setCalendarMessage({ type: 'error', text: err.message || 'Error during batch calendar sync' });
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Triggered after explicit user confirmation in dialog
  const handleConfirmDeleteEvent = async () => {
    if (!confirmDeleteEvent) return;
    setIsDeletingEvent(true);
    try {
      await deleteCalendarEvent(confirmDeleteEvent.id, 'primary');
      setCalendarMessage({
        type: 'success',
        text: `Deleted event "${confirmDeleteEvent.summary}" from Google Calendar.`,
      });
      setConfirmDeleteEvent(null);
      await loadCalendarEvents();
    } catch (err: any) {
      setCalendarMessage({ type: 'error', text: err.message || 'Failed to delete event' });
    } finally {
      setIsDeletingEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-[#123b5d]/10 border border-[#123b5d]/20 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 text-[#123b5d]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#123b5d] flex items-center gap-2">
              <span>Google Workspace Integration</span>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sheets & Calendar API
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live bi-directional synchronization with Google Sheets workbooks and Google Calendar training reminders.
            </p>
          </div>
        </div>

        {/* Google Authentication Control */}
        <div className="flex items-center gap-3">
          {googleUser ? (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-1.5 pr-3 rounded-lg">
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border border-sky-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#123b5d] text-white flex items-center justify-center font-bold text-xs">
                  {googleUser.displayName?.[0] || 'G'}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {googleUser.displayName || 'Google User'}
                </div>
                <div className="text-[10px] text-slate-500">{googleUser.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 px-2 py-1 text-[11px] text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition hover:shadow cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Auth error alert if any */}
      {authError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
          <button onClick={() => setAuthError(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('sheets')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'sheets'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Google Sheets Hub</span>
          {exportHistory.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
              {exportHistory.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'calendar'
              ? 'border-sky-600 text-[#123b5d]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-600" />
          <span>Google Calendar Hub</span>
          {calendarEvents.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-sky-100 text-sky-800 rounded-full font-bold">
              {calendarEvents.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: GOOGLE SHEETS */}
      {/* ========================================================= */}
      {activeSubTab === 'sheets' && (
        <div className="space-y-6">
          {sheetError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{sheetError}</span>
              </div>
              <button onClick={() => setSheetError(null)} className="text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Export Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Full Factory Audit */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-2.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Complete Compliance Audit Workbook</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Exports a 4-tab Google Spreadsheet: Departments, Employee Registry, Training Schedules, and Attendance Log.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportFullAudit}
                  disabled={exportLoading === 'audit'}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  {exportLoading === 'audit' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Full Audit to Sheets</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Training Schedules */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#123b5d] mb-2.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Training Schedules Sheet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Exports all active factory training plans ({schedules.length} sessions) with target departments, lead trainers, and status.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportSchedules}
                  disabled={exportLoading === 'schedules'}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  {exportLoading === 'schedules' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Schedules ({schedules.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 3: Attendance Records */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-2.5">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Attendance & Trainee Roster</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Exports all individual trainee verification logs ({attendanceRecords.length} records), quiz scores, and verification modes.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportAttendance}
                  disabled={exportLoading === 'attendance'}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  {exportLoading === 'attendance' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Attendance ({attendanceRecords.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Export Results / Recent Sheets Created */}
          {exportHistory.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Generated Google Sheets in this Session</span>
              </h3>
              <div className="space-y-2">
                {exportHistory.map((item, idx) => (
                  <div
                    key={item.id + idx}
                    className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-200/60 text-emerald-800 font-semibold rounded text-[10px]">
                          {item.sheetCount} tab{item.sheetCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Spreadsheet ID: <code className="bg-white px-1 py-0.2 rounded border border-slate-200">{item.id}</code>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => handleCopy(item.id, item.spreadsheetUrl)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={item.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                      >
                        <span>Open in Google Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspect / Read External Google Sheet */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-[#123b5d]" />
              <h3 className="text-sm font-bold text-slate-900">Inspect & Preview Google Spreadsheet</h3>
            </div>
            <p className="text-xs text-slate-500">
              Paste any Google Sheets URL or ID to live-inspect rows, verify trainee scores, or check compliance auditor sheets.
            </p>

            <form onSubmit={handleReadSheet} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={readSheetUrl}
                  onChange={(e) => setReadSheetUrl(e.target.value)}
                  placeholder="Paste Google Sheet URL (https://docs.google.com/spreadsheets/d/...) or ID"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={readSheetRange}
                  onChange={(e) => setReadSheetRange(e.target.value)}
                  placeholder="Range (e.g. A1:Z30)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isReadingSheet}
                  className="w-full h-full min-h-[38px] px-3 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {isReadingSheet ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reading...</span>
                    </>
                  ) : (
                    <>
                      <Table className="w-3.5 h-3.5" />
                      <span>Fetch Rows</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Read Sheet Results Table */}
            {readSheetData && (
              <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">
                    Loaded Range: <code className="text-[#123b5d]">{readSheetData.range}</code> ({readSheetData.values.length} rows)
                  </span>
                  <button
                    onClick={() => setReadSheetData(null)}
                    className="text-slate-400 hover:text-slate-600 text-[11px]"
                  >
                    Clear Preview
                  </button>
                </div>

                {readSheetData.values.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-72">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          {readSheetData.values[0].map((cell, cIdx) => (
                            <th key={cIdx} className="px-3 py-2 border-b border-slate-200 whitespace-nowrap">
                              {cell}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {readSheetData.values.slice(1).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {readSheetData.values[0].map((_, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                                {row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                    Sheet returned empty values in this range.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GOOGLE CALENDAR */}
      {/* ========================================================= */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          {calendarMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                calendarMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {calendarMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{calendarMessage.text}</span>
              </div>
              <button onClick={() => setCalendarMessage(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sync Controls Header */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Primary Google Calendar Sync</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically push scheduled safety drills and compliance trainings as real calendar events with notifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadCalendarEvents}
                disabled={isLoadingEvents}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                <span>Refresh Events</span>
              </button>

              <button
                onClick={handleSyncAllSchedules}
                disabled={isSyncingAll}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                {isSyncingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing {schedules.length} Sessions...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Sync All Schedules ({schedules.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Training Schedules to Sync */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Factory Training Sessions ({schedules.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">1-Click individual sync available below</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schedules.map((sch) => {
                const isSyncing = syncingScheduleId === sch.id;
                return (
                  <div
                    key={sch.id}
                    className="p-3.5 border border-slate-200 rounded-lg hover:border-sky-300 bg-slate-50/50 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#123b5d] bg-sky-100 px-2 py-0.5 rounded">
                          {sch.scheduleCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sch.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sch.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sch.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2">{sch.moduleName}</h4>
                      <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {sch.date} &bull; {sch.startTime} - {sch.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sch.venue} ({sch.targetDepartment})</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          Trainer: {sch.trainerName}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Expected: {sch.expectedParticipants} trainees
                      </span>
                      <button
                        onClick={() => handleSyncSingleSchedule(sch)}
                        disabled={isSyncing}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#123b5d] border border-sky-300 rounded text-xs font-semibold transition"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Syncing...</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3 text-sky-600" />
                            <span>Add to Calendar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Google Calendar Events Feed */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Upcoming Events on Your Google Calendar ({calendarEvents.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">Live feed from Primary Calendar</span>
            </div>

            {isLoadingEvents ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
                <span>Loading Google Calendar events...</span>
              </div>
            ) : calendarEvents.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {calendarEvents.map((evt) => {
                  const startStr = evt.start.dateTime || evt.start.date || 'TBD';
                  const dateObj = new Date(startStr);
                  const formattedDate = isNaN(dateObj.getTime())
                    ? startStr
                    : dateObj.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                  return (
                    <div
                      key={evt.id}
                      className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg transition"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{evt.summary || '(No Title)'}</span>
                          {evt.summary?.includes('[Apex Dyeing]') && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-sky-100 text-[#123b5d] rounded">
                              Factory Sync
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{formattedDate}</span>
                          {evt.location && (
                            <>
                              <span>&bull;</span>
                              <span>{evt.location}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 text-xs text-[#123b5d] hover:bg-sky-50 rounded border border-slate-200 flex items-center gap-1 transition"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          onClick={() => setConfirmDeleteEvent(evt)}
                          title="Delete from Google Calendar"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                {token
                  ? 'No upcoming events found on your Google Calendar. Click "Sync All Schedules" above to add factory sessions!'
                  : 'Please connect your Google Account above to fetch and sync Calendar events.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE ACTION */}
      {/* ========================================================= */}
      {confirmDeleteEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-red-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Confirm Calendar Event Deletion</h3>
              </div>
              <button
                onClick={() => setConfirmDeleteEvent(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <p>
                Are you sure you want to permanently delete the following training event from your primary Google Calendar?
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                <div className="font-bold text-red-950 text-xs">{confirmDeleteEvent.summary}</div>
                <div className="text-[11px] text-red-700">
                  Event ID: <code className="bg-white px-1 rounded">{confirmDeleteEvent.id}</code>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                This action modifies data in your Google Workspace account and cannot be undone.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setConfirmDeleteEvent(null)}
                  disabled={isDeletingEvent}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteEvent}
                  disabled={isDeletingEvent}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center space-x-1.5 shadow-xs"
                >
                  {isDeletingEvent ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Event</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
