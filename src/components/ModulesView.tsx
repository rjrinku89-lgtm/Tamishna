import React, { useState, useRef } from 'react';
import { TrainingModule, ModuleCategory, ModuleFrequency, ModuleMaterial, MaterialFileType } from '../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Check, 
  FileText, 
  Presentation, 
  File, 
  Upload, 
  Paperclip,
  Eye,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { ModuleMaterialsModal } from './ModuleMaterialsModal';

interface ModulesViewProps {
  modules: TrainingModule[];
  onAddModule: (module: TrainingModule) => void;
  onUpdateModule?: (module: TrainingModule) => void;
  onDeleteModule: (moduleId: string) => void;
  canEdit: boolean;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  canEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedModuleForMaterials, setSelectedModuleForMaterials] = useState<TrainingModule | null>(null);

  // Form State for Adding New Module
  const [name, setName] = useState('');
  const [code, setCode] = useState(`TRN-0${modules.length + 1}`);
  const [category, setCategory] = useState<ModuleCategory>('Safety');
  const [frequency, setFrequency] = useState<ModuleFrequency>('Monthly');
  const [targetDept, setTargetDept] = useState('Dyeing / ETP / Chemical Store');
  const [duration, setDuration] = useState(90);
  const [complianceStandard, setComplianceStandard] = useState('ZDHC MRSL Level 3 & ISO 45001');
  const [passingScore, setPassingScore] = useState(80);
  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<ModuleMaterial[]>([]);
  const [newModuleDragActive, setNewModuleDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const formFileInputRef = useRef<HTMLInputElement>(null);

  // Calculate library-wide material stats
  const allMaterials = modules.flatMap((m) => m.materials || []);
  const totalPdfs = allMaterials.filter((m) => m.fileType === 'pdf').length;
  const totalPpts = allMaterials.filter((m) => m.fileType === 'ppt').length;
  const totalWords = allMaterials.filter((m) => m.fileType === 'word').length;

  const getFileType = (fileName: string): { type: MaterialFileType; ext: string } => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return { type: 'pdf', ext };
    if (ext === 'ppt' || ext === 'pptx') return { type: 'ppt', ext };
    if (ext === 'doc' || ext === 'docx') return { type: 'word', ext };
    return { type: 'other', ext };
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFormFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');

    const allowed = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
    const valid: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (allowed.includes(ext)) {
        valid.push(file);
      } else {
        setUploadError(`"${file.name}" is not supported. Please upload PDF, PPT/PPTX, or Word (.doc/.docx) files.`);
        return;
      }
    }

    valid.forEach((file) => {
      const reader = new FileReader();
      const { type, ext } = getFileType(file.name);

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newMat: ModuleMaterial = {
          id: `mat-form-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          fileType: type,
          fileExtension: ext,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          dataUrl,
          description: `${type.toUpperCase()} curriculum material for ${name || 'module'}`,
        };
        setAttachedFiles((prev) => [...prev, newMat]);
      };

      reader.readAsDataURL(file);
    });

    if (formFileInputRef.current) {
      formFileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.complianceStandard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.materials && m.materials.some((mat) => mat.name.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;

    let matchesDoc = true;
    if (selectedDocFilter === 'WithMaterials') {
      matchesDoc = Boolean(m.materials && m.materials.length > 0);
    } else if (selectedDocFilter === 'pdf') {
      matchesDoc = Boolean(m.materials && m.materials.some((mat) => mat.fileType === 'pdf'));
    } else if (selectedDocFilter === 'ppt') {
      matchesDoc = Boolean(m.materials && m.materials.some((mat) => mat.fileType === 'ppt'));
    } else if (selectedDocFilter === 'word') {
      matchesDoc = Boolean(m.materials && m.materials.some((mat) => mat.fileType === 'word'));
    }

    return matchesSearch && matchesCat && matchesDoc;
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
      materials: attachedFiles,
    };

    onAddModule(newMod);
    setIsAddOpen(false);
    setName('');
    setDescription('');
    setAttachedFiles([]);
    setUploadError('');
    setCode(`TRN-0${modules.length + 2}`);
  };

  const handleModuleUpdate = (updated: TrainingModule) => {
    if (onUpdateModule) {
      onUpdateModule(updated);
    }
    // Update local state if currently selected for modal
    if (selectedModuleForMaterials?.id === updated.id) {
      setSelectedModuleForMaterials(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#123b5d]">Training Module Library</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-[#123b5d] border border-sky-200">
              {modules.length} Modules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized training curricula aligned with DoE, ZDHC MRSL v3.1, Higg FEM, and ISO safety protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
      </div>

      {/* Uploaded Documents Stats / Repository Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Course Materials</span>
            <span className="text-xl font-black text-slate-900">{allMaterials.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across {modules.filter(m => m.materials && m.materials.length > 0).length} modules</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedDocFilter(selectedDocFilter === 'pdf' ? 'All' : 'pdf')}
          className={`bg-white p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
            selectedDocFilter === 'pdf' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-red-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">PDF Documents</span>
            <span className="text-xl font-black text-red-600">{totalPdfs}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">SOPs & Safety Manuals</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedDocFilter(selectedDocFilter === 'ppt' ? 'All' : 'ppt')}
          className={`bg-white p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
            selectedDocFilter === 'ppt' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200 hover:border-orange-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider block">PowerPoint Slides</span>
            <span className="text-xl font-black text-orange-600">{totalPpts}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">PPT & PPTX Presentations</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Presentation className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setSelectedDocFilter(selectedDocFilter === 'word' ? 'All' : 'word')}
          className={`bg-white p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
            selectedDocFilter === 'word' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">Word Documents</span>
            <span className="text-xl font-black text-blue-600">{totalWords}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">DOC & DOCX Protocols</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <File className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Add Module Modal/Panel with PDF, PPT, Word Upload */}
      {isAddOpen && (
        <div className="bg-sky-50/60 border-2 border-[#123b5d]/30 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Create Training Curriculum Module</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Set curriculum details and attach course documents (PDF, PPT, Word)
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddOpen(false);
                setAttachedFiles([]);
                setUploadError('');
              }}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Module Code *</label>
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

            {/* Document Upload Option: PDF, PPT, Word */}
            <div className="bg-white p-4 rounded-xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-4 h-4 text-[#123b5d]" />
                    <span>Attach Training Course Materials (PDF, PPT, Word)</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload course handouts, slide presentations, or SOP documents for this module.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">PDF</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PPT</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">WORD</span>
                </div>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setNewModuleDragActive(true); }}
                onDragLeave={() => setNewModuleDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setNewModuleDragActive(false);
                  if (e.dataTransfer.files) handleFormFileSelect(e.dataTransfer.files);
                }}
                onClick={() => formFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                  newModuleDragActive 
                    ? 'border-[#123b5d] bg-sky-50' 
                    : 'border-slate-300 hover:border-[#123b5d] bg-slate-50/60'
                }`}
              >
                <input
                  ref={formFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={(e) => handleFormFileSelect(e.target.files)}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Upload className="w-5 h-5 text-[#123b5d]" />
                  <span className="font-semibold text-slate-800 text-xs">
                    Click to select or drag & drop files here
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports .pdf, .ppt, .pptx, .doc, .docx
                  </span>
                </div>
              </div>

              {uploadError && (
                <p className="text-red-600 text-xs">{uploadError}</p>
              )}

              {/* Attached files preview chips */}
              {attachedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Attached Files ({attachedFiles.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-lg text-xs"
                      >
                        {file.fileType === 'pdf' && <FileText className="w-3.5 h-3.5 text-red-600" />}
                        {file.fileType === 'ppt' && <Presentation className="w-3.5 h-3.5 text-orange-600" />}
                        {file.fileType === 'word' && <File className="w-3.5 h-3.5 text-blue-600" />}
                        <span className="font-semibold text-slate-800 max-w-xs truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({formatFileSize(file.fileSize)})</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAttachedFile(file.id);
                          }}
                          className="text-slate-400 hover:text-red-600 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setAttachedFiles([]);
                }}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white font-semibold rounded-lg shadow transition flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Save Module & Materials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search module name, standard, or document name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] bg-white font-medium"
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

          {/* Document Type Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">Documents:</span>
            <select
              value={selectedDocFilter}
              onChange={(e) => setSelectedDocFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d] bg-white font-medium"
            >
              <option value="All">All Modules</option>
              <option value="WithMaterials">With Uploaded Files</option>
              <option value="pdf">Has PDF Files</option>
              <option value="ppt">Has PPT Slides</option>
              <option value="word">Has Word Docs</option>
            </select>
          </div>

          {selectedDocFilter !== 'All' && (
            <button
              onClick={() => setSelectedDocFilter('All')}
              className="text-[11px] text-sky-700 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
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
                <th className="p-3">Course Materials (PDF / PPT / Word)</th>
                {canEdit && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No training modules match your search or document filter criteria.
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => {
                  const materials = mod.materials || [];
                  const pdfs = materials.filter((m) => m.fileType === 'pdf');
                  const ppts = materials.filter((m) => m.fileType === 'ppt');
                  const words = materials.filter((m) => m.fileType === 'word');

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-[#123b5d]">
                        {mod.code}
                      </td>
                      <td className="p-3 font-medium text-slate-800 max-w-xs">
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

                      {/* Course Materials Column */}
                      <td className="p-3">
                        <div className="space-y-1.5">
                          {materials.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {pdfs.length > 0 && (
                                <span 
                                  title={`${pdfs.length} PDF Document(s)`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold"
                                >
                                  <FileText className="w-3 h-3 text-red-600" />
                                  <span>{pdfs.length} PDF</span>
                                </span>
                              )}
                              {ppts.length > 0 && (
                                <span 
                                  title={`${ppts.length} PowerPoint Presentation(s)`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold"
                                >
                                  <Presentation className="w-3 h-3 text-orange-600" />
                                  <span>{ppts.length} PPT</span>
                                </span>
                              )}
                              {words.length > 0 && (
                                <span 
                                  title={`${words.length} Word Document(s)`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold"
                                >
                                  <File className="w-3 h-3 text-blue-600" />
                                  <span>{words.length} Word</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No files attached</span>
                          )}

                          <div>
                            <button
                              onClick={() => setSelectedModuleForMaterials(mod)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#123b5d]/10 hover:bg-[#123b5d]/20 text-[#123b5d] font-semibold text-[11px] transition"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{materials.length > 0 ? `Files (${materials.length})` : 'Upload / Manage'}</span>
                            </button>
                          </div>
                        </div>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Materials Modal */}
      {selectedModuleForMaterials && (
        <ModuleMaterialsModal
          module={selectedModuleForMaterials}
          isOpen={Boolean(selectedModuleForMaterials)}
          onClose={() => setSelectedModuleForMaterials(null)}
          onUpdateModule={handleModuleUpdate}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};
