import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, ChevronDown, ChevronUp } from 'lucide-react';
import { AudioMemory } from '../../types';

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
        audioRef.current.play().catch(() => {});
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

      <div className="fixed top-3 right-3 z-40">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131328] border border-slate-700 shadow-md text-slate-200 hover:text-white hover:border-pink-500/40 transition-colors"
          >
            <div className={`p-1 rounded-full ${isPlaying ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Music className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium max-w-[100px] sm:max-w-[140px] truncate">
              {currentTrack.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ) : (
          <div className="w-72 sm:w-80 p-3 rounded-2xl bg-[#131328] border border-slate-700 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-semibold text-white truncate">{currentTrack.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist || currentTrack.author}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-pink-500 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={onTogglePlay}
                  className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-400 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {currentTrack.duration || '3:00'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
