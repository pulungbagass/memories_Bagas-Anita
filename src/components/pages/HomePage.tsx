import React from 'react';
import { motion } from 'motion/react';
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
  Quote,
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
    <div className="space-y-8 pb-32 pt-4 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Immersive UI Sanctuary Header Banner */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-6 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-pink-300/70 font-semibold mb-1">
            Our Digital Sanctuary
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white font-serif-display">
            Bagas <span className="text-pink-400 font-normal">&</span> Anita
          </h1>
        </div>
        <div className="flex items-center gap-4 sm:text-right">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-white/40 block">
              Memories Archive
            </span>
            <span className="text-xs sm:text-sm font-mono text-white/70">
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

      {/* Featured Audio Voice/Song Ambient Banner */}
      {featuredAudio && (
        <div className="bg-pink-500/10 backdrop-blur-2xl border border-pink-500/20 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0">
              <Music className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-pink-300/80 font-bold block mb-0.5">
                Featured Melody / Audio
              </span>
              <h3 className="text-base sm:text-lg font-medium text-white">{featuredAudio.title}</h3>
              <p className="text-xs text-white/60">{featuredAudio.artist || featuredAudio.author} • {featuredAudio.date}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('music')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-all cursor-pointer"
          >
            <span>Open Melodies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Stats Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('gallery')}
          className="text-left cursor-pointer group"
        >
          <GlassCard hoverEffect className="p-5 sm:p-6 flex flex-col items-center justify-center text-center border-white/10">
            <div className="w-12 h-12 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif-display">{gallery.length}</div>
            <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium mt-1">Moments</div>
          </GlassCard>
        </button>

        <button
          onClick={() => onNavigate('letters')}
          className="text-left cursor-pointer group"
        >
          <GlassCard hoverEffect className="p-5 sm:p-6 flex flex-col items-center justify-center text-center border-white/10">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif-display">{letters.length}</div>
            <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium mt-1">Love Letters</div>
          </GlassCard>
        </button>

        <button
          onClick={() => onNavigate('notes')}
          className="text-left cursor-pointer group"
        >
          <GlassCard hoverEffect className="p-5 sm:p-6 flex flex-col items-center justify-center text-center border-white/10">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <StickyNoteIcon className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif-display">{notes.length}</div>
            <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium mt-1">Sticky Notes</div>
          </GlassCard>
        </button>

        <button
          onClick={() => onNavigate('music')}
          className="text-left cursor-pointer group"
        >
          <GlassCard hoverEffect className="p-5 sm:p-6 flex flex-col items-center justify-center text-center border-white/10">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif-display">{audios.length}</div>
            <div className="text-[11px] uppercase tracking-wider text-white/50 font-medium mt-1">Melodies</div>
          </GlassCard>
        </button>
      </div>

      {/* Featured Moments Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <h2 className="text-lg sm:text-xl font-light text-white tracking-wide font-serif-display">
              Featured Moments 📸
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs text-pink-300 hover:text-pink-200 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(favoritePhotos.length > 0 ? favoritePhotos : gallery.slice(0, 4)).map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              onClick={() => onSelectMedia(item)}
              className="cursor-pointer group"
            >
              <GlassCard className="overflow-hidden border-white/10 group-hover:border-pink-500/40 transition-all h-full flex flex-col rounded-3xl">
                <div className="relative aspect-4/3 overflow-hidden bg-black/40">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-pink-200 border border-white/10">
                    {item.author}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-white/50 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-pink-400" /> {item.date}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1 truncate max-w-[110px]">
                        <MapPin className="w-3 h-3 text-pink-400" /> {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Letter + Pinned Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Love Letter Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-400" />
              <h2 className="text-lg font-light text-white font-serif-display">Latest Love Letter 💌</h2>
            </div>
            <button
              onClick={() => onNavigate('letters')}
              className="text-xs text-rose-300 hover:underline cursor-pointer"
            >
              All Letters
            </button>
          </div>

          {recentLetter ? (
            <GlassCard
              hoverEffect
              onClick={() => onSelectLetter(recentLetter)}
              className="p-6 sm:p-8 border-white/10 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              <div className="opacity-10 absolute top-2 right-4 text-7xl font-serif italic select-none pointer-events-none">
                “
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mb-3">
                  From {recentLetter.sender} to {recentLetter.recipient} • {recentLetter.date}
                </p>
                <h3 className="text-base font-bold text-white mb-2">{recentLetter.title}</h3>
                <p className="text-white/90 text-sm sm:text-base font-serif italic line-clamp-3 leading-relaxed">
                  "{recentLetter.content}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-pink-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">{recentLetter.stampEmoji || '💌'}</span> Read full keepsake
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 text-center text-white/50 text-sm">
              No letters yet. Write your first letter!
            </GlassCard>
          )}
        </div>

        {/* Pinned Sticky Notes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-light text-white font-serif-display">Pinned Notes 📌</h2>
            </div>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs text-amber-300 hover:underline cursor-pointer"
            >
              View Board
            </button>
          </div>

          <div className="space-y-2.5">
            {pinnedNotes.length > 0 ? (
              pinnedNotes.map((note) => (
                <GlassCard
                  key={note.id}
                  hoverEffect
                  onClick={() => onNavigate('notes')}
                  className="p-4 sm:p-5 border-white/10 cursor-pointer flex items-start gap-3.5"
                >
                  <span className="text-2xl shrink-0">{note.emoji || '✨'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90">{note.text}</p>
                    <div className="flex items-center justify-between text-[11px] text-white/40 mt-2">
                      <span className="text-pink-300">By {note.author}</span>
                      <span>{note.date}</span>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-6 text-center text-white/50 text-sm">
                No pinned notes yet.
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
