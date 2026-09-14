import React, { useState } from 'react';
import { TrainingModule, ModuleCategory, ModuleFrequency } from '../types';
import { BookOpen, Plus, Search, ShieldCheck, Clock, Trash2, Edit, X, Check, Award } from 'lucide-react';

interface ModulesViewProps {
  modules: TrainingModule[];
  onAddModule: (module: TrainingModule) => void;
  onDeleteModule: (moduleId: string) => void;
  canEdit: boolean;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  onAddModule,
  onDeleteModule,
  canEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState(`TRN-0${modules.length + 1}`);
  const [category, setCategory] = useState<ModuleCategory>('Safety');
  const [frequency, setFrequency] = useState<ModuleFrequency>('Monthly');
  const [targetDept, setTargetDept] = useState('Dyeing / ETP / Chemical Store');
  const [duration, setDuration] = useState(90);
  const [complianceStandard, setComplianceStandard] = useState('ZDHC MRSL Level 3 & ISO 45001');
  const [passingScore, setPassingScore] = useState(80);
  const [description, setDescription] = useState('');

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.complianceStandard.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMod: TrainingModule = {
      id: `mod-${Date.now()}`,
      code: code.trim() || `TRN-${Math.floor(10 + Math.random() * 90)}`,
      name: name.trim(),
      category,
      frequency,
      targetDepartments: targetDept.split(',').map((d) => d.trim()),
      durationMinutes: duration,
      complianceStandard: complianceStandard.trim() || 'Internal Dyeing Mill Standard',
      requiredPassingScore: passingScore,
      description: description.trim() || `${name} curriculum for industrial dyeing compliance.`,
    };

    onAddModule(newMod);
    setIsAddOpen(false);
    setName('');
    setDescription('');
    setCode(`TRN-0${modules.length + 2}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">Training Module Library</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized training curricula aligned with DoE, ZDHC MRSL v3.1, Higg FEM, and ISO safety protocols.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Module</span>
          </button>
        )}
      </div>

      {/* Add Module Modal/Panel */}
      {isAddOpen && (
        <div className="bg-sky-50/60 border-2 border-[#123b5d]/30 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
            <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Create Training Curriculum Module</span>
            </h3>
            <button
              onClick={() => setIsAddOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Module Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. TRN-07"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Module Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chemical Spill Response & Eyewash Protocol"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ModuleCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                >
                  <option value="Safety">Safety</option>
                  <option value="Environment">Environment</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Technical">Technical</option>
                  <option value="Quality">Quality</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as ModuleFrequency)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-yearly">Half-yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="As required">As required</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Departments</label>
                <input
                  type="text"
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  placeholder="e.g. Dyeing, ETP, Chemical Store"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance Standard</label>
                <input
                  type="text"
                  value={complianceStandard}
                  onChange={(e) => setComplianceStandard(e.target.value)}
                  placeholder="e.g. ZDHC MRSL v3.1 / ISO 45001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Curriculum Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key learning outcomes and practical evaluation guidelines..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#123b5d]"
              />
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
                <span>Save Module</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search module name or standard..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] bg-white font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Safety">Safety</option>
            <option value="Environment">Environment</option>
            <option value="Compliance">Compliance</option>
            <option value="Technical">Technical</option>
            <option value="Quality">Quality</option>
            <option value="HR">HR</option>
          </select>
        </div>
      </div>

      {/* Modules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f6fa] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Module Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Target Department</th>
                <th className="p-3">Compliance Standard</th>
                {canEdit && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-[#123b5d]">
                    {mod.code}
                  </td>
                  <td className="p-3 font-medium text-slate-800">
                    <div className="font-bold text-slate-900">{mod.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{mod.description}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      mod.category === 'Safety'
                        ? 'bg-amber-100 text-amber-800'
                        : mod.category === 'Compliance'
                        ? 'bg-purple-100 text-purple-800'
                        : mod.category === 'Environment'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {mod.category}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {mod.frequency}
                  </td>
                  <td className="p-3 text-slate-600">
                    <div className="flex flex-wrap gap-1">
                      {mod.targetDepartments.map((dept, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    {mod.complianceStandard}
                  </td>
                  {canEdit && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteModule(mod.id)}
                        title="Delete Module"
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
