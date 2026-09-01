import React, { useState, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { StickyNote as StickyNoteIcon, Pin, Check } from 'lucide-react';
import { AuthorType, StickyNote } from '../../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (note: StickyNote) => void;
  editNote?: StickyNote | null;
}

const NOTE_COLORS: { id: 'pink' | 'purple' | 'yellow' | 'blue' | 'green'; name: string; bg: string; border: string; text: string }[] = [
  { id: 'pink', name: 'Blush Pink', bg: 'bg-pink-950/60', border: 'border-pink-500/40', text: 'text-pink-200' },
  { id: 'purple', name: 'Lilac', bg: 'bg-purple-950/60', border: 'border-purple-500/40', text: 'text-purple-200' },
  { id: 'yellow', name: 'Golden Honey', bg: 'bg-amber-950/60', border: 'border-amber-500/40', text: 'text-amber-200' },
  { id: 'blue', name: 'Pastel Blue', bg: 'bg-sky-950/60', border: 'border-sky-500/40', text: 'text-sky-200' },
  { id: 'green', name: 'Mint Green', bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-200' },
];

const EMOJI_LIST = ['✨', '🤍', '🌸', '☕', '🍿', '🎬', '🍱', '🚗', '🏔️', '🍦', '💖', '💌'];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editNote
}) => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState<AuthorType>('Together');
  const [color, setColor] = useState<'pink' | 'purple' | 'yellow' | 'blue' | 'green'>('pink');
  const [emoji, setEmoji] = useState('✨');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (editNote) {
      setText(editNote.text);
      setAuthor(editNote.author);
      setColor(editNote.color);
      setEmoji(editNote.emoji || '✨');
      setIsPinned(Boolean(editNote.isPinned));
    } else {
      setText('');
      setAuthor('Together');
      setColor('pink');
      setEmoji('✨');
      setIsPinned(false);
    }
  }, [editNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newNote: StickyNote = {
      id: editNote ? editNote.id : 'note_' + Date.now(),
      text: text.trim(),
      author,
      color,
      emoji,
      isPinned,
      date: new Date().toISOString().split('T')[0],
      createdAt: editNote ? editNote.createdAt : new Date().toISOString()
    };

    onSuccess(newNote);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="w-5 h-5 text-amber-400" />
          <span>{editNote ? 'Edit Sticky Note' : 'Pin a Sticky Note 📌'}</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Author */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Author
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value as AuthorType)}
            className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900"
          >
            <option value="Together">🤍 Together (Both of Us)</option>
            <option value="Bagas">👨‍💼 Bagas</option>
            <option value="Anita">🌷 Anita</option>
          </select>
        </div>

        {/* Note Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Note Content
          </label>
          <textarea
            required
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a sweet reminder, movie idea, or cute note..."
            className="w-full px-4 py-3 rounded-2xl glass-input text-sm resize-none"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Card Tone
          </label>
          <div className="flex gap-2">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${c.bg} ${
                  color === c.id ? 'ring-2 ring-pink-400 scale-110 border-white' : 'border-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Emoji Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Note Emoji Icon
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJI_LIST.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-base p-1.5 rounded-xl transition-all cursor-pointer ${
                  emoji === e
                    ? 'bg-pink-500/30 border border-pink-400 scale-110'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned toggle */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="pinned-check"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 rounded text-pink-500 bg-slate-900 border-white/20 focus:ring-pink-500 cursor-pointer"
          />
          <label htmlFor="pinned-check" className="text-xs text-slate-300 flex items-center gap-1 cursor-pointer">
            <Pin className="w-3.5 h-3.5 text-pink-400" /> Pin this note to top of the board
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary">
            {editNote ? 'Update Note' : 'Pin Note ✨'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
