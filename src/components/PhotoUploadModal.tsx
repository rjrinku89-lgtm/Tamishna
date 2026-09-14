import React, { useState } from 'react';
import { TrainingSchedule, TrainingPhoto } from '../types';
import { Upload, X, Image, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: TrainingSchedule[];
  onUpload: (newPhoto: TrainingPhoto) => void;
  currentUser: string;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  schedules,
  onUpload,
  currentUser,
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState(
    schedules[0]?.id || ''
  );
  const [category, setCategory] = useState<TrainingPhoto['category']>('Practical / PPE Drill');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSamplePhotoSelect = (sampleUrl: string, sampleCategory: TrainingPhoto['category'], sampleCaption: string) => {
    setPreviewUrl(sampleUrl);
    setCategory(sampleCategory);
    setCaption(sampleCaption);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setError('Please select or upload a training photo.');
      return;
    }

    const schedule = schedules.find((s) => s.id === selectedScheduleId);
    const newPhoto: TrainingPhoto = {
      id: `photo-${Date.now()}`,
      scheduleId: selectedScheduleId,
      scheduleTitle: schedule?.moduleName || 'Training Session',
      date: schedule?.date || new Date().toISOString().split('T')[0],
      category,
      imageUrl: previewUrl,
      caption: caption.trim() || `${category} - ${schedule?.moduleName}`,
      uploadedBy: currentUser,
      uploadedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpload(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123b5d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-lg">Upload Training Photo & Evidence</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Training Session */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Training Session:
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} &bull; {s.moduleName} ({s.scheduleCode})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evidence Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TrainingPhoto['category'])}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
            >
              <option value="Practical / PPE Drill">Practical / PPE Drill</option>
              <option value="Trainer Delivery">Trainer Delivery</option>
              <option value="Group Photo">Group Photo</option>
              <option value="Attendance Sheet">Signed Attendance Sheet</option>
              <option value="Evaluation Sheet">Evaluation / Quiz Sheet</option>
            </select>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photo File:
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[#123b5d] rounded-xl p-4 text-center cursor-pointer transition relative bg-slate-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg object-cover shadow-xs border border-slate-200"
                  />
                  <span className="text-xs text-sky-700 font-semibold block">
                    Click to change uploaded image
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 py-4">
                  <Image className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-700">
                    Click or drag & drop to upload photo
                  </div>
                  <div className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Industrial Sample Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Or pick an industrial factory evidence preset:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSamplePhotoSelect(
                  'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=600&auto=format&fit=crop&q=80',
                  'Practical / PPE Drill',
                  'Workers wearing chemical respirators and acid-proof suits during spill containment drill.'
                )}
                className="p-1.5 border border-slate-200 hover:border-[#123b5d] rounded-lg text-left bg-white transition hover:shadow-xs group"
              >
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=150&auto=format&fit=crop&q=80"
                  className="w-full h-14 object-cover rounded mb-1"
                  alt="PPE Drill"
                />
                <span className="text-[10px] font-medium text-slate-700 group-hover:text-[#123b5d] line-clamp-1">
                  Chemical PPE Drill
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSamplePhotoSelect(
                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
                  'Trainer Delivery',
                  'Trainer demonstrating pH buffer calibration in ETP control laboratory.'
                )}
                className="p-1.5 border border-slate-200 hover:border-[#123b5d] rounded-lg text-left bg-white transition hover:shadow-xs group"
              >
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80"
                  className="w-full h-14 object-cover rounded mb-1"
                  alt="ETP Training"
                />
                <span className="text-[10px] font-medium text-slate-700 group-hover:text-[#123b5d] line-clamp-1">
                  ETP Lab Session
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSamplePhotoSelect(
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
                  'Group Photo',
                  'Certified participants group photo with safety trainer after evaluation.'
                )}
                className="p-1.5 border border-slate-200 hover:border-[#123b5d] rounded-lg text-left bg-white transition hover:shadow-xs group"
              >
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80"
                  className="w-full h-14 object-cover rounded mb-1"
                  alt="Group"
                />
                <span className="text-[10px] font-medium text-slate-700 group-hover:text-[#123b5d] line-clamp-1">
                  Batch Group Photo
                </span>
              </button>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evidence Description / Caption:
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Chemical safety drill conducted with PPE, eyewash station test, and fire blanket exercise."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123b5d]"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-sm font-semibold rounded-lg transition flex items-center space-x-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save to Evidence Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
