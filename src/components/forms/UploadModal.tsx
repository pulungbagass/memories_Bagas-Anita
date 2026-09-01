import React, { useState, useRef } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { UploadCloud, Video, AlertCircle, MapPin, Calendar, User, Tag, Info, CheckCircle2 } from 'lucide-react';
import { AuthorType, GalleryItem } from '../../types';
import { uploadMediaToVercelBlob, DebugErrorLog } from '../../lib/vercelClient';
import { DiagnosticInspector } from '../ui/DiagnosticInspector';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: GalleryItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState<AuthorType>('Together');
  const [category, setCategory] = useState<'All' | 'Dates' | 'Trips' | 'Daily' | 'Anniversary' | 'Special'>('Dates');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<DebugErrorLog | null>(null);
  const [lastSuccessLog, setLastSuccessLog] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setAuthor('Together');
    setCategory('Dates');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
    setDebugError(null);
    setLastSuccessLog(null);
    setIsUploading(false);
    setUploadProgressStatus('');
  };

  const handleFileSelect = (selectedFile: File) => {
    setErrorMsg(null);
    setDebugError(null);
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMsg('Please select a valid image (JPG, PNG, WEBP, GIF) or video (MP4, MOV, WEBM).');
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 500MB limit.');
      return;
    }

    setFile(selectedFile);
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a photo or video to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a title for this memory.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setDebugError(null);
    setUploadProgressStatus('Preparing file and optimizing payload...');

    try {
      setUploadProgressStatus('Uploading to Vercel Blob storage (/api/upload)...');
      const uploadRes = await uploadMediaToVercelBlob(file, author, category);
      const isVideo = file.type.startsWith('video/');

      const newItem: GalleryItem = {
        id: 'gal_' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        mediaType: isVideo ? 'video' : 'photo',
        url: uploadRes.url,
        thumbnailUrl: uploadRes.thumbnailUrl || uploadRes.url,
        author,
        category,
        date,
        location: location.trim() || undefined,
        isFavorite: false,
        aspectRatio: isVideo ? 1.77 : 1.33,
        createdAt: new Date().toISOString()
      };

      setLastSuccessLog({
        action: 'Uploaded Media to Vercel Blob',
        endpoint: '/api/upload',
        durationMs: uploadRes.durationMs,
        details: {
          url: uploadRes.url,
          storage: uploadRes.storage,
          originalSizeMb: uploadRes.originalSizeMb,
          uploadedSizeMb: uploadRes.uploadedSizeMb,
          wasCompressed: uploadRes.wasCompressed,
        }
      });

      onSuccess(newItem);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Upload failed with diagnostic data:', err);
      setErrorMsg(err.message || 'Failed to upload file to storage.');
      setDebugError({
        endpoint: err.endpoint || '/api/upload',
        httpStatus: err.httpStatus || 500,
        message: err.message || 'Upload failed',
        timestamp: err.timestamp || new Date().toISOString(),
        details: err.details || { error: String(err) },
        suggestions: err.suggestions || [
          'Verify if BLOB_READ_WRITE_TOKEN is configured in Vercel Storage settings.',
          'Check server status in the System & Storage Status modal.',
        ],
      });
    } finally {
      setIsUploading(false);
      setUploadProgressStatus('');
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-pink-400" />
          <span>Upload Memory to Vercel Blob</span>
        </div>
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center
            ${isDragging ? 'border-pink-400 bg-pink-500/15 scale-[1.01]' : 'border-white/20 hover:border-pink-400/50 bg-white/5'}
            ${file ? 'border-pink-500/50 bg-pink-950/20' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              {previewUrl ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg border border-pink-500/40">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                  <Video className="w-10 h-10" />
                </div>
              )}
              <div className="text-xs text-slate-200 font-medium truncate max-w-xs">{file.name}</div>
              <div className="text-[11px] text-pink-300">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Unknown media'}
              </div>
              <div className="text-[11px] text-slate-400">Click or drag another file to replace</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="p-3 rounded-full bg-pink-500/10 text-pink-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="font-semibold text-white">Click or drag photos & videos here</div>
              <div className="text-xs text-slate-400 max-w-sm">
                High-resolution photos (JPG, PNG, WebP) and videos (MP4, MOV). Stored directly into Vercel Blob store.
              </div>
            </div>
          )}
        </div>

        {/* Upload Status Banner */}
        {isUploading && uploadProgressStatus && (
          <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 flex items-center gap-3 text-xs text-pink-200">
            <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>{uploadProgressStatus}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Live Diagnostic Inspector on error or debug */}
        {debugError && (
          <DiagnosticInspector
            debugError={debugError}
            defaultExpanded={true}
          />
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Memory Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sunset in Jimbaran, Our First Concert..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Story / Caption
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What made this moment so special for both of you?..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 resize-none"
          />
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-pink-400" /> Captured By
            </label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm bg-slate-900"
            >
              <option value="Together">💑 Bagas & Anita (Together)</option>
              <option value="Bagas">👨 Bagas</option>
              <option value="Anita">👩 Anita</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-pink-400" /> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm bg-slate-900"
            >
              <option value="Dates">☕ Dates & Coffee</option>
              <option value="Trips">✈️ Trips & Travels</option>
              <option value="Daily">✨ Daily Moments</option>
              <option value="Anniversary">💖 Anniversary</option>
              <option value="Special">🌟 Special Occasion</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-pink-400" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm bg-slate-900"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Yogyakarta, Paris, Cafe..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            isLoading={isUploading}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            {isUploading ? 'Uploading to Vercel Blob...' : 'Save & Upload'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
