import React, { useState, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { Mail, Heart, Sparkles, Send } from 'lucide-react';
import { LoveLetter } from '../../types';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (letter: LoveLetter) => void;
  editLetter?: LoveLetter | null;
}

const STAMP_OPTIONS = ['💌', '💖', '🌸', '✨', '🤍', '🕊️', '🌷', '🌹'];
const PAPER_COLORS: { id: 'rose' | 'amber' | 'lavender' | 'sky' | 'emerald'; name: string; bg: string; border: string }[] = [
  { id: 'rose', name: 'Rose Petal', bg: 'bg-rose-950/40', border: 'border-rose-500/30' },
  { id: 'amber', name: 'Warm Parchment', bg: 'bg-amber-950/40', border: 'border-amber-500/30' },
  { id: 'lavender', name: 'Lavender Dream', bg: 'bg-purple-950/40', border: 'border-purple-500/30' },
  { id: 'sky', name: 'Morning Sky', bg: 'bg-sky-950/40', border: 'border-sky-500/30' },
  { id: 'emerald', name: 'Sweet Sage', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30' },
];

export const LetterModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editLetter
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sender, setSender] = useState<'Bagas' | 'Anita'>('Bagas');
  const [recipient, setRecipient] = useState<'Bagas' | 'Anita'>('Anita');
  const [stampEmoji, setStampEmoji] = useState('💌');
  const [paperColor, setPaperColor] = useState<'rose' | 'amber' | 'lavender' | 'sky' | 'emerald'>('rose');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editLetter) {
      setTitle(editLetter.title);
      setContent(editLetter.content);
      setSender(editLetter.sender);
      setRecipient(editLetter.recipient);
      setStampEmoji(editLetter.stampEmoji || '💌');
      setPaperColor(editLetter.paperColor || 'rose');
      setDate(editLetter.date);
    } else {
      setTitle('');
      setContent('');
      setSender('Bagas');
      setRecipient('Anita');
      setStampEmoji('💌');
      setPaperColor('rose');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editLetter, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const letterData: LoveLetter = {
      id: editLetter ? editLetter.id : 'let_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      sender,
      recipient,
      stampEmoji,
      paperColor,
      date,
      isRead: editLetter ? editLetter.isRead : false,
      createdAt: editLetter ? editLetter.createdAt : new Date().toISOString()
    };

    onSuccess(letterData);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-pink-400" />
          <span>{editLetter ? 'Edit Love Letter' : 'Write a Love Letter 💌'}</span>
        </div>
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Sender and Recipient */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              From (Sender)
            </label>
            <select
              value={sender}
              onChange={(e) => {
                const newSender = e.target.value as 'Bagas' | 'Anita';
                setSender(newSender);
                setRecipient(newSender === 'Bagas' ? 'Anita' : 'Bagas');
              }}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900"
            >
              <option value="Bagas">👨‍💼 Bagas</option>
              <option value="Anita">🌷 Anita</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              To (Recipient)
            </label>
            <input
              type="text"
              readOnly
              value={recipient === 'Anita' ? '🌷 Anita' : '👨‍💼 Bagas'}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900/60 opacity-90 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Letter Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., On our 2nd Anniversary, To my sunshine..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Paper styling & Stamp selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Envelope Stamp
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {STAMP_OPTIONS.map((stamp) => (
                <button
                  key={stamp}
                  type="button"
                  onClick={() => setStampEmoji(stamp)}
                  className={`text-lg p-1.5 rounded-xl transition-all cursor-pointer ${
                    stampEmoji === stamp
                      ? 'bg-pink-500/30 border border-pink-400 scale-110'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {stamp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parchment Tone
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {PAPER_COLORS.map((pc) => (
                <button
                  key={pc.id}
                  type="button"
                  onClick={() => setPaperColor(pc.id)}
                  title={pc.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${pc.bg} ${
                    paperColor === pc.id ? 'ring-2 ring-pink-400 scale-110 border-white' : 'border-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Letter Body (Write from the heart)
          </label>
          <textarea
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="My dearest Anita/Bagas,&#10;&#10;Every day spent with you is a blessing..."
            className="w-full px-4 py-3 rounded-2xl glass-input font-handwriting text-lg leading-relaxed resize-none text-rose-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<Send className="w-4 h-4" />}
          >
            {editLetter ? 'Save Changes' : 'Seal & Send Letter'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
