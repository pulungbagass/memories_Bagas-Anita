import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Sparkles, 
  Volume2
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

  return (
    <div className="space-y-5 pb-28 pt-2 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soundtrack of Us</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-0.5">
            Audio Memories & Songs 🎵
          </h1>
        </div>

        <GlassButton
          variant="primary"
          onClick={onOpenUpload}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add Audio / Song
        </GlassButton>
      </div>

      {/* Featured Player Card */}
      {activeAudio && (
        <GlassCard className="p-5 sm:p-6 border-purple-500/30 bg-[#16132b]">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Music className="w-10 h-10" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                {activeAudio.type === 'voicenote' ? 'Voice Memo' : 'Featured Song'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">{activeAudio.title}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {activeAudio.artist || activeAudio.author} {activeAudio.dedication ? `• Dedication: ${activeAudio.dedication}` : ''}
              </p>
            </div>

            <button
              onClick={onTogglePlay}
              className="p-4 rounded-full bg-purple-500 text-white hover:bg-purple-400 shadow-md transition-colors"
              aria-label="Toggle playback"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
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
                ? 'bg-purple-500 text-white font-semibold'
                : 'bg-[#14142b] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {type === 'all' ? '✨ All Audio' : type === 'song' ? '🎵 Songs' : '🎙️ Voice Notes'}
          </button>
        ))}
      </div>

      {/* Audio List */}
      {filteredAudios.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#131328] border border-dashed border-slate-800 p-6">
          <div className="text-3xl mb-2">🎵</div>
          <h3 className="text-base font-semibold text-white">No audios found</h3>
          <p className="text-xs text-slate-400 mt-1">Upload a music track or voice recording!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAudios.map((audio, index) => {
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
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isThisPlaying
                    ? 'bg-purple-950/40 border-purple-500/50'
                    : 'bg-[#131328] border-slate-800 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`p-2 rounded-lg ${isThisPlaying ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isThisPlaying ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-semibold text-white truncate">{audio.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{audio.artist || audio.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-mono text-slate-400">{audio.duration || '3:00'}</span>
                  <button
                    onClick={() => setDeleteConfirmId(audio.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                    title="Delete audio"
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
        title="Delete Audio Track?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this track? This action cannot be undone.
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
                  onDeleteAudio(deleteConfirmId);
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
