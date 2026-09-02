import React, { useState } from 'react';
import { 
  Mail, 
  Plus, 
  Heart, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar, 
  User, 
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassModal } from '../ui/GlassModal';
import { LoveLetter } from '../../types';

interface LettersPageProps {
  letters: LoveLetter[];
  onOpenCompose: () => void;
  onEditLetter: (letter: LoveLetter) => void;
  onDeleteLetter: (id: string) => void;
}

export const LettersPage: React.FC<LettersPageProps> = ({
  letters,
  onOpenCompose,
  onEditLetter,
  onDeleteLetter
}) => {
  const [filterSender, setFilterSender] = useState<'All' | 'Bagas' | 'Anita'>('All');
  const [readingLetter, setReadingLetter] = useState<LoveLetter | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredLetters = letters.filter((l) => {
    if (filterSender === 'All') return true;
    return l.sender === filterSender;
  });

  return (
    <div className="space-y-5 pb-28 pt-2 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Heartfelt Words</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-0.5">
            Love Letters & Envelopes 💌
          </h1>
        </div>

        <GlassButton
          variant="primary"
          onClick={onOpenCompose}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Write Love Letter
        </GlassButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['All', 'Bagas', 'Anita'] as const).map((sender) => (
          <button
            key={sender}
            onClick={() => setFilterSender(sender)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filterSender === sender
                ? 'bg-rose-500 text-white font-semibold'
                : 'bg-[#14142b] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {sender === 'All' ? '✨ All Letters' : sender === 'Bagas' ? '🤍 From Bagas' : '🌷 From Anita'}
          </button>
        ))}
      </div>

      {/* Letters List */}
      {filteredLetters.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#131328] border border-dashed border-slate-800 p-6">
          <div className="text-3xl mb-2">💌</div>
          <h3 className="text-base font-semibold text-white">No letters found</h3>
          <p className="text-xs text-slate-400 mt-1">Write a letter to express your heartfelt love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLetters.map((letter) => (
            <GlassCard
              key={letter.id}
              hoverEffect
              className="p-5 border-slate-800 flex flex-col justify-between group cursor-pointer"
              onClick={() => setReadingLetter(letter)}
            >
              <div>
                {/* Envelope Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{letter.stampEmoji || '💌'}</span>
                    <span className="text-xs font-semibold text-pink-300">
                      {letter.sender} ➔ {letter.recipient}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{letter.date}</span>
                </div>

                {/* Letter Title & Snip */}
                <h3 className="text-base font-serif-display font-semibold text-white group-hover:text-pink-300 transition-colors">
                  {letter.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed font-light">
                  {letter.content}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-pink-400 font-medium flex items-center gap-1 group-hover:underline">
                  <BookOpen className="w-3.5 h-3.5" /> Read letter
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEditLetter(letter)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Edit letter"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(letter.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete letter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Read Letter Modal */}
      <GlassModal
        isOpen={Boolean(readingLetter)}
        onClose={() => setReadingLetter(null)}
        title={readingLetter?.title}
        maxWidth="lg"
      >
        {readingLetter && (
          <div className="space-y-4 font-serif-display">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="text-pink-300 font-semibold font-sans">
                From: {readingLetter.sender} • To: {readingLetter.recipient}
              </span>
              <span className="font-sans font-mono">{readingLetter.date}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#181832] border border-pink-500/20 text-slate-100 whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-light">
              {readingLetter.content}
            </div>

            <div className="text-right text-xs text-pink-300 italic">
              Forever yours, {readingLetter.sender} 🤍
            </div>
          </div>
        )}
      </GlassModal>

      {/* Delete Confirmation Modal */}
      <GlassModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Love Letter?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this letter? This action cannot be undone.
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
                  onDeleteLetter(deleteConfirmId);
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
