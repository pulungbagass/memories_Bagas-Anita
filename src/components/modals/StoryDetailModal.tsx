import React from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { 
  Calendar, 
  MapPin, 
  Heart, 
  User, 
  Music, 
  Mail, 
  StickyNote as StickyNoteIcon, 
  Image as ImageIcon, 
  ExternalLink,
  Play,
  Volume2
} from 'lucide-react';
import { UnifiedStoryItem, GalleryItem, LoveLetter, StickyNote, AudioMemory } from '../../types';

interface StoryDetailModalProps {
  item: UnifiedStoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  if (!item) return null;

  const renderContent = () => {
    switch (item.itemType) {
      case 'gallery': {
        const gal = item.rawItem as GalleryItem;
        const isVideo = gal.mediaType === 'video';
        return (
          <div className="space-y-4">
            {/* Media Box */}
            <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 max-h-[60vh] flex items-center justify-center">
              {isVideo ? (
                <video
                  src={gal.url}
                  controls
                  autoPlay
                  className="max-h-[55vh] w-full object-contain rounded-xl"
                />
              ) : (
                <img
                  src={gal.url}
                  alt={gal.title}
                  className="max-h-[55vh] w-full object-contain rounded-xl"
                />
              )}
            </div>

            {/* Metadata & Description */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                      {isVideo ? '🎬 Video Kenangan' : '📸 Foto Galeri'}
                    </span>
                    {gal.isFavorite && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1 border border-rose-500/30">
                        <Heart className="w-3 h-3 fill-rose-400" /> Favorit
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5">{gal.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" /> {gal.date}
                  </span>
                  {gal.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> {gal.location}
                    </span>
                  )}
                </div>
              </div>

              {gal.description && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 leading-relaxed font-light">
                  {gal.description}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-400" /> Diabadikan oleh: <strong className="text-pink-300">{gal.author}</strong>
                </span>
                <span className="text-[11px] text-slate-500">Kategori: {gal.category || 'Momen'}</span>
              </div>
            </div>
          </div>
        );
      }

      case 'letter': {
        const letter = item.rawItem as LoveLetter;
        const paperColorClass = 
          letter.paperColor === 'rose' ? 'bg-[#2a1424] border-rose-500/40 text-rose-100' :
          letter.paperColor === 'lavender' ? 'bg-[#221633] border-purple-500/40 text-purple-100' :
          letter.paperColor === 'amber' ? 'bg-[#2b1f14] border-amber-500/40 text-amber-100' :
          letter.paperColor === 'sky' ? 'bg-[#142333] border-sky-500/40 text-sky-100' :
          'bg-[#192b1e] border-emerald-500/40 text-emerald-100';

        return (
          <div className="space-y-4">
            <div className={`p-6 sm:p-8 rounded-2xl border shadow-2xl relative overflow-hidden ${paperColorClass}`}>
              {/* Wax Seal Stamp */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-3xl sm:text-4xl select-none">
                {letter.stampEmoji || '💌'}
              </div>

              {/* Letter Header */}
              <div className="border-b border-white/10 pb-4 mb-5">
                <div className="text-[11px] uppercase tracking-widest opacity-70 font-mono mb-1">
                  Surat Cinta Khusus • {letter.date}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif-display font-bold tracking-tight">
                  {letter.title}
                </h3>
                <div className="flex items-center gap-2 text-xs opacity-90 mt-2">
                  <span>Dari: <strong>{letter.sender}</strong></span>
                  <span>➔</span>
                  <span>Untuk: <strong>{letter.recipient}</strong></span>
                </div>
              </div>

              {/* Letter Body */}
              <div className="text-sm sm:text-base font-serif-display leading-relaxed whitespace-pre-wrap opacity-95">
                {letter.content}
              </div>

              {/* Letter Signature */}
              <div className="mt-8 pt-4 border-t border-white/10 text-right font-serif-display italic text-sm opacity-80">
                Dengan penuh cinta, {letter.sender} 🤍
              </div>
            </div>
          </div>
        );
      }

      case 'note': {
        const note = item.rawItem as StickyNote;
        const colorStyles = 
          note.color === 'pink' ? 'bg-pink-950/50 border-pink-500/40 text-pink-100' :
          note.color === 'purple' ? 'bg-purple-950/50 border-purple-500/40 text-purple-100' :
          note.color === 'yellow' ? 'bg-amber-950/50 border-amber-500/40 text-amber-100' :
          note.color === 'blue' ? 'bg-sky-950/50 border-sky-500/40 text-sky-100' :
          'bg-emerald-950/50 border-emerald-500/40 text-emerald-100';

        return (
          <div className="space-y-4">
            <div className={`p-6 rounded-2xl border shadow-xl ${colorStyles}`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{note.emoji || '📌'}</span>
                  <span className="text-xs uppercase tracking-wider font-semibold">
                    Catatan dari {note.author}
                  </span>
                </div>
                <span className="text-xs opacity-70 font-mono">{note.date}</span>
              </div>

              <p className="text-base sm:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                {note.text}
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs opacity-70">
                <span>{note.isPinned ? '📌 Catatan Disematkan' : 'Catatan Kenangan'}</span>
                <span>Ditulis oleh: {note.author}</span>
              </div>
            </div>
          </div>
        );
      }

      case 'audio': {
        const audio = item.rawItem as AudioMemory;
        const isEmbed = Boolean(audio.embedUrl);
        const isSpotify = audio.platform === 'spotify' || audio.url.includes('spotify.com');
        const isYouTube = audio.platform === 'youtube' || audio.url.includes('youtube.com') || audio.url.includes('youtu.be');

        return (
          <div className="space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#15132d] border border-purple-500/30 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Music className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                    {audio.platform ? `Platform: ${audio.platform.toUpperCase()}` : 'Soundtrack Kenangan'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{audio.title}</h3>
                  <p className="text-xs text-slate-300 truncate">{audio.artist || audio.author}</p>
                </div>
              </div>

              {/* Player Area */}
              {isSpotify && audio.embedUrl ? (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <iframe
                    src={audio.embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                  />
                </div>
              ) : isYouTube && audio.embedUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10">
                  <iframe
                    src={audio.embedUrl}
                    title={audio.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <audio
                    src={audio.url}
                    controls
                    className="w-full h-10 accent-purple-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Format: {audio.type === 'voicenote' ? 'Voice Memo' : 'Audio Track'}</span>
                    <a
                      href={audio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Buka Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Story Notes */}
              {audio.description && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300">
                  <strong className="text-purple-300 block mb-0.5">Kenangan di balik lagu:</strong>
                  {audio.description}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                <span>Tanggal: {audio.date}</span>
                <span>Diunggah oleh: <strong className="text-purple-300">{audio.author}</strong></span>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-4 rounded-xl bg-white/5 text-sm text-slate-300">
            {item.description}
          </div>
        );
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.emoji}</span>
          <span className="truncate">{item.badge}</span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        {renderContent()}

        <div className="flex justify-end pt-2 border-t border-white/10">
          <GlassButton variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
