import React, { useState } from 'react';
import { TrainingModule, TrainingSchedule } from '../types';
import { Calendar, Wand2, Check, X, Info } from 'lucide-react';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: TrainingModule[];
  onGenerate: (newSchedules: TrainingSchedule[]) => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen,
  onClose,
  modules,
  onGenerate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(
    modules.map((m) => m.id)
  );

  if (!isOpen) return null;

  const toggleModule = (id: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleCreateAutoSchedule = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-indexed

    const chosenModules = modules.filter((m) => selectedModuleIds.includes(m.id));

    // Distribution of days across the month
    const generated: TrainingSchedule[] = chosenModules.map((mod, index) => {
      // Pick days like 5th, 10th, 15th, 20th, 25th, etc.
      const day = Math.min(28, 5 + index * 4);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const randomCode = Math.floor(100 + Math.random() * 900);

      // Default venue & trainer based on category
      let venue = 'Central Training Auditorium';
      let trainer = 'Tanvir Hossain (EHS Specialist)';
      let targetDept = mod.targetDepartments.join(', ');

      if (mod.category === 'Safety' && mod.name.includes('Fire')) {
        venue = 'Main Factory Yard & Assembly Point';
        trainer = 'Morshed Alam (Chief Fire Safety Officer)';
      } else if (mod.category === 'Technical' || mod.name.includes('ETP')) {
        venue = 'ETP Control Room & Laboratory';
        trainer = 'Engr. Faruq Hossain (CETP Consultant)';
      } else if (mod.category === 'Compliance' || mod.name.includes('ZDHC')) {
        venue = 'Executive Conference Room';
        trainer = 'Nasrin Sultana (Head of Compliance)';
      }

      return {
        id: `auto-sch-${Date.now()}-${index}`,
        scheduleCode: `SCH-${year}-${randomCode}`,
        moduleId: mod.id,
        moduleName: mod.name,
        category: mod.category,
        date: dateStr,
        startTime: index % 2 === 0 ? '10:00 AM' : '02:30 PM',
        endTime: index % 2 === 0 ? '11:30 AM' : '04:30 PM',
        trainerName: trainer,
        trainerDesignation: 'Certified Lead Trainer',
        targetDepartment: targetDept,
        venue,
        expectedParticipants: 25,
        actualParticipants: 0,
        status: 'Scheduled',
        notes: `Automatically generated recurring session for ${selectedMonth} in accordance with ${mod.complianceStandard}.`,
      };
    });

    onGenerate(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg">Auto-Generate Monthly Training Schedule</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              This automated engine schedules all mandatory factory modules (Fire Safety, Chemical Handling,
              ETP, ZDHC, Waste Management) evenly throughout the month to maintain full buyer audit compliance.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target Month:
            </label>
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Modules to Include in Calendar:
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {modules.map((mod) => {
                const isSelected = selectedModuleIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-300 text-sky-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{mod.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Category: {mod.category} &bull; Freq: {mod.frequency} &bull; Standard: {mod.complianceStandard}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected
                          ? 'bg-[#123b5d] border-[#123b5d] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {selectedModuleIds.length} sessions will be scheduled
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAutoSchedule}
              disabled={selectedModuleIds.length === 0}
              className="px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-sm font-semibold rounded-lg shadow transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>Generate Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
