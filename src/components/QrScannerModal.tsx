import React, { useState } from 'react';
import { Employee, TrainingSchedule } from '../types';
import { QrCode, Camera, CheckCircle, X, Search, UserCheck } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: TrainingSchedule;
  employees: Employee[];
  onScanSuccess: (employee: Employee) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  schedule,
  employees,
  onScanSuccess,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [lastScanned, setLastScanned] = useState<Employee | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    setErrorMsg('');
    const cleanCode = code.trim().toUpperCase();
    const found = employees.find(
      e => e.eid.toUpperCase() === cleanCode || e.name.toLowerCase().includes(cleanCode.toLowerCase())
    );

    if (found) {
      setLastScanned(found);
      onScanSuccess(found);
      setManualInput('');
      // Play brief success sound
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // audio context might be blocked, continue silently
      }
    } else {
      setErrorMsg(`No employee found matching "${code}". Try EMP-001, EMP-002, etc.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-lg">QR Code Attendance Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900">
            <span className="font-semibold">Session: </span>
            {schedule.moduleName} ({schedule.scheduleCode}) &bull; {schedule.date}
          </div>

          {/* Scanner Simulation Box */}
          <div className="relative border-2 border-dashed border-[#123b5d]/40 rounded-xl p-6 bg-slate-900 text-white flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
            {/* Animated Laser Scan Line */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
            
            {/* Camera Viewfinder Corners */}
            <div className="w-44 h-44 border-2 border-emerald-400 rounded-lg relative flex items-center justify-center bg-slate-800/60 backdrop-blur-xs">
              <Camera className="w-12 h-12 text-emerald-400/70" />
              <div className="absolute top-1 left-1 text-[10px] text-emerald-300 font-mono tracking-wider">LIVE FEED</div>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              Position employee QR Badge or ID Card in front of camera lens
            </p>
          </div>

          {/* Fast Tap Simulation Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quick Scan Employee Badge (Tap to verify):
            </label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50">
              {employees.slice(0, 8).map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleScanCode(emp.eid)}
                  className="px-2.5 py-1.5 text-xs bg-white hover:bg-[#e8f1f8] hover:text-[#123b5d] hover:border-[#123b5d] border border-slate-300 rounded-md font-medium text-slate-700 transition flex items-center space-x-1"
                >
                  <QrCode className="w-3 h-3 text-slate-400" />
                  <span>{emp.eid}</span>
                  <span className="text-slate-400 font-normal">({emp.name.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput) handleScanCode(manualInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or type Employee ID (e.g. EMP-001)"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#123b5d] text-white text-sm font-medium rounded-lg hover:bg-[#0e2f4a] transition flex items-center space-x-1"
            >
              <UserCheck className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </form>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {lastScanned && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center space-x-3 text-emerald-900 animate-fadeIn">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-sm text-emerald-800">
                  {lastScanned.name} ({lastScanned.eid})
                </div>
                <div>Department: {lastScanned.department} &bull; Designation: {lastScanned.designation}</div>
                <div className="text-emerald-700 font-semibold mt-0.5">
                  ✓ Marked PRESENT at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
