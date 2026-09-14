import React, { useState } from 'react';
import { TrainingSchedule, TrainingModule, SessionStatus } from '../types';
import { 
  Calendar, 
  Plus, 
  Wand2, 
  Search, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  CalendarDays, 
  CheckSquare, 
  Trash2, 
  X, 
  Check,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { syncScheduleToCalendar, exportSchedulesToGoogleSheet } from '../utils/googleWorkspace';

interface ScheduleViewProps {
  schedules: TrainingSchedule[];
  modules: TrainingModule[];
  onAddSchedule: (schedule: TrainingSchedule) => void;
  onUpdateStatus: (scheduleId: string, status: SessionStatus) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onOpenAutoScheduleModal: () => void;
  onOpenAttendance: (schedule: TrainingSchedule) => void;
  onOpenWorkspace?: () => void;
  canEdit: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  modules,
  onAddSchedule,
  onUpdateStatus,
  onDeleteSchedule,
  onOpenAutoScheduleModal,
  onOpenAttendance,
  onOpenWorkspace,
  canEdit,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // New Schedule form
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || '');
  const [date, setDate] = useState('2026-09-25');
  const [trainer, setTrainer] = useState('Tanvir Hossain (EHS Specialist)');
  const [targetDept, setTargetDept] = useState('Dyeing / ETP');
  const [venue, setVenue] = useState('Training Room 1 & Chemical Yard');
  const [participants, setParticipants] = useState(25);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:30 AM');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; message: string; link?: string } | null>(null);

  const handleSyncToCalendar = async (sch: TrainingSchedule) => {
    setSyncingId(sch.id);
    setBannerNotice(null);
    try {
      const mod = modules.find((m) => m.id === sch.moduleId);
      const res = await syncScheduleToCalendar(sch, mod);
      setBannerNotice({
        type: 'success',
        message: `Synced "${sch.moduleName}" to Google Calendar!`,
        link: res.htmlLink,
      });
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        message: err.message || 'Failed to sync to Google Calendar. Make sure you are signed in.',
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleExportScheduleSheets = async () => {
    setIsExportingSheets(true);
    setBannerNotice(null);
    try {
      const res = await exportSchedulesToGoogleSheet(schedules, modules);
      setBannerNotice({
        type: 'success',
        message: `Exported ${schedules.length} schedules to Google Sheets: "${res.title}"`,
        link: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        message: err.message || 'Failed to export schedules to Google Sheets.',
      });
    } finally {
      setIsExportingSheets(false);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scheduleCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const mod = modules.find((m) => m.id === selectedModuleId);
    if (!mod) return;

    const newSch: TrainingSchedule = {
      id: `sch-${Date.now()}`,
      scheduleCode: `SCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      moduleId: mod.id,
      moduleName: mod.name,
      category: mod.category,
      date,
      startTime,
      endTime,
      trainerName: trainer.trim() || 'Internal Safety Officer',
      trainerDesignation: 'Lead Trainer',
      targetDepartment: targetDept.trim() || 'All Workers',
      venue: venue.trim() || 'Factory Training Auditorium',
      expectedParticipants: Number(participants) || 20,
      actualParticipants: 0,
      status: 'Scheduled',
    };

    onAddSchedule(newSch);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">Factory Training Schedule & Planner</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate upcoming safety drills, ETP technical reviews, and buyer compliance trainings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Google Sheets */}
          <button
            onClick={handleExportScheduleSheets}
            disabled={isExportingSheets}
            title="Export full training schedule to a new Google Sheet"
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            {isExportingSheets ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sheets Export</span>
              </>
            )}
          </button>

          {/* Open Google Workspace Hub */}
          {onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              className="flex items-center space-x-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-[#123b5d] border border-sky-300 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Calendar Sync Hub</span>
            </button>
          )}

          {/* Automatic Monthly Schedule Wizard */}
          {canEdit && (
            <button
              onClick={onOpenAutoScheduleModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto-Schedule</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Notice for Google Workspace operations */}
      {bannerNotice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between shadow-xs animate-fadeIn ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{bannerNotice.message}</span>
            {bannerNotice.link && (
              <a
                href={bannerNotice.link}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline ml-1 inline-flex items-center gap-0.5 hover:text-emerald-700"
              >
                <span>Open in Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Schedule Panel */}
      {isAddOpen && (
        <div className="bg-sky-50/60 border-2 border-[#123b5d]/30 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
            <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule New Training Session</span>
            </h3>
            <button
              onClick={() => setIsAddOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Training Module *</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    setSelectedModuleId(e.target.value);
                    const selected = modules.find((m) => m.id === e.target.value);
                    if (selected) {
                      setTargetDept(selected.targetDepartments.join(', '));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trainer Name *</label>
                <input
                  type="text"
                  value={trainer}
                  onChange={(e) => setTrainer(e.target.value)}
                  placeholder="e.g. Tanvir Hossain / Safety Officer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department / Group</label>
                <input
                  type="text"
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  placeholder="e.g. Production / Dyeing / ETP"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Training Room 1 / Assembly Area"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Participants</label>
                <input
                  type="number"
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  min="1"
                  max="150"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="11:30 AM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white font-semibold rounded-lg shadow transition flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Publish Schedule</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and View Mode */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search date, module, or trainer..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] bg-white font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-white text-[#123b5d] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#123b5d] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Calendar Cards
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f6fa] text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Training Module</th>
                  <th className="p-3">Trainer & Venue</th>
                  <th className="p-3">Target Dept</th>
                  <th className="p-3">Participants</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{sch.date}</div>
                      <div className="text-[10px] text-slate-400">
                        {sch.startTime} - {sch.endTime}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#123b5d]">{sch.moduleName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sch.scheduleCode}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="font-medium text-slate-800">{sch.trainerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{sch.venue}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {sch.targetDepartment}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-medium">
                      {sch.status === 'Completed' ? (
                        <span className="text-emerald-700 font-bold">{sch.actualParticipants} Attended</span>
                      ) : (
                        <span className="text-slate-600">{sch.expectedParticipants} Expected</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={sch.status}
                        disabled={!canEdit}
                        onChange={(e) =>
                          onUpdateStatus(sch.id, e.target.value as SessionStatus)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-[#123b5d] cursor-pointer ${
                          sch.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sch.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : sch.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleSyncToCalendar(sch)}
                        disabled={syncingId === sch.id}
                        title="Add to Google Calendar"
                        className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                      >
                        {syncingId === sch.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        <span>Sync</span>
                      </button>
                      <button
                        onClick={() => onOpenAttendance(sch)}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#123b5d] rounded text-[11px] font-semibold transition"
                      >
                        Register
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => onDeleteSchedule(sch.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((sch) => (
            <div
              key={sch.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-sky-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#123b5d] bg-sky-50 px-2 py-0.5 rounded">
                  {sch.date}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sch.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {sch.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  {sch.moduleName}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {sch.scheduleCode} &bull; {sch.category}
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Trainer: <strong>{sch.trainerName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{sch.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sch.startTime} - {sch.endTime}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">
                  Target: <strong>{sch.targetDepartment}</strong>
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleSyncToCalendar(sch)}
                    disabled={syncingId === sch.id}
                    title="Sync to Google Calendar"
                    className="p-1.5 bg-sky-50 hover:bg-sky-100 text-[#123b5d] border border-sky-200 rounded-lg text-xs font-semibold transition"
                  >
                    {syncingId === sch.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onOpenAttendance(sch)}
                    className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    Attendance
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
