import React, { useState } from 'react';
import { 
  StickyNote as StickyNoteIcon, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassModal } from '../ui/GlassModal';
import { StickyNote } from '../../types';

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
    pink: { bg: 'bg-[#201322]', border: 'border-pink-500/40', badge: 'bg-pink-500/20 text-pink-300' },
    purple: { bg: 'bg-[#1a142e]', border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-300' },
    yellow: { bg: 'bg-[#221c12]', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' },
    blue: { bg: 'bg-[#121b2d]', border: 'border-sky-500/40', badge: 'bg-sky-500/20 text-sky-300' },
    green: { bg: 'bg-[#11241c]', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300' },
  };

  const renderNoteCard = (note: StickyNote) => {
    const style = colorStyles[note.color] || colorStyles.pink;
    return (
      <div
        key={note.id}
        className={`p-4 rounded-2xl ${style.bg} border ${style.border} flex flex-col justify-between group shadow-sm`}
      >
        <div>
          {/* Card Top */}
          <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">{note.emoji || '✨'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
                {note.author}
              </span>
            </div>
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                note.isPinned ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title={note.isPinned ? 'Unpin' : 'Pin note'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          {/* Text Content */}
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {note.text}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>{note.date}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditNote(note)}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Edit note"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteConfirmId(note.id)}
              className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-28 pt-2 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reminders & Quick Thoughts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-0.5">
            Sticky Notes & Memos 📝
          </h1>
        </div>

        <GlassButton
          variant="primary"
          onClick={onOpenCreate}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add Sticky Note
        </GlassButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['All', 'Bagas', 'Anita'] as const).map((author) => (
          <button
            key={author}
            onClick={() => setFilterAuthor(author)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filterAuthor === author
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-[#14142b] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {author === 'All' ? '✨ All Notes' : author === 'Bagas' ? '🤍 By Bagas' : '🌷 By Anita'}
          </button>
        ))}
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 fill-amber-400" /> Pinned Notes ({pinnedNotes.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* Unpinned Notes Section */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            All Notes ({unpinnedNotes.length})
          </h2>
        )}

        {filteredNotes.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#131328] border border-dashed border-slate-800 p-6">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-base font-semibold text-white">No sticky notes yet</h3>
            <p className="text-xs text-slate-400 mt-1">Leave a cute note or reminder for each other!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {unpinnedNotes.map(renderNoteCard)}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <GlassModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Sticky Note?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this note? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => {
                if (deleteConfirmId) {
                  onDeleteNote(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Delete
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
