import React, { useState, useRef } from 'react';
import { TrainingModule, ModuleMaterial, MaterialFileType } from '../types';
import { 
  X, 
  Upload, 
  FileText, 
  Presentation, 
  File, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  BookOpen,
  Calendar,
  HardDrive
} from 'lucide-react';

interface ModuleMaterialsModalProps {
  module: TrainingModule | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateModule: (module: TrainingModule) => void;
  canEdit: boolean;
}

export const ModuleMaterialsModal: React.FC<ModuleMaterialsModalProps> = ({
  module,
  isOpen,
  onClose,
  onUpdateModule,
  canEdit,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'ppt' | 'word'>('all');
  const [uploadNote, setUploadNote] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<ModuleMaterial | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !module) return null;

  const materials = module.materials || [];

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

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || !canEdit) return;

    setErrorMsg('');
    setUploadSuccessMsg('');

    const allowedExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (allowedExtensions.includes(ext)) {
        validFiles.push(file);
      } else {
        setErrorMsg(`"${file.name}" is not supported. Please upload only PDF (.pdf), PowerPoint (.ppt, .pptx), or Word (.doc, .docx) files.`);
        return;
      }
    }

    if (validFiles.length === 0) return;

    // Read files
    let processed = 0;
    const newMaterials: ModuleMaterial[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      const { type, ext } = getFileType(file.name);

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newMaterials.push({
          id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          fileType: type,
          fileExtension: ext,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          dataUrl,
          description: uploadNote.trim() || `${type.toUpperCase()} course material for ${module.name}`,
        });

        processed++;
        if (processed === validFiles.length) {
          const updatedModule: TrainingModule = {
            ...module,
            materials: [...(module.materials || []), ...newMaterials],
          };
          onUpdateModule(updatedModule);
          setUploadSuccessMsg(`Successfully uploaded ${newMaterials.length} training document(s)!`);
          setUploadNote('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setTimeout(() => setUploadSuccessMsg(''), 4000);
        }
      };

      reader.onerror = () => {
        setErrorMsg(`Failed to read "${file.name}".`);
      };

      // Read as DataURL for local persistence & download
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (!canEdit) return;
    if (window.confirm('Are you sure you want to remove this training document?')) {
      const updatedModule: TrainingModule = {
        ...module,
        materials: (module.materials || []).filter((m) => m.id !== materialId),
      };
      onUpdateModule(updatedModule);
      if (previewMaterial?.id === materialId) {
        setPreviewMaterial(null);
      }
    }
  };

  const handleDownload = (material: ModuleMaterial) => {
    if (material.dataUrl) {
      const a = document.createElement('a');
      a.href = material.dataUrl;
      a.download = material.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback for default demo documents
      const content = `DYEING FACTORY TRAINING DOCUMENTATION
------------------------------------------------
Module: ${module.code} - ${module.name}
Standard: ${module.complianceStandard}
Document Title: ${material.name}
File Type: ${material.fileType.toUpperCase()} (.${material.fileExtension})
Uploaded On: ${material.uploadedAt}

SYNOPSIS & LEARNING OBJECTIVES:
${material.description || module.description}

COMPLIANCE VERIFICATION:
This official training material is certified for textile and dyeing mill worker compliance under ISO 45001, DoE guidelines, and ZDHC MRSL conformance protocols.

Tamishna Dyeing & Finishing Mills Ltd.
Quality, EHS & Compliance Directorate.`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.name.endsWith('.txt') ? material.name : `${material.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || m.fileType === filterType;
    return matchesSearch && matchesType;
  });

  const pdfCount = materials.filter((m) => m.fileType === 'pdf').length;
  const pptCount = materials.filter((m) => m.fileType === 'ppt').length;
  const wordCount = materials.filter((m) => m.fileType === 'word').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        id="module-materials-modal-card"
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#123b5d] text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/20 text-white border border-white/30">
                {module.code}
              </span>
              <span className="text-xs text-sky-200 font-medium">
                {module.category} Curriculum
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {module.name}
            </h2>
            <p className="text-xs text-sky-100/90 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Training Document & Course Material Repository (PDF, PPT, Word)</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Material Format Counters */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="text-slate-500">Total Documents:</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {materials.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              pdfCount > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>PDF ({pdfCount})</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              pptCount > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <Presentation className="w-3.5 h-3.5 text-orange-600" />
              <span>PPT / PPTX ({pptCount})</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              wordCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <File className="w-3.5 h-3.5 text-blue-600" />
              <span>Word DOC ({wordCount})</span>
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Upload Area (for users with edit permission) */}
          {canEdit ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Upload className="w-4 h-4 text-[#123b5d]" />
                  <span>Upload Training Documents (PDF, PPT, Word)</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Accepted: .pdf, .ppt, .pptx, .doc, .docx
                </span>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-[#123b5d] bg-sky-50' 
                    : 'border-slate-300 hover:border-[#123b5d] hover:bg-slate-50/80 bg-slate-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-[#123b5d] flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to browse or drag & drop files here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload course presentations, learner handouts, SOP manuals, or assessment sheets
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-semibold">PDF</span>
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-semibold">PowerPoint (.ppt / .pptx)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">Word (.doc / .docx)</span>
                  </div>
                </div>
              </div>

              {/* Optional Note for Upload */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="Optional note / document description for this upload..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] bg-white"
                />
              </div>

              {uploadSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs">
              <strong>Read-Only Mode:</strong> Auditor privileges allow reviewing and downloading training materials. File upload is restricted to Admins, Trainers, and HR Compliance officers.
            </div>
          )}

          {/* Document Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents by name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#123b5d] bg-white"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'all'
                    ? 'bg-[#123b5d] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({materials.length})
              </button>
              <button
                onClick={() => setFilterType('pdf')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'pdf'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                PDF ({pdfCount})
              </button>
              <button
                onClick={() => setFilterType('ppt')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'ppt'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                PPT ({pptCount})
              </button>
              <button
                onClick={() => setFilterType('word')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'word'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Word ({wordCount})
              </button>
            </div>
          </div>

          {/* Materials List */}
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-semibold text-xs">No documents found matching your filter</p>
              <p className="text-slate-400 text-[11px]">
                {canEdit 
                  ? 'Upload PDF syllabus, PowerPoint slide decks, or Word SOP guides above.'
                  : 'No files have been attached to this module curriculum yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMaterials.map((mat) => {
                const isPdf = mat.fileType === 'pdf';
                const isPpt = mat.fileType === 'ppt';
                const isWord = mat.fileType === 'word';

                return (
                  <div
                    key={mat.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Format Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isPdf
                          ? 'bg-red-100 text-red-600'
                          : isPpt
                          ? 'bg-orange-100 text-orange-600'
                          : isWord
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPdf && <FileText className="w-5 h-5" />}
                        {isPpt && <Presentation className="w-5 h-5" />}
                        {isWord && <File className="w-5 h-5" />}
                        {!isPdf && !isPpt && !isWord && <FileText className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 truncate max-w-sm" title={mat.name}>
                            {mat.name}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            isPdf
                              ? 'bg-red-100 text-red-800'
                              : isPpt
                              ? 'bg-orange-100 text-orange-800'
                              : isWord
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {mat.fileExtension}
                          </span>
                        </div>

                        {mat.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {mat.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatFileSize(mat.fileSize)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Uploaded: {mat.uploadedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setPreviewMaterial(mat)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition"
                        title="View Document Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDownload(mat)}
                        className="px-2.5 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Preview Modal/Drawer */}
          {previewMaterial && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    previewMaterial.fileType === 'pdf'
                      ? 'bg-red-100 text-red-800'
                      : previewMaterial.fileType === 'ppt'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {previewMaterial.fileType.toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {previewMaterial.name}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">File Type</span>
                    <span className="font-semibold text-slate-800 uppercase">{previewMaterial.fileExtension}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">File Size</span>
                    <span className="font-semibold text-slate-800">{formatFileSize(previewMaterial.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Uploaded On</span>
                    <span className="font-semibold text-slate-800">{previewMaterial.uploadedAt}</span>
                  </div>
                </div>

                {previewMaterial.description && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Document Notes:</span>
                    <p className="text-slate-700 text-xs mt-0.5">{previewMaterial.description}</p>
                  </div>
                )}

                {/* If it's a PDF with dataUrl, show embed or open button */}
                {previewMaterial.fileType === 'pdf' && previewMaterial.dataUrl && (
                  <div className="pt-2">
                    <div className="h-48 w-full border border-slate-200 rounded overflow-hidden">
                      <iframe
                        src={previewMaterial.dataUrl}
                        title={previewMaterial.name}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleDownload(previewMaterial)}
                    className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File ({formatFileSize(previewMaterial.fileSize)})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg text-xs transition"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
