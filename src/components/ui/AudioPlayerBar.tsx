import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { AudioMemory } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerBarProps {
  tracks: AudioMemory[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  tracks,
  currentTrackIndex,
  onTrackChange,
  isPlaying,
  onTogglePlay
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // browser autoplay restrictions
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setProgress((current / total) * 100);
      setDuration(total);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration > 0) {
      const seekTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleNext = () => {
    onTrackChange((currentTrackIndex + 1) % tracks.length);
  };

  const handlePrev = () => {
    onTrackChange((currentTrackIndex - 1 + tracks.length) % tracks.length);
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        muted={isMuted}
      />

      <div className="fixed top-4 right-4 z-40">
        <AnimatePresence mode="wait">
          {isMinimized ? (
            /* Minimized floating pill */
            <motion.button
              key="mini"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-xl shadow-black/40 hover:border-white/40 transition-all group"
            >
              <div className={`p-1.5 rounded-full ${isPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-white/10 text-pink-300'}`}>
                <Music className="w-3.5 h-3.5" />
              </div>
              <div className="text-left max-w-[120px] sm:max-w-[160px] truncate">
                <span className="text-xs font-medium block truncate text-white">{currentTrack.title}</span>
                <span className="text-[10px] text-pink-300 block truncate">{currentTrack.artist || 'Memories Audio'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
            </motion.button>
          ) : (
            /* Expanded Player Card */
            <motion.div
              key="full"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="w-80 rounded-3xl bg-[#0c0c1e]/90 backdrop-blur-2xl border border-white/20 p-5 shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs text-pink-300 font-medium">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                  <span>Our Melody</span>
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-2xl object-cover border border-white/15"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-300 border border-pink-500/30">
                    <Music className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-pink-300/80 truncate">{currentTrack.artist || currentTrack.author}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onTogglePlay}
                    className="p-2.5 bg-pink-500 text-white rounded-full shadow-lg shadow-pink-500/40 hover:scale-105 transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] text-white/50 font-mono">
                  {currentTrackIndex + 1}/{tracks.length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
