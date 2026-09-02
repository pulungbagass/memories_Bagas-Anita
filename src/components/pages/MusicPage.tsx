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
  Radio,
  Mic
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassModal } from '../ui/GlassModal';
import { AudioMemory } from '../../types';

interface MusicPageProps {
  audios: AudioMemory[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onPlayTrack: (index: number) => void;
  onTogglePlay: () => void;
  onOpenUpload: () => void;
  onDeleteAudio: (id: string) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({
  audios,
  currentTrackIndex,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onOpenUpload,
  onDeleteAudio
}) => {
  const [filterType, setFilterType] = useState<'all' | 'song' | 'voicenote'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredAudios = audios.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const activeAudio = audios[currentTrackIndex] || audios[0];

  const getPlatformBadge = (audio: AudioMemory) => {
    const p = audio.platform || (
      audio.url.includes('youtube.com') || audio.url.includes('youtu.be') ? 'youtube' :
      audio.url.includes('spotify.com') ? 'spotify' :
      audio.url.includes('tiktok.com') ? 'tiktok' :
      audio.url.includes('instagram.com') ? 'instagram' : 'direct'
    );

    switch (p) {
      case 'youtube':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">YouTube</span>;
      case 'spotify':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Spotify</span>;
      case 'tiktok':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">TikTok</span>;
      case 'instagram':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">Instagram</span>;
      case 'upload':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">Storage</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 font-semibold border border-slate-500/30">Audio</span>;
    }
  };

  return (
    <div className="space-y-5 pb-28 pt-2 max-w-4xl mx-auto px-4 sm:px-6">
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
            Simpan lagu favorit dari YouTube, Spotify, TikTok, atau unggah rekaman suara langsung.
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={onOpenUpload}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0 shadow-md"
        >
          Tambah Musik / Link
        </GlassButton>
      </div>

      {/* Featured Player Card */}
      {activeAudio && (
        <GlassCard className="p-5 sm:p-6 border-purple-500/30 bg-[#16132b]">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              {activeAudio.type === 'voicenote' ? <Mic className="w-8 h-8" /> : <Music className="w-8 h-8" />}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                  {activeAudio.type === 'voicenote' ? 'Voice Memo' : 'Lagu Diputar'}
                </span>
                {getPlatformBadge(activeAudio)}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">{activeAudio.title}</h3>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {activeAudio.artist || activeAudio.author} {activeAudio.date ? `• ${activeAudio.date}` : ''}
              </p>
              {activeAudio.description && (
                <p className="text-xs text-purple-300/80 mt-1 italic line-clamp-1">
                  "{activeAudio.description}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onTogglePlay}
                className="p-3.5 rounded-full bg-purple-500 text-white hover:bg-purple-400 shadow-md transition-all cursor-pointer"
                aria-label="Toggle playback"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
            </div>
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
              Paste link lagu dari YouTube, Spotify, TikTok, Instagram atau upload file audio untuk memulai soundtrack romantis kalian!
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
            const isThisPlaying = isPlaying && audios[currentTrackIndex]?.id === audio.id;
            return (
              <div
                key={audio.id}
                onClick={() => {
                  const globalIdx = audios.findIndex((a) => a.id === audio.id);
                  if (globalIdx !== -1) {
                    if (currentTrackIndex === globalIdx) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(globalIdx);
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
                  <div className={`p-2 rounded-lg shrink-0 ${isThisPlaying ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isThisPlaying ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
                      className="p-1 text-slate-400 hover:text-purple-300 transition-colors"
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
