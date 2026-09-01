import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Plus, 
  Heart, 
  Send, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar, 
  User, 
  BookOpen, 
  Lock 
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
    <div className="space-y-6 pb-28 pt-4 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Heartfelt Words</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-white tracking-tight mt-1">
            Love Letters & Envelopes 💌
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Unopened thoughts, eternal promises, and messages written straight from the heart.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            onClick={onOpenCompose}
            icon={<Plus className="w-4 h-4" />}
          >
            Write Love Letter
          </GlassButton>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterSender('All')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            filterSender === 'All'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border border-white/20'
              : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          ✨ All Letters ({letters.length})
        </button>
        <button
          onClick={() => setFilterSender('Bagas')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            filterSender === 'Bagas'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border border-white/20'
              : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          👨‍💼 From Bagas
        </button>
        <button
          onClick={() => setFilterSender('Anita')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            filterSender === 'Anita'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border border-white/20'
              : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          🌷 From Anita
        </button>
      </div>

      {/* Letters Grid */}
      {filteredLetters.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-400 max-w-md mx-auto my-8">
          <div className="text-3xl mb-2">💌</div>
          <h3 className="text-lg font-semibold text-white">No letters found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            No love letters under this filter yet. Write a romantic letter now!
          </p>
          <GlassButton variant="primary" size="sm" onClick={onOpenCompose}>
            Write Letter
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLetters.map((letter, index) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <GlassCard
                hoverEffect
                onClick={() => setReadingLetter(letter)}
                className="p-6 border-rose-500/20 cursor-pointer h-full flex flex-col justify-between group relative overflow-hidden bg-slate-900/60"
              >
                {/* Envelope Top Decoration */}
                <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                      {letter.stampEmoji || '💌'}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                        {letter.title}
                      </h3>
                      <p className="text-[11px] text-pink-300/80">
                        {letter.sender} ➔ {letter.recipient}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {letter.date}
                  </span>
                </div>

                {/* Excerpt Body */}
                <div className="flex-1 py-1">
                  <p className="font-handwriting text-xl text-rose-100/90 line-clamp-4 leading-relaxed">
                    {letter.content}
                  </p>
                </div>

                {/* Footer read action */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-rose-300 font-medium mt-3">
                  <span className="flex items-center gap-1.5 group-hover:underline">
                    <BookOpen className="w-3.5 h-3.5" /> Read Full Letter
                  </span>
                  <span className="text-slate-400 group-hover:text-rose-200">
                    Seal: Intact ✨
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Letter Reading Modal */}
      <GlassModal
        isOpen={Boolean(readingLetter)}
        onClose={() => {
          setReadingLetter(null);
          setDeleteConfirmId(null);
        }}
        title={
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{readingLetter?.stampEmoji || '💌'}</span>
            <span className="truncate">{readingLetter?.title}</span>
          </div>
        }
        maxWidth="2xl"
      >
        {readingLetter && (
          <div className="space-y-6">
            {/* Letter Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-200 font-medium">
                  From: {readingLetter.sender}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-200 font-medium">
                  To: {readingLetter.recipient}
                </span>
              </div>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pink-400" /> {readingLetter.date}
              </span>
            </div>

            {/* Letter Parchment Canvas */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-rose-500/30 shadow-inner relative overflow-hidden">
              <p className="font-handwriting text-2xl sm:text-3xl text-rose-50 leading-relaxed whitespace-pre-line">
                {readingLetter.content}
              </p>
              
              <div className="mt-8 pt-4 border-t border-rose-500/20 flex justify-end">
                <div className="text-right">
                  <div className="text-xs text-slate-400">With eternal love,</div>
                  <div className="font-handwriting text-2xl text-rose-300 font-bold mt-1">
                    {readingLetter.sender} 🤍
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            {deleteConfirmId === readingLetter.id ? (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between">
                <span className="text-xs text-rose-300 font-medium">Are you sure you want to delete this letter?</span>
                <div className="flex gap-2">
                  <GlassButton size="sm" variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</GlassButton>
                  <GlassButton
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onDeleteLetter(readingLetter.id);
                      setDeleteConfirmId(null);
                      setReadingLetter(null);
                    }}
                  >
                    Confirm Delete
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const l = readingLetter;
                      setReadingLetter(null);
                      onEditLetter(l);
                    }}
                    icon={<Edit3 className="w-3.5 h-3.5 text-pink-300" />}
                  >
                    Edit Letter
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(readingLetter.id)}
                    className="text-rose-400 hover:text-rose-300"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </GlassButton>
                </div>

                <GlassButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setReadingLetter(null)}
                >
                  Close Letter
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </GlassModal>
    </div>
  );
};
