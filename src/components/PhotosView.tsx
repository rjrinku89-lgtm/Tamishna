import React, { useState, useMemo } from 'react';
import { TrainingPhoto, TrainingSchedule } from '../types';
import { 
  Camera, 
  Upload, 
  Search, 
  CheckCircle, 
  Clock, 
  Download, 
  Trash2, 
  X, 
  ZoomIn, 
  ShieldCheck, 
  Filter,
  FileText,
  Calendar,
  Layers,
  FolderArchive,
  Eye,
  Check,
  Tag,
  ArrowUpDown,
  BookOpen,
  FileCheck2,
  PackageCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface PhotosViewProps {
  photos: TrainingPhoto[];
  schedules: TrainingSchedule[];
  onOpenUploadModal: () => void;
  onDeletePhoto: (photoId: string) => void;
  canEdit: boolean;
}

export const PhotosView: React.FC<PhotosViewProps> = ({
  photos,
  schedules,
  onOpenUploadModal,
  onDeletePhoto,
  canEdit,
}) => {
  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAuditTag, setSelectedAuditTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'document'>('all');
  const [viewMode, setViewMode] = useState<'month-groups' | 'grid'>('month-groups');

  // Preview / Lightbox modal
  const [lightboxPhoto, setLightboxPhoto] = useState<TrainingPhoto | null>(null);

  // Derive all unique months sorted descending
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    photos.forEach((p) => {
      const ym = p.monthYear || (p.date ? p.date.substring(0, 7) : '');
      if (ym) monthsSet.add(ym);
    });
    // Add known scheduled months
    schedules.forEach((s) => {
      if (s.date) monthsSet.add(s.date.substring(0, 7));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [photos, schedules]);

  // Format YYYY-MM to readable name e.g. "August 2026"
  const formatMonthName = (ym: string) => {
    if (!ym || ym.length < 7) return ym;
    const [year, month] = ym.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filtered evidence
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const pMonth = p.monthYear || (p.date ? p.date.substring(0, 7) : '');
      const matchesMonth = selectedMonth === 'All' || pMonth === selectedMonth;
      const matchesSchedule = selectedScheduleId === 'All' || p.scheduleId === selectedScheduleId;
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesTag = selectedAuditTag === 'All' || p.auditTag === selectedAuditTag;
      
      const matchesType = 
        fileTypeFilter === 'all' 
          ? true 
          : fileTypeFilter === 'image' 
            ? (!p.fileType || p.fileType === 'image') 
            : (p.fileType === 'document' || p.fileType === 'pdf' || p.fileType === 'excel');

      const matchesSearch = 
        !searchQuery.trim() ||
        p.scheduleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.fileName && p.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.auditTag && p.auditTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesMonth && matchesSchedule && matchesCat && matchesTag && matchesType && matchesSearch;
    });
  }, [photos, selectedMonth, selectedScheduleId, selectedCategory, selectedAuditTag, fileTypeFilter, searchQuery]);

  // Group evidence by month for month-wise vault navigation
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: TrainingPhoto[] } = {};
    filteredPhotos.forEach((item) => {
      const ym = item.monthYear || (item.date ? item.date.substring(0, 7) : 'Unassigned');
      if (!groups[ym]) groups[ym] = [];
      groups[ym].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredPhotos]);

  // Download all filtered evidence as structured audit evidence log (.xlsx)
  const handleExportEvidenceLogExcel = () => {
    const data = filteredPhotos.map((p, idx) => ({
      'SL': idx + 1,
      'Month': formatMonthName(p.monthYear || p.date?.substring(0, 7) || ''),
      'Date': p.date,
      'Training Session': p.scheduleTitle,
      'Evidence Category': p.category,
      'File Name': p.fileName || `${p.category}.jpg`,
      'File Type': p.fileType || 'image',
      'File Size': p.fileSize || 'Standard',
      'Audit Tag / Compliance': p.auditTag || 'General',
      'Evidence Description': p.caption,
      'Uploaded By': p.uploadedBy,
      'Verification Status': 'Audit Ready / Verified',
      'File URL / Asset Link': p.imageUrl,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Evidence Vault');

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 14 },
      { wch: 35 },
      { wch: 24 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 45 },
      { wch: 18 },
      { wch: 22 },
      { wch: 40 },
    ];

    const fileName = `Audit_Evidence_Vault_Monthwise_${selectedMonth === 'All' ? 'All_Months' : selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Download individual file
  const handleDownloadSingle = (photo: TrainingPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = photo.fileName || `Evidence_${photo.category.replace(/\s+/g, '_')}_${photo.date}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all evidence files in current month/view (triggers browser download sequence)
  const handleDownloadAllEvidenceFiles = () => {
    if (filteredPhotos.length === 0) {
      alert('No evidence items to download.');
      return;
    }
    
    // First download the audit manifest excel
    handleExportEvidenceLogExcel();

    // Trigger individual downloads for first 5 to prevent browser popup block
    const toDownload = filteredPhotos.slice(0, 8);
    toDownload.forEach((p, idx) => {
      setTimeout(() => {
        handleDownloadSingle(p);
      }, idx * 250);
    });

    if (filteredPhotos.length > 8) {
      alert(`Manifest Excel downloaded! Downloaded ${toDownload.length} files. Open individual files directly or inspect the audit register.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-[#123b5d]">
              Training Photo & Audit Evidence Vault
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Month-wise storage of training photos, signed attendance sheets, practical drills, and buyer compliance documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadAllEvidenceFiles}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition shadow-xs"
            title="Download all evidence files and audit manifest spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Download All Evidence ({filteredPhotos.length})</span>
          </button>

          <button
            onClick={handleExportEvidenceLogExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
            title="Export full audit ledger to Excel"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Audit Excel Log</span>
          </button>

          {canEdit && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo & Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Readiness Checklist & Month Selector Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#123b5d]">
              Month-Wise Audit Evidence Status
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Current Filter:</span>
            <span className="font-bold text-[#123b5d]">
              {selectedMonth === 'All' ? 'All Months Consolidated' : formatMonthName(selectedMonth)}
            </span>
            <span className="text-slate-300">|</span>
            <span>{filteredPhotos.length} records active</span>
          </div>
        </div>

        {/* Quick Month Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-y border-slate-100">
          <span className="text-xs font-medium text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Month:
          </span>
          <button
            onClick={() => setSelectedMonth('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedMonth === 'All'
                ? 'bg-[#123b5d] text-white font-bold shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Months ({photos.length})
          </button>

          {availableMonths.map((ym) => {
            const countInMonth = photos.filter(
              (p) => (p.monthYear || p.date?.substring(0, 7)) === ym
            ).length;
            const isCurrent = ym === '2026-09';
            return (
              <button
                key={ym}
                onClick={() => setSelectedMonth(ym)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                  selectedMonth === ym
                    ? 'bg-[#123b5d] text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{formatMonthName(ym)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedMonth === ym
                      ? 'bg-sky-400/30 text-sky-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {countInMonth}
                </span>
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Month" />
                )}
              </button>
            );
          })}
        </div>

        {/* Audit Compliance Verification Matrix Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Attendance Sheets</div>
              <div className="text-[11px] text-slate-500">Physical signed & QR verified</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Verified</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Drill & Practical Photos</div>
              <div className="text-[11px] text-slate-500">Fire, ETP, Chemical PPE</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Stored</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Training Documents</div>
              <div className="text-[11px] text-slate-500">SOP, SDS & InCheck reports</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Available</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Evaluation Questionnaires</div>
              <div className="text-[11px] text-slate-500">Passing score registry &ge; 80%</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Archived</span>
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search training, caption, file or tag..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Session dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Training:</span>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium max-w-[190px] truncate"
              >
                <option value="All">All Trainings</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} - {s.moduleName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="All">All Categories</option>
                <option value="Practical / PPE Drill">Practical / PPE Drill</option>
                <option value="Trainer Delivery">Trainer Delivery</option>
                <option value="Group Photo">Group Photo</option>
                <option value="Attendance Sheet">Signed Attendance Sheet</option>
                <option value="Evaluation Sheet">Evaluation Sheet</option>
                <option value="Audit Document / Report">Audit Document / Report</option>
                <option value="SOP / Material">SOP / Training Material</option>
              </select>
            </div>

            {/* File type filter */}
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setFileTypeFilter('all')}
                className={`px-2.5 py-1.5 transition ${
                  fileTypeFilter === 'all' ? 'bg-[#123b5d] text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFileTypeFilter('image')}
                className={`px-2.5 py-1.5 border-l border-slate-300 transition ${
                  fileTypeFilter === 'image' ? 'bg-[#123b5d] text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => setFileTypeFilter('document')}
                className={`px-2.5 py-1.5 border-l border-slate-300 transition ${
                  fileTypeFilter === 'document' ? 'bg-[#123b5d] text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Documents/PDF
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setViewMode('month-groups')}
                className={`px-2.5 py-1.5 transition ${
                  viewMode === 'month-groups' ? 'bg-sky-100 text-[#123b5d] font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                title="Group Month-Wise"
              >
                Month Groups
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 border-l border-slate-300 transition ${
                  viewMode === 'grid' ? 'bg-sky-100 text-[#123b5d] font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                title="Compact Grid"
              >
                Flat Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Evidence Vault Display */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">
            No audit evidence or photos found for the selected filter
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try resetting your month or category filters, or click "Upload Photo & Document" to store new evidence into this month.
          </p>
          <button
            onClick={() => {
              setSelectedMonth('All');
              setSelectedCategory('All');
              setSelectedScheduleId('All');
              setSearchQuery('');
              setFileTypeFilter('all');
            }}
            className="text-xs font-semibold text-[#123b5d] bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'month-groups' ? (
        /* Month-Wise Grouped View */
        <div className="space-y-6">
          {groupedByMonth.map(([monthKey, items]) => (
            <div key={monthKey} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Month Group Header */}
              <div className="bg-[#f2f6fa] px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#123b5d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#123b5d]">
                      {formatMonthName(monthKey)}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {items.length} verified audit evidence items stored for this month
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                    {items.filter(i => i.fileType === 'document' || i.fileType === 'pdf').length} Documents &bull; {items.filter(i => !i.fileType || i.fileType === 'image').length} Photos
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMonth(monthKey);
                      handleExportEvidenceLogExcel();
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#123b5d] font-semibold rounded-md flex items-center gap-1 transition shadow-xs"
                    title="Export month report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Month Log</span>
                  </button>
                </div>
              </div>

              {/* Items in this month */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((photo) => (
                  <EvidenceCard
                    key={photo.id}
                    photo={photo}
                    onPreview={() => setLightboxPhoto(photo)}
                    onDownload={(e) => handleDownloadSingle(photo, e)}
                    onDelete={() => onDeletePhoto(photo.id)}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <EvidenceCard
              key={photo.id}
              photo={photo}
              onPreview={() => setLightboxPhoto(photo)}
              onDownload={(e) => handleDownloadSingle(photo, e)}
              onDelete={() => onDeletePhoto(photo.id)}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {/* Lightbox / Document & Photo Preview Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm">{lightboxPhoto.scheduleTitle}</h3>
                  {lightboxPhoto.auditTag && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-sky-900 text-sky-200 font-semibold border border-sky-700">
                      {lightboxPhoto.auditTag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lightboxPhoto.category} &bull; {lightboxPhoto.date} &bull; Month: {formatMonthName(lightboxPhoto.monthYear || lightboxPhoto.date?.substring(0, 7) || '')}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadSingle(lightboxPhoto)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="flex-1 max-h-[68vh] bg-black flex items-center justify-center p-4 overflow-auto">
              {lightboxPhoto.fileType === 'pdf' || lightboxPhoto.fileType === 'document' ? (
                <div className="bg-slate-800/90 rounded-xl p-8 max-w-lg w-full text-center border border-slate-700 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">{lightboxPhoto.fileName || 'Audit Document'}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {lightboxPhoto.fileSize || 'Standard Document'} &bull; Verified compliance record
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    "{lightboxPhoto.caption}"
                  </p>
                  <button
                    onClick={() => handleDownloadSingle(lightboxPhoto)}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg inline-flex items-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Open Document</span>
                  </button>
                </div>
              ) : (
                <img
                  src={lightboxPhoto.imageUrl}
                  alt={lightboxPhoto.caption}
                  className="max-h-[62vh] max-w-full object-contain rounded-md shadow-2xl"
                />
              )}
            </div>

            {/* Footer details */}
            <div className="p-4 bg-slate-950 text-slate-300 text-xs border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-semibold text-white">Evidence Description: </span>
                {lightboxPhoto.caption}
              </div>
              <div className="text-[11px] text-slate-400 shrink-0">
                Uploaded by: <span className="text-slate-300 font-medium">{lightboxPhoto.uploadedBy}</span> on {lightboxPhoto.uploadedAt}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Evidence Card Subcomponent
interface EvidenceCardProps {
  photo: TrainingPhoto;
  onPreview: () => void;
  onDownload: (e: React.MouseEvent) => void;
  onDelete: () => void;
  canEdit: boolean;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({
  photo,
  onPreview,
  onDownload,
  onDelete,
  canEdit,
}) => {
  const isDoc = photo.fileType === 'document' || photo.fileType === 'pdf' || photo.fileType === 'excel';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group">
      {/* Thumbnail or Document Preview */}
      <div
        onClick={onPreview}
        className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {isDoc ? (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-4 text-center border-b border-slate-100 group-hover:bg-sky-50/50 transition">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-2 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[90%]">
              {photo.fileName || 'Audit Document'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {photo.fileSize || 'PDF Document'} &bull; Click to View
            </div>
          </div>
        ) : (
          <img
            src={photo.imageUrl}
            alt={photo.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="p-2 bg-white/95 rounded-full text-slate-800 shadow">
            <ZoomIn className="w-4 h-4" />
          </span>
        </div>

        {/* Category Badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#123b5d]/90 text-white backdrop-blur-xs shadow-xs">
          {photo.category}
        </span>

        {/* Audit Tag */}
        {photo.auditTag && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 shadow-xs">
            {photo.auditTag}
          </span>
        )}

        {/* Date Stamp */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/65 text-white text-[10px] font-mono">
          {photo.date}
        </span>
      </div>

      {/* Description & Controls */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 text-xs">
        <div>
          <h4 className="font-semibold text-slate-900 line-clamp-1" title={photo.scheduleTitle}>
            {photo.scheduleTitle}
          </h4>
          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2" title={photo.caption}>
            {photo.caption}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[120px]">By: {photo.uploadedBy}</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={onDownload}
              className="text-slate-500 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 transition"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                title="Delete Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
