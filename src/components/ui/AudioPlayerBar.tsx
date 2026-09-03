import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Music, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  GripVertical,
  Tv,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
  Radio,
  Sliders,
  Loader2
} from 'lucide-react';
import { motion, useMotionValue } from 'motion/react';
import { AudioMemory } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { formatAudioTime } from '../../lib/audioUtils';

export interface AudioPlayerBarProps {
  tracks?: AudioMemory[];
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

type CornerPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = () => {
  const {
    tracks,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    isSeeking,
    isMuted,
    showVideoPlayer,
    setShowVideoPlayer,
    progressPercent,
    trackMediaInfo,
    ytIframeRef,
    togglePlay,
    nextTrack,
    prevTrack,
    startSeeking,
    seekProgress,
    commitSeek,
    toggleMute,
    sendYtCommand,
  } = useAudio();

  // Load saved corner from localStorage or default to top-right
  const [corner, setCorner] = useState<CornerPosition>(() => {
    try {
      const saved = localStorage.getItem('bagas_anita_player_corner');
      if (saved === 'top-left' || saved === 'top-right' || saved === 'bottom-left' || saved === 'bottom-right') {
        return saved;
      }
    } catch {}
    return 'top-right';
  });

  const [isMinimized, setIsMinimized] = useState(true);
  const [showEmbeddedPlayer, setShowEmbeddedPlayer] = useState(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Guard against uninvited autoplay on mount (e.g. when entering Dashboard from Explore/WelcomePage)
  useEffect(() => {
    if (!isPlaying) {
      sendYtCommand('pauseVideo');
      const t1 = setTimeout(() => sendYtCommand('pauseVideo'), 250);
      const t2 = setTimeout(() => sendYtCommand('pauseVideo'), 700);
      const t3 = setTimeout(() => sendYtCommand('pauseVideo'), 1400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  // Sync when user requests video visual playback from anywhere (e.g. MusicPage)
  useEffect(() => {
    if (showVideoPlayer) {
      setIsMinimized(false);
      setShowEmbeddedPlayer(true);
    }
  }, [showVideoPlayer]);

  // Listen for legacy external trigger to reveal video visual
  useEffect(() => {
    const handleShowVideo = () => {
      setIsMinimized(false);
      setShowEmbeddedPlayer(true);
      setShowVideoPlayer(true);
    };
    window.addEventListener('bagas_anita_show_video', handleShowVideo);
    return () => window.removeEventListener('bagas_anita_show_video', handleShowVideo);
  }, [setShowVideoPlayer]);

  // Change Corner and save to localStorage
  const updateCorner = (newCorner: CornerPosition) => {
    setCorner(newCorner);
    dragX.set(0);
    dragY.set(0);
    try {
      localStorage.setItem('bagas_anita_player_corner', newCorner);
    } catch {}
  };

  // On Drag End: Calculate nearest corner and snap
  const handleDragEnd = (_: any, info: any) => {
    const x = info.point.x;
    const y = info.point.y;
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    const isLeft = x < windowW / 2;
    const isTop = y < windowH / 2;

    let targetCorner: CornerPosition = 'top-right';
    if (isTop && isLeft) targetCorner = 'top-left';
    else if (isTop && !isLeft) targetCorner = 'top-right';
    else if (!isTop && isLeft) targetCorner = 'bottom-left';
    else targetCorner = 'bottom-right';

    updateCorner(targetCorner);
  };

  if (!currentTrack || tracks.length === 0) return null;

  // Position Styles based on docked corner
  const getCornerPositionClass = () => {
    switch (corner) {
      case 'top-left':
        return 'top-3 left-3 items-start';
      case 'top-right':
        return 'top-3 right-3 items-end';
      case 'bottom-left':
        return 'bottom-20 sm:bottom-6 left-3 items-start';
      case 'bottom-right':
        return 'bottom-20 sm:bottom-6 right-3 items-end';
    }
  };

  return (
    <>
      {/* Draggable & Corner Docked Container */}
      <div className={`fixed z-40 pointer-events-none ${getCornerPositionClass()} flex flex-col`}>
        <motion.div
          drag
          style={{ x: dragX, y: dragY }}
          dragMomentum={false}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
          className="pointer-events-auto touch-none select-none"
        >
          {/* 
            Persistent Single YouTube Video Visual Node:
            Rendered purely as an animated visual canvas.
            - controls=0 in URL: completely removes native YouTube slidebars and play/pause buttons.
            - pointer-events-none: prevents mouse hover from showing title bars or watermark buttons.
            - scale-[1.04]: crops out any 1px edge artifacts.
          */}
          {trackMediaInfo.type === 'youtube' && (
            <div
              className={
                showEmbeddedPlayer && !isMinimized
                  ? 'mb-2.5 rounded-2xl overflow-hidden bg-black aspect-video w-72 sm:w-80 border border-purple-500/50 shadow-2xl relative select-none'
                  : 'fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none opacity-0'
              }
            >
              <iframe
                ref={ytIframeRef}
                src={trackMediaInfo.embedUrl}
                title="Pure Visual Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={() => {
                  if (ytIframeRef.current?.contentWindow) {
                    try {
                      ytIframeRef.current.contentWindow.postMessage(
                        JSON.stringify({ event: 'listening' }),
                        '*'
                      );
                    } catch {}
                  }
                  if (isPlaying) {
                    sendYtCommand('playVideo');
                  } else {
                    sendYtCommand('pauseVideo');
                  }
                }}
                className={
                  showEmbeddedPlayer && !isMinimized 
                    ? 'w-full h-full pointer-events-none scale-[1.04] object-cover select-none' 
                    : 'w-1 h-1'
                }
              />
              {/* Subtle top indicator confirming pure visual playback */}
              {showEmbeddedPlayer && !isMinimized && (
                <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] text-purple-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span>Visual Video</span>
                </div>
              )}
            </div>
          )}

          {/* Spotify Persistent Master */}
          {trackMediaInfo.type === 'spotify' && (
            <div
              className={
                !isMinimized
                  ? 'mb-2.5 rounded-xl overflow-hidden bg-black w-72 sm:w-80 border border-emerald-500/30 shadow-lg'
                  : 'fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none opacity-0'
              }
            >
              <iframe
                src={trackMediaInfo.embedUrl}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Master Player"
              />
            </div>
          )}

          {/* SoundCloud Persistent Master */}
          {trackMediaInfo.type === 'soundcloud' && (
            <div
              className={
                !isMinimized
                  ? 'mb-2.5 rounded-xl overflow-hidden bg-black w-72 sm:w-80 border border-purple-500/30 shadow-lg'
                  : 'fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none opacity-0'
              }
            >
              <iframe
                src={trackMediaInfo.embedUrl}
                width="100%"
                height="100"
                allow="autoplay"
                loading="lazy"
                title="SoundCloud Master Player"
              />
            </div>
          )}

          {/* Main Floating Glass Widget */}
          {isMinimized ? (
            /* Minimized Dynamic Floating Pill */
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#131326]/90 backdrop-blur-md border border-purple-500/40 shadow-xl text-xs text-white max-w-xs transition-all hover:border-purple-400/60">
              <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200">
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* Spinning Disc Indicator */}
              <div 
                className={`w-6 h-6 rounded-full bg-purple-900 border border-purple-400/50 flex items-center justify-center shrink-0 overflow-hidden ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                }`}
              >
                {currentTrack.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-3 h-3 text-purple-300" />
                )}
              </div>

              {/* Title & Scrubbing indicator */}
              <div className="flex flex-col min-w-0 max-w-[110px] sm:max-w-[140px]">
                <span className="truncate font-medium text-[11px] leading-tight text-purple-100">
                  {currentTrack.title}
                </span>
                <span className="text-[9px] text-purple-300/70 truncate flex items-center gap-1 font-mono">
                  {isBuffering && isPlaying ? (
                    <span className="text-purple-300 flex items-center gap-1 font-sans">
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400" />
                      <span>Memuat...</span>
                    </span>
                  ) : (
                    `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`
                  )}
                </span>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-1.5 rounded-full bg-purple-500 text-white hover:bg-purple-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                title={isPlaying ? (isBuffering ? 'Memuat audio...' : 'Pause') : 'Play'}
              >
                {isPlaying ? (
                  isBuffering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>

              {/* Expand Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Buka Controller & Slidebar"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Expanded Full Controller Floating Card */
            <div className="w-72 sm:w-80 rounded-2xl bg-[#131326]/95 backdrop-blur-md border border-purple-500/40 p-3.5 shadow-2xl space-y-2.5 text-white">
              {/* Card Header with Drag Handle & Corner Dock Buttons */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs">
                <div className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-slate-300 font-medium">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                    Floating Master Player
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Corner Snap Selector */}
                  <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
                    <button
                      onClick={() => updateCorner('top-left')}
                      className={`p-1 rounded hover:bg-white/10 ${corner === 'top-left' ? 'text-purple-400 bg-white/15' : 'text-slate-400'}`}
                      title="Dock ke Kiri Atas"
                    >
                      <ArrowUpLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCorner('top-right')}
                      className={`p-1 rounded hover:bg-white/10 ${corner === 'top-right' ? 'text-purple-400 bg-white/15' : 'text-slate-400'}`}
                      title="Dock ke Kanan Atas"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCorner('bottom-left')}
                      className={`p-1 rounded hover:bg-white/10 ${corner === 'bottom-left' ? 'text-purple-400 bg-white/15' : 'text-slate-400'}`}
                      title="Dock ke Kiri Bawah"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCorner('bottom-right')}
                      className={`p-1 rounded hover:bg-white/10 ${corner === 'bottom-right' ? 'text-purple-400 bg-white/15' : 'text-slate-400'}`}
                      title="Dock ke Kanan Bawah"
                    >
                      <ArrowDownRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Minimize Button */}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Kecilkan widget"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Track Info Display */}
              <div className="flex items-center gap-2.5">
                <div 
                  className={`w-11 h-11 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center shrink-0 overflow-hidden ${
                    isPlaying ? 'shadow-md shadow-purple-500/30' : ''
                  }`}
                >
                  {currentTrack.coverUrl ? (
                    <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-5 h-5 text-purple-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate leading-tight">
                    {currentTrack.title}
                  </h4>
                  <p className="text-[10px] text-slate-300 truncate">
                    {currentTrack.artist || currentTrack.author}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                      {trackMediaInfo.type.toUpperCase()}
                    </span>
                    {currentTrack.url && currentTrack.url.startsWith('http') && (
                      <a
                        href={currentTrack.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-slate-400 hover:text-purple-300 flex items-center gap-0.5"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Video Visual Toggle Button for YouTube */}
                {trackMediaInfo.type === 'youtube' && (
                  <button
                    onClick={() => setShowEmbeddedPlayer(!showEmbeddedPlayer)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      showEmbeddedPlayer 
                        ? 'bg-purple-600/40 border-purple-400 text-purple-200' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={showEmbeddedPlayer ? 'Sembunyikan Visual Video' : 'Tampilkan Visual Video'}
                  >
                    <Tv className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dedicated Timeline Scrubber Slidebar (100% Synchronized) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono select-none px-0.5">
                  <span className="text-purple-300 font-semibold flex items-center gap-1">
                    {isBuffering && isPlaying ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                        <span className="text-purple-300 font-sans">Memuat trek...</span>
                      </>
                    ) : (
                      formatAudioTime(currentTime)
                    )}
                  </span>
                  <span className="text-slate-500">
                    {isSeeking ? 'Scrubbing...' : formatAudioTime(duration)}
                  </span>
                </div>

                <div className="relative flex items-center group">
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
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 group-hover:h-2 transition-all"
                    style={{
                      background: `linear-gradient(to right, #a855f7 ${progressPercent}%, #1e1e38 ${progressPercent}%)`
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTrack}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Lagu sebelumnya"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-purple-500 text-white hover:bg-purple-400 transition-colors shadow-md shadow-purple-500/40 cursor-pointer"
                    title={isPlaying ? (isBuffering ? 'Memuat audio...' : 'Pause') : 'Play'}
                  >
                    {isPlaying ? (
                      isBuffering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Lagu berikutnya"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] font-mono text-purple-300/80">
                  {currentTrackIndex + 1}/{tracks.length}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};
