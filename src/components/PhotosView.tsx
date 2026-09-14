import React, { useState } from 'react';
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
  Filter 
} from 'lucide-react';

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
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxPhoto, setLightboxPhoto] = useState<TrainingPhoto | null>(null);

  const filteredPhotos = photos.filter((p) => {
    const matchesSchedule = selectedScheduleId === 'All' || p.scheduleId === selectedScheduleId;
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSchedule && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Title & Upload Button */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b5d]">Training Photo & Audit Evidence Vault</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Photographic proof, practical drill records, and signed evaluation evidence for buyer audit compliance.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo Evidence</span>
          </button>
        )}
      </div>

      {/* Audit Evidence Checklist Summary Panel (matching prototype) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#123b5d] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Buyer & Auditor Evidence Checklist (Per Session)</span>
          </h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
            Overall Vault Health: 94%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Attendance Record</div>
              <div className="text-[11px] text-slate-500">Biometric & QR verified</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Training Photo</div>
              <div className="text-[11px] text-slate-500">Drill & Group Photos</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Uploaded ({photos.length})</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Training Material</div>
              <div className="text-[11px] text-slate-500">SDS & Chemical Modules</div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Archived</span>
            </span>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Evaluation / Quiz</div>
              <div className="text-[11px] text-slate-500">Post-training tests</div>
            </div>
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>In Progress</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Session:</span>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-[#123b5d]"
            >
              <option value="All">All Sessions ({photos.length} photos)</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} - {s.moduleName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-[#123b5d]"
            >
              <option value="All">All Categories</option>
              <option value="Practical / PPE Drill">Practical / PPE Drill</option>
              <option value="Trainer Delivery">Trainer Delivery</option>
              <option value="Group Photo">Group Photo</option>
              <option value="Attendance Sheet">Signed Attendance Sheet</option>
              <option value="Evaluation Sheet">Evaluation Sheet</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredPhotos.length} photo records
        </span>
      </div>

      {/* Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
          <Camera className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No photos found for this filter</div>
          <p className="text-xs text-slate-400">
            Click "Upload Photo Evidence" to add new photos from your camera or local drive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
            >
              {/* Photo Thumbnail */}
              <div
                onClick={() => setLightboxPhoto(photo)}
                className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="p-2 bg-white/90 rounded-full text-slate-800 shadow">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#123b5d]/90 text-white backdrop-blur-xs">
                  {photo.category}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                  {photo.date}
                </span>
              </div>

              {/* Caption & Metadata */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 line-clamp-1">
                    {photo.scheduleTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {photo.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>By: {photo.uploadedBy}</span>
                  {canEdit && (
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{lightboxPhoto.scheduleTitle}</h3>
                <div className="text-xs text-slate-400">
                  {lightboxPhoto.category} &bull; {lightboxPhoto.date} &bull; Uploaded by {lightboxPhoto.uploadedBy}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={lightboxPhoto.imageUrl}
                  download="training-evidence.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 max-h-[70vh] bg-black flex items-center justify-center p-4">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.caption}
                className="max-h-[65vh] max-w-full object-contain rounded-md"
              />
            </div>

            <div className="p-4 bg-slate-950 text-slate-300 text-xs border-t border-slate-800">
              {lightboxPhoto.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
