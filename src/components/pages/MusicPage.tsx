import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Sparkles, 
  Volume2, 
  ExternalLink,
  Mic,
  Tv,
  Radio,
  SkipBack,
  SkipForward,
  Disc3,
  CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassModal } from '../ui/GlassModal';
import { AudioMemory } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { formatAudioTime } from '../../lib/audioUtils';

interface MusicPageProps {
  audios?: AudioMemory[];
  currentTrackIndex?: number;
  isPlaying?: boolean;
  onPlayTrack?: (index: number) => void;
  onTogglePlay?: () => void;
  onOpenUpload: () => void;
  onDeleteAudio: (id: string) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({
  onOpenUpload,
  onDeleteAudio
}) => {
  const {
    tracks,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isSeeking,
    progressPercent,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    startSeeking,
    seekProgress,
    commitSeek,
    openVideoPlayer,
  } = useAudio();

  const [filterType, setFilterType] = useState<'all' | 'song' | 'voicenote'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredAudios = tracks.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const activeAudio = currentTrack || tracks[0];

  const getPlatformBadge = (audio: AudioMemory) => {
    const url = audio.url || '';
    const isYtMusic = url.includes('music.youtube.com');
    const isYt = url.includes('youtube.com') || url.includes('youtu.be');
    const isSp = url.includes('spotify.com');
    const isTt = url.includes('tiktok.com');
    const isIg = url.includes('instagram.com');
    const isSc = url.includes('soundcloud.com');

    if (isYtMusic) {
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-200 font-semibold border border-red-500/40">YouTube Music</span>;
    }
    if (isYt) {
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">YouTube</span>;
    }
    if (isSp) {
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Spotify</span>;
    }
    if (isTt) {
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">TikTok</span>;
    }
    if (isIg) {
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">Instagram</span>;
    }
    if (isSc) {
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">SoundCloud</span>;
    }
    return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 font-semibold border border-slate-500/30">Direct Audio</span>;
  };

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soundtrack & Suara Kenangan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-0.5">
            Playlist Lagu Kita 🎵
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Mendukung link YouTube, YouTube Music, Spotify, TikTok, Instagram Reel, SoundCloud, dan URL audio.
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={onOpenUpload}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0 shadow-md"
        >
          Tambah Link Lagu
        </GlassButton>
      </div>

      {/* 
        Featured Player Controller Deck:
        100% Synchronized with Floating Audio Player and Global State via AudioContext.
        Contains rotating vinyl visual without mounting duplicate audio streams.
      */}
      {activeAudio && (
        <GlassCard className="p-5 sm:p-7 border-purple-500/40 bg-gradient-to-br from-[#181433]/90 to-[#121026]/90 space-y-5 shadow-xl shadow-purple-950/20">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
            {/* Vinyl Record Visual */}
            <div className="relative shrink-0">
              <div 
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black border-4 border-purple-500/40 shadow-xl flex items-center justify-center relative overflow-hidden transition-all duration-700 ${
                  isPlaying ? 'ring-4 ring-purple-500/30 shadow-purple-600/30' : ''
                }`}
              >
                {/* Vinyl Grooves Texture */}
                <div className="absolute inset-1 rounded-full border border-white/10" />
                <div className="absolute inset-3 rounded-full border border-white/5" />
                <div className="absolute inset-5 rounded-full border border-white/10" />

                {/* Spinning Center Label */}
                <div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-purple-300/60 shadow-inner flex items-center justify-center bg-purple-900 ${
                    isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                  }`}
                >
                  {activeAudio.coverUrl ? (
                    <img 
                      src={activeAudio.coverUrl} 
                      alt={activeAudio.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : activeAudio.type === 'voicenote' ? (
                    <Mic className="w-6 h-6 text-purple-200" />
                  ) : (
                    <Disc3 className="w-7 h-7 text-purple-200" />
                  )}
                </div>

                {/* Center Hole */}
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-white/40 absolute z-10" />
              </div>

              {/* Needle/Tonearm Indicator */}
              <div 
                className={`absolute -top-1 right-1 w-2 h-6 bg-slate-400 rounded-sm origin-top transition-transform duration-500 ${
                  isPlaying ? 'rotate-12 bg-purple-400' : '-rotate-45'
                }`} 
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse text-purple-400" />
                  {activeAudio.type === 'voicenote' ? 'Voice Memo Kenangan' : 'Lagu Sedang Diputar'}
                </span>
                {getPlatformBadge(activeAudio)}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white truncate tracking-tight">
                {activeAudio.title}
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300 truncate">
                {activeAudio.artist || activeAudio.author} {activeAudio.date ? `• ${activeAudio.date}` : ''}
              </p>

              {activeAudio.description && (
                <p className="text-xs text-purple-300/80 italic line-clamp-2 max-w-md">
                  "{activeAudio.description}"
                </p>
              )}
            </div>

            {/* Remote Controller Buttons */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTrack}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full bg-purple-500 text-white hover:bg-purple-400 shadow-lg shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Toggle playback"
                  title={isPlaying ? 'Pause lagu' : 'Putar lagu'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Action: Open Visual Video in Floating Player */}
              <div className="flex items-center gap-2">
                <button
                  onClick={openVideoPlayer}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all hover:scale-102 cursor-pointer shadow-sm"
                  title="Buka pemutar video visual di widget floating"
                >
                  <Tv className="w-3.5 h-3.5 text-purple-400" />
                  <span>Visual Video Player</span>
                </button>

                {activeAudio.url && activeAudio.url.startsWith('http') && (
                  <a
                    href={activeAudio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-white/5 border border-white/5 transition-colors"
                    title="Buka di platform resmi"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Timeline Slidebar Controller Deck (Synchronized 100%) */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-0.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <span>{formatAudioTime(currentTime)}</span>
                <span className="text-slate-600 font-normal">/</span>
                <span className="text-slate-400 font-normal">{formatAudioTime(duration)}</span>
              </div>
              <span className="text-[10px] text-purple-300/80 font-sans">
                {isSeeking ? 'Menggeser timeline...' : isPlaying ? 'Sedang diputar' : 'Dijeda'}
              </span>
            </div>

            <div className="relative flex items-center group py-0.5">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 180}
                step={1}
                value={currentTime}
                onMouseDown={startSeeking}
                onTouchStart={startSeeking}
                onChange={(e) => seekProgress(parseFloat(e.target.value))}
                onMouseUp={(e) => commitSeek(parseFloat((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => commitSeek(parseFloat((e.target as HTMLInputElement).value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 group-hover:h-2.5 transition-all"
                style={{
                  background: `linear-gradient(to right, #a855f7 ${progressPercent}%, #1e1e38 ${progressPercent}%)`
                }}
              />
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-purple-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Satu Sumber Suara Sinkron (Global AudioContext Engine • Bebas Dobel Suara)</span>
            </div>
            <span className="text-slate-400 font-mono">
              Lagu {currentTrackIndex + 1} dari {tracks.length}
            </span>
          </div>
        </GlassCard>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['all', 'song', 'voicenote'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filterType === type
                ? 'bg-purple-500 text-white font-semibold shadow-sm'
                : 'bg-[#14142b] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {type === 'all' ? '✨ Semua Audio' : type === 'song' ? '🎵 Lagu' : '🎙️ Pesan Suara'}
          </button>
        ))}
      </div>

      {/* Audio List */}
      {filteredAudios.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#131328] border border-dashed border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-2xl">
            🎵
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Belum Ada Lagu atau Audio</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Paste link lagu dari YouTube, YouTube Music, Spotify, TikTok, Instagram, atau SoundCloud untuk memulai soundtrack romantis kalian!
            </p>
          </div>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={onOpenUpload}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Lagu Pertama
          </GlassButton>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAudios.map((audio) => {
            const isThisPlaying = isPlaying && tracks[currentTrackIndex]?.id === audio.id;
            return (
              <div
                key={audio.id}
                onClick={() => {
                  const globalIdx = tracks.findIndex((a) => a.id === audio.id);
                  if (globalIdx !== -1) {
                    if (currentTrackIndex === globalIdx) {
                      togglePlay();
                    } else {
                      playTrack(globalIdx);
                    }
                  }
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isThisPlaying
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/30'
                    : 'bg-[#131328] border-slate-800 hover:border-purple-500/30 hover:bg-[#161633]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 ${isThisPlaying ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    {isThisPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{audio.title}</h4>
                      {getPlatformBadge(audio)}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {audio.artist || audio.author} {audio.description ? `• ${audio.description}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {audio.url && audio.url.startsWith('http') && (
                    <a
                      href={audio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-colors"
                      title="Buka link asli"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(audio.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                    title="Hapus lagu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <GlassModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Hapus Lagu / Audio?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Apakah kamu yakin ingin menghapus lagu / audio ini dari playlist? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
            >
              Batal
            </GlassButton>
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => {
                if (deleteConfirmId) {
                  onDeleteAudio(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Hapus
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
