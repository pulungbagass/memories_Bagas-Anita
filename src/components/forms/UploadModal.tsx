import React, { useState, useRef } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { UploadCloud, Video, AlertCircle, MapPin, Calendar, User, Tag } from 'lucide-react';
import { AuthorType, GalleryItem } from '../../types';
import { uploadMediaToVercelBlob } from '../../lib/vercelClient';

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
  const [isDragging, setIsDragging] = useState(false);

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
    setIsUploading(false);
  };

  const handleFileSelect = (selectedFile: File) => {
    setErrorMsg(null);
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMsg('Please select a valid image (JPG, PNG, WEBP, GIF) or video (MP4, MOV, WEBM).');
      return;
    }

    // 500MB max limit
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

    try {
      // 1. Upload to Vercel Blob / Native Server
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

      onSuccess(newItem);
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload file.');
    } finally {
      setIsUploading(false);
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
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {file ? (
            <div className="flex flex-col items-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-48 rounded-xl object-cover border border-white/20 mb-3 shadow-lg"
                />
              ) : (
                <div className="p-4 rounded-xl bg-pink-500/20 text-pink-300 mb-3">
                  <Video className="w-12 h-12" />
                </div>
              )}
              <div className="font-semibold text-white truncate max-w-xs">{file.name}</div>
              <div className="text-xs text-pink-300 mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.startsWith('video/') ? 'Video' : 'Photo'}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Click or drop another file to replace</div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 text-pink-400 border border-pink-500/30 mb-3">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>
              <p className="font-medium text-white">Click to browse or drag & drop files here</p>
              <p className="text-xs text-slate-400 mt-1">
                Photos (JPG, PNG, WEBP) • Videos (MP4, MOV, WEBM) up to 500MB
              </p>
              <p className="text-[11px] text-pink-300/80 mt-1">
                Stored persistently on Vercel Native Storage 🚀
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Memory Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sunset Walk at Braga, Bandung"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Story / Caption
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a sweet note about this moment..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-pink-400" /> Captured By
            </label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value as AuthorType)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm bg-slate-900"
            >
              <option value="Together">🤍 Together (Both of Us)</option>
              <option value="Bagas">👨‍💼 Bagas</option>
              <option value="Anita">🌷 Anita</option>
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
