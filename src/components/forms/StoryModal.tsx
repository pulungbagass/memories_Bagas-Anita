import React, { useState, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { CalendarHeart, Calendar, MapPin, Tag, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TimelineMilestone } from '../../types';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (milestone: TimelineMilestone) => void;
  editMilestone?: TimelineMilestone | null;
}

const STORY_EMOJIS = ['💖', '🌸', '✨', '☕', '✈️', '💍', '🏠', '🎂', '🎓', '🚗', '📚', '🥂', '🌅', '🏖️', '🎬', '🌷', '🤍', '🌙'];

const STORY_CATEGORIES = ['Beginning', 'Dates', 'Trips', 'Anniversary', 'Milestone', 'Special'];

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editMilestone,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💖');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Beginning');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (editMilestone) {
      setTitle(editMilestone.title);
      setDate(editMilestone.date);
      setDescription(editMilestone.description);
      setEmoji(editMilestone.emoji || '💖');
      setLocation(editMilestone.location || '');
      setCategory(editMilestone.category || 'Special');
      setPhotoUrl(editMilestone.photoUrl || '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setEmoji('💖');
      setLocation('');
      setCategory('Dates');
      setPhotoUrl('');
    }
  }, [editMilestone, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const milestone: TimelineMilestone = {
      id: editMilestone ? editMilestone.id : 'mile_' + Date.now(),
      title: title.trim(),
      date,
      description: description.trim(),
      emoji,
      location: location.trim() || undefined,
      category,
      photoUrl: photoUrl.trim() || undefined,
    };

    onSuccess(milestone);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CalendarHeart className="w-5 h-5 text-pink-400" />
          <span>{editMilestone ? 'Edit Cerita / Milestone' : 'Tambah Cerita Perjalanan 📖'}</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Judul Momen / Story *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="misal: Hari Pertama Ketemu di Braga ☕"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 placeholder:text-slate-500"
          />
        </div>

        {/* Date & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-400" /> Tanggal Kejadian *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-pink-400" /> Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900 text-white"
            >
              {STORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Optional Photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> Lokasi (Opsional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="misal: Yogyakarta, Bandung"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm bg-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Foto URL (Opsional)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm bg-slate-900 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Emoji Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Pilih Ikon Emoji
          </label>
          <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            {STORY_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all
                  ${emoji === e ? 'bg-pink-500/30 border-2 border-pink-400 scale-110' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}
                `}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Description / Story Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Cerita & Kenangan Momen Ini *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan momen indah ini secara lengkap..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Batal
          </GlassButton>
          <GlassButton type="submit" variant="primary">
            {editMilestone ? 'Simpan Perubahan' : 'Simpan Cerita ✨'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
