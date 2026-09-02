import React from 'react';
import { 
  Heart, 
  Image as ImageIcon, 
  Mail, 
  StickyNote as StickyNoteIcon, 
  Music, 
  CalendarHeart, 
  UploadCloud, 
  ArrowRight, 
  Sparkles,
  MapPin,
  Clock,
  Pin
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GalleryItem, LoveLetter, StickyNote, AudioMemory } from '../../types';
import { NavTab } from '../ui/FloatingNavBar';

interface HomePageProps {
  gallery: GalleryItem[];
  letters: LoveLetter[];
  notes: StickyNote[];
  audios: AudioMemory[];
  onNavigate: (tab: NavTab) => void;
  onOpenUpload: (type?: 'media' | 'letter' | 'note' | 'audio') => void;
  onSelectLetter: (letter: LoveLetter) => void;
  onSelectMedia: (item: GalleryItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  gallery,
  letters,
  notes,
  audios,
  onNavigate,
  onOpenUpload,
  onSelectLetter,
  onSelectMedia
}) => {
  const favoritePhotos = gallery.filter(g => g.isFavorite).slice(0, 4);
  const recentLetter = letters[0];
  const pinnedNotes = notes.filter(n => n.isPinned).slice(0, 3);
  const featuredAudio = audios[0];

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-800 pb-5 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-pink-400 font-semibold mb-1">
            Our Digital Sanctuary
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif-display text-white tracking-tight">
            Bagas <span className="text-pink-400 font-normal">&</span> Anita
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:text-right">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 block">
              Memories Archive
            </span>
            <span className="text-xs sm:text-sm font-mono text-slate-300">
              Est. 2022 • {gallery.length} Moments
            </span>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => onOpenUpload('media')}
              icon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Upload
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => onOpenUpload('letter')}
              icon={<Mail className="w-3.5 h-3.5 text-pink-300" />}
            >
              Write
            </GlassButton>
          </div>
        </div>
      </header>

      {/* Featured Audio Melody Banner */}
      {featuredAudio && (
        <div className="bg-[#14142b] border border-pink-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-pink-400 font-bold block">
                Featured Melody
              </span>
              <h3 className="text-sm font-semibold text-white">
                {featuredAudio.title} — <span className="text-slate-400 text-xs font-normal">{featuredAudio.artist || featuredAudio.author}</span>
              </h3>
            </div>
          </div>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('music')}
            icon={<ArrowRight className="w-3.5 h-3.5 text-pink-400" />}
          >
            Open Music Box
          </GlassButton>
        </div>
      )}

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('gallery')}
          className="p-4 rounded-2xl bg-[#131328] border border-slate-800 hover:border-pink-500/40 transition-colors text-left group"
        >
          <div className="p-2 w-fit rounded-xl bg-pink-500/15 text-pink-400 mb-3">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Gallery</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{gallery.length} photos & videos</p>
        </button>

        <button
          onClick={() => onNavigate('letters')}
          className="p-4 rounded-2xl bg-[#131328] border border-slate-800 hover:border-rose-500/40 transition-colors text-left group"
        >
          <div className="p-2 w-fit rounded-xl bg-rose-500/15 text-rose-400 mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Love Letters</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{letters.length} saved letters</p>
        </button>

        <button
          onClick={() => onNavigate('notes')}
          className="p-4 rounded-2xl bg-[#131328] border border-slate-800 hover:border-amber-500/40 transition-colors text-left group"
        >
          <div className="p-2 w-fit rounded-xl bg-amber-500/15 text-amber-400 mb-3">
            <StickyNoteIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Sticky Notes</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{notes.length} cute thoughts</p>
        </button>

        <button
          onClick={() => onNavigate('timeline')}
          className="p-4 rounded-2xl bg-[#131328] border border-slate-800 hover:border-purple-500/40 transition-colors text-left group"
        >
          <div className="p-2 w-fit rounded-xl bg-purple-500/15 text-purple-400 mb-3">
            <CalendarHeart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Our Story</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Journey milestones</p>
        </button>
      </div>

      {/* Two Column Layout: Recent Letter & Pinned Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Love Letter Card */}
        <GlassCard className="p-5 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💌</span>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Latest Love Letter
                </span>
              </div>
              <button
                onClick={() => onNavigate('letters')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentLetter ? (
              <div
                onClick={() => onSelectLetter(recentLetter)}
                className="p-4 rounded-xl bg-[#181832] border border-slate-700/60 cursor-pointer hover:border-pink-500/30 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-pink-300">From: {recentLetter.sender}</span>
                  <span>{recentLetter.date}</span>
                </div>
                <h4 className="text-base font-serif-display font-semibold text-white mb-1.5">
                  {recentLetter.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-3 font-light leading-relaxed">
                  {recentLetter.content}
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No love letters yet. Click "Write" to compose one!
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pinned Sticky Notes Card */}
        <GlassCard className="p-5 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📌</span>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Pinned Notes
                </span>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pinnedNotes.length > 0 ? (
              <div className="space-y-2.5">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-[#181832] border border-slate-700/60 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base">{note.emoji || '✨'}</span>
                      <div>
                        <p className="text-xs text-slate-200 leading-relaxed">{note.text}</p>
                        <span className="text-[10px] text-pink-300 font-semibold mt-1 block">
                          — {note.author}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No pinned notes. Pin notes from the Notes tab!
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Favorite Moments Grid Preview */}
      {favoritePhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400/80" /> Favorite Memories
            </h3>
            <button
              onClick={() => onNavigate('gallery')}
              className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
            >
              See all gallery <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {favoritePhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelectMedia(photo)}
                className="group relative rounded-xl overflow-hidden bg-[#181832] border border-slate-800 cursor-pointer aspect-square"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                  <p className="text-xs font-semibold text-white truncate">{photo.title}</p>
                  <span className="text-[10px] text-pink-300">{photo.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
