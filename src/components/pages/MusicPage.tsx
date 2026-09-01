import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Music, 
  Play, 
  Pause, 
  Mic, 
  Plus, 
  Trash2, 
  Heart, 
  Calendar, 
  Sparkles, 
  Volume2,
  Radio
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
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
    <div className="space-y-6 pb-28 pt-4 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Soundtrack of Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-white tracking-tight mt-1">
            Audio Memories & Songs 🎵
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Our favorite shared songs, voice recordings, lullabies, and road trip melodies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            onClick={onOpenUpload}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Audio / Voice Note
          </GlassButton>
        </div>
      </div>

      {/* Featured Vinyl Player Hero Card */}
      {activeAudio && (
        <GlassCard className="p-6 sm:p-8 border-purple-500/30 bg-gradient-to-r from-slate-950/90 via-purple-950/40 to-slate-950/90 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {/* Spinning Vinyl Cover */}
            <div className="relative shrink-0">
              <div
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden bg-slate-900 flex items-center justify-center ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '8s' }}
              >
                {activeAudio.coverUrl ? (
                  <img
                    src={activeAudio.coverUrl}
                    alt={activeAudio.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-12 h-12 text-pink-400" />
                )}
                {/* Center vinyl hole */}
                <div className="absolute w-8 h-8 rounded-full bg-slate-950 border-2 border-white/20" />
              </div>
            </div>

            {/* Now Playing Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Now Playing • {activeAudio.type === 'voicenote' ? 'Voice Memo' : 'Song'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
                {activeAudio.title}
              </h2>
              <p className="text-sm text-pink-300">
                {activeAudio.artist || activeAudio.author} • Added by {activeAudio.author}
              </p>
              {activeAudio.description && (
                <p className="text-xs text-slate-300/90 max-w-lg leading-relaxed pt-1">
                  “{activeAudio.description}”
                </p>
              )}

              {/* Waveform Visualizer Animation */}
              <div className="flex items-center justify-center md:justify-start gap-1 py-3">
                {[40, 65, 85, 30, 95, 60, 45, 90, 70, 35, 80, 50, 100, 40, 75, 55, 90, 65, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full transition-all duration-300"
                    style={{
                      height: isPlaying ? `${Math.max(12, (h * (0.6 + Math.sin(i))) % 36)}px` : '6px',
                      opacity: isPlaying ? 0.9 : 0.4
                    }}
                  />
                ))}
              </div>

              <div className="pt-1">
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={onTogglePlay}
                  icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                >
                  {isPlaying ? 'Pause Melody' : 'Play Melody'}
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          ✨ All Audio ({audios.length})
        </button>
        <button
          onClick={() => setFilterType('song')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            filterType === 'song'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          🎵 Songs
        </button>
        <button
          onClick={() => setFilterType('voicenote')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            filterType === 'voicenote'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          🎙️ Voice Notes
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-3">
        {filteredAudios.map((item, index) => {
          const isCurrent = activeAudio?.id === item.id;
          const globalIndex = audios.findIndex((a) => a.id === item.id);

          return (
            <GlassCard
              key={item.id}
              hoverEffect
              className={`p-4 border-white/10 flex items-center justify-between gap-3 group transition-all ${
                isCurrent ? 'bg-purple-950/40 border-purple-500/40' : 'bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => {
                    if (isCurrent) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(globalIndex);
                    }
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    isCurrent && isPlaying
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40 scale-105'
                      : 'bg-white/10 text-pink-300 group-hover:bg-pink-500 group-hover:text-white'
                  }`}
                >
                  {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-pink-200">
                      {item.type === 'voicenote' ? 'Voice Memo' : 'Song'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.artist || item.author} • {item.date}
                  </p>
                </div>
              </div>

              {/* Actions & Delete */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {item.duration || '3:00'}
                </span>

                <button
                  onClick={() => {
                    if (deleteConfirmId === item.id) {
                      onDeleteAudio(item.id);
                      setDeleteConfirmId(null);
                    } else {
                      setDeleteConfirmId(item.id);
                      setTimeout(() => setDeleteConfirmId(null), 3000);
                    }
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    deleteConfirmId === item.id
                      ? 'bg-rose-500 text-white text-xs px-3 font-semibold'
                      : 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10'
                  }`}
                  title="Delete track"
                >
                  {deleteConfirmId === item.id ? 'Delete?' : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
