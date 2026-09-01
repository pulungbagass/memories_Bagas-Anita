import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  StickyNote as StickyNoteIcon, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar,
  Check
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { StickyNote, AuthorType } from '../../types';

interface NotesPageProps {
  notes: StickyNote[];
  onOpenCreate: () => void;
  onEditNote: (note: StickyNote) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  notes,
  onOpenCreate,
  onEditNote,
  onDeleteNote,
  onTogglePin
}) => {
  const [filterAuthor, setFilterAuthor] = useState<string>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredNotes = notes.filter((n) => {
    if (filterAuthor === 'All') return true;
    return n.author === filterAuthor;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const colorStyles: Record<string, { bg: string; border: string; badge: string }> = {
    pink: { bg: 'bg-pink-950/40', border: 'border-pink-500/30', badge: 'bg-pink-500/20 text-pink-300' },
    purple: { bg: 'bg-purple-950/40', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
    yellow: { bg: 'bg-amber-950/40', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
    blue: { bg: 'bg-sky-950/40', border: 'border-sky-500/30', badge: 'bg-sky-500/20 text-sky-300' },
    green: { bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
  };

  const renderNoteCard = (note: StickyNote) => {
    const style = colorStyles[note.color] || colorStyles.pink;
    return (
      <GlassCard
        key={note.id}
        hoverEffect
        className={`p-5 ${style.bg} ${style.border} flex flex-col justify-between group relative`}
      >
        <div>
          {/* Card Top */}
          <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{note.emoji || '✨'}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
                {note.author}
              </span>
            </div>
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title={note.isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          {/* Text Content */}
          <p className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {note.text}
          </p>
        </div>

        {/* Footer & Actions */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 mt-4">
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3 h-3 text-pink-400" /> {note.date}
          </span>
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditNote(note)}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/10"
              title="Edit note"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (deleteConfirmId === note.id) {
                  onDeleteNote(note.id);
                  setDeleteConfirmId(null);
                } else {
                  setDeleteConfirmId(note.id);
                  setTimeout(() => setDeleteConfirmId(null), 3000);
                }
              }}
              className={`p-1.5 rounded-md transition-colors ${
                deleteConfirmId === note.id ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
              }`}
              title="Delete note"
            >
              {deleteConfirmId === note.id ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-6 pb-28 pt-4 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Thoughts & Sweet Reminders</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-white tracking-tight mt-1">
            Sticky Notes Board 📝
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Little cute notes, funny moments, dinner wishlists, and reminders left for each other.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            onClick={onOpenCreate}
            icon={<Plus className="w-4 h-4" />}
          >
            Pin New Note
          </GlassButton>
        </div>
      </div>

      {/* Author Filter */}
      <div className="flex items-center gap-2">
        {['All', 'Together', 'Bagas', 'Anita'].map((author) => (
          <button
            key={author}
            onClick={() => setFilterAuthor(author)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              filterAuthor === author
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            {author === 'All' ? '✨ All Notes' : author === 'Together' ? '🤍 Both of Us' : author === 'Bagas' ? '👨‍💼 Bagas' : '🌷 Anita'}
          </button>
        ))}
      </div>

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Pin className="w-3.5 h-3.5 fill-amber-400" />
            <span>Pinned to Board</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* All / Unpinned Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2">
            Other Notes
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-400 max-w-md mx-auto my-8">
            <div className="text-3xl mb-2">📌</div>
            <h3 className="text-lg font-semibold text-white">No sticky notes found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Pin your first cute note or reminder to the board!
            </p>
            <GlassButton variant="primary" size="sm" onClick={onOpenCreate}>
              Create Note
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map(renderNoteCard)}
          </div>
        )}
      </div>
    </div>
  );
};
