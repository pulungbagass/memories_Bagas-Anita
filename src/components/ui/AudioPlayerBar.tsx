import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';
import { AudioMemory } from '../../types';

interface AudioPlayerBarProps {
  tracks: AudioMemory[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

type CornerPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

// Helper to format seconds to mm:ss
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Helper to extract YouTube ID
export function extractYouTubeId(url: string = ''): string | null {
  const match = url.match(/(?:watch\?v=|embed\/|shorts\/|youtu\.be\/|v=|\/live\/)([\w-]{11})/i);
  return match ? match[1] : null;
}

// Helper to extract Spotify info
export function extractSpotifyInfo(url: string = ''): { type: string; id: string } | null {
  const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (match && match[1] && match[2]) {
    return { type: match[1], id: match[2] };
  }
  return null;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  tracks,
  currentTrackIndex,
  onTrackChange,
  isPlaying,
  onTogglePlay
}) => {
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

  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default 3:00 until loaded
  const [isSeeking, setIsSeeking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showEmbeddedPlayer, setShowEmbeddedPlayer] = useState(false);
  const [dragKey, setDragKey] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const isSeekingRef = useRef(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Keep isSeekingRef in sync
  useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  // Reset time on track change
  useEffect(() => {
    setCurrentTime(0);
    setDuration(180);
    setIsSeeking(false);
  }, [currentTrackIndex]);

  // Listen for external trigger to reveal video visual (e.g. from MusicPage)
  useEffect(() => {
    const handleShowVideo = () => {
      setIsMinimized(false);
      setShowEmbeddedPlayer(true);
    };
    window.addEventListener('bagas_anita_show_video', handleShowVideo);
    return () => window.removeEventListener('bagas_anita_show_video', handleShowVideo);
  }, []);

  // Determine track type & URLs
  const trackMediaInfo = useMemo(() => {
    if (!currentTrack) return { type: 'none' as const };
    const url = currentTrack.url || '';
    const ytId = extractYouTubeId(url) || extractYouTubeId(currentTrack.embedUrl || '');
    if (ytId) {
      return { 
        type: 'youtube' as const, 
        videoId: ytId,
        isYtMusic: url.includes('music.youtube.com'),
        // Clean visual parameters: controls=0 (removes slidebar & buttons), disablekb=1, rel=0, modestbranding=1, iv_load_policy=3, fs=0
        embedUrl: `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
      };
    }

    const spInfo = extractSpotifyInfo(url);
    if (spInfo) {
      return {
        type: 'spotify' as const,
        ...spInfo,
        embedUrl: `https://open.spotify.com/embed/${spInfo.type}/${spInfo.id}?utm_source=generator&theme=0`
      };
    }

    if (url.includes('soundcloud.com')) {
      return {
        type: 'soundcloud' as const,
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7&auto_play=true`
      };
    }

    return { type: 'direct' as const, url };
  }, [currentTrack]);

  // Broadcast time to other components (e.g. MusicPage deck)
  const broadcastTime = (cur: number, dur: number) => {
    window.dispatchEvent(new CustomEvent('bagas_anita_time_sync', {
      detail: { currentTime: cur, duration: dur }
    }));
  };

  // Helper to send postMessage to YouTube iframe
  const sendYtCommand = (func: string, args: any[] = []) => {
    if (ytIframeRef.current?.contentWindow) {
      try {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch {}
    }
  };

  // Handle Direct HTML5 Audio Playback
  useEffect(() => {
    if (trackMediaInfo.type === 'direct' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, trackMediaInfo]);

  // Handle YouTube postMessage control (Play/Pause)
  useEffect(() => {
    if (trackMediaInfo.type === 'youtube') {
      const func = isPlaying ? 'playVideo' : 'pauseVideo';
      sendYtCommand(func);
    }
  }, [isPlaying, trackMediaInfo]);

  // Handle Mute for YouTube
  useEffect(() => {
    if (trackMediaInfo.type === 'youtube') {
      const func = isMuted ? 'mute' : 'unMute';
      sendYtCommand(func);
    }
  }, [isMuted, trackMediaInfo]);

  // Handle direct audio time updates
  const handleAudioTimeUpdate = () => {
    if (audioRef.current && !isSeekingRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
      setCurrentTime(cur);
      broadcastTime(cur, dur || duration);
    }
  };

  // Handle YouTube message listener for accurate currentTime and duration
  useEffect(() => {
    const handleYtMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.currentTime === 'number' && !isSeekingRef.current) {
            setCurrentTime(data.info.currentTime);
            broadcastTime(data.info.currentTime, data.info.duration || duration);
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleYtMessage);
    return () => window.removeEventListener('message', handleYtMessage);
  }, [duration]);

  // Smooth timeline tick when playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isSeeking) {
      interval = setInterval(() => {
        if (trackMediaInfo.type === 'youtube') {
          sendYtCommand('getCurrentTime');
          sendYtCommand('getDuration');
        }
        setCurrentTime((prev) => {
          if (isSeekingRef.current) return prev;
          const maxDur = duration > 0 ? duration : 180;
          const next = Math.min(prev + 0.5, maxDur);
          broadcastTime(next, maxDur);
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isSeeking, duration, trackMediaInfo]);

  // Master Seek Logic (Applies to both YouTube and Direct Audio)
  const executeSeek = (targetSeconds: number) => {
    const maxDur = duration > 0 ? duration : 180;
    const clamped = Math.max(0, Math.min(targetSeconds, maxDur));
    setCurrentTime(clamped);

    if (trackMediaInfo.type === 'direct' && audioRef.current) {
      audioRef.current.currentTime = clamped;
    } else if (trackMediaInfo.type === 'youtube') {
      sendYtCommand('seekTo', [clamped, true]);
      sendYtCommand('playVideo');
    }

    broadcastTime(clamped, maxDur);
  };

  // Listen for seek commands from MusicPage deck
  useEffect(() => {
    const handleExternalSeek = (e: any) => {
      if (typeof e.detail?.targetSeconds === 'number') {
        executeSeek(e.detail.targetSeconds);
      }
    };
    window.addEventListener('bagas_anita_seek_audio', handleExternalSeek);
    return () => window.removeEventListener('bagas_anita_seek_audio', handleExternalSeek);
  }, [duration, trackMediaInfo]);

  const handleNext = () => {
    if (tracks.length > 0) {
      onTrackChange((currentTrackIndex + 1) % tracks.length);
    }
  };

  const handlePrev = () => {
    if (tracks.length > 0) {
      onTrackChange((currentTrackIndex - 1 + tracks.length) % tracks.length);
    }
  };

  // Change Corner and save to localStorage
  const updateCorner = (newCorner: CornerPosition) => {
    setCorner(newCorner);
    setDragKey(prev => prev + 1);
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

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <>
      {/* 1. Direct Audio Element (Only active for direct audio files) */}
      {trackMediaInfo.type === 'direct' && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleNext}
          muted={isMuted}
        />
      )}

      {/* Draggable & Corner Docked Container */}
      <div className={`fixed z-40 pointer-events-none ${getCornerPositionClass()} flex flex-col`}>
        <motion.div
          key={dragKey}
          drag
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

          {isMinimized ? (
            /* Minimized Pill Mode */
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#131328]/95 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-black/40 text-slate-200 hover:border-purple-500/60 transition-all">
              {/* Drag Handle */}
              <div 
                className="pl-1.5 pr-0.5 text-slate-500 hover:text-purple-400 cursor-grab active:cursor-grabbing flex items-center"
                title="Tahan & geser untuk reposisi corner"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* Play/Pause icon button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/40 animate-pulse' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={isPlaying ? 'Pause lagu' : 'Putar lagu'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
              </button>

              {/* Title click to expand */}
              <button
                onClick={() => setIsMinimized(false)}
                className="flex items-center gap-1.5 pr-1.5 text-left cursor-pointer"
              >
                <div className="flex flex-col max-w-[110px] sm:max-w-[170px] truncate">
                  <span className="text-[11px] font-semibold text-white truncate leading-tight">
                    {currentTrack.title}
                  </span>
                  <span className="text-[9px] text-purple-300/80 truncate leading-tight flex items-center gap-1">
                    {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />}
                    {formatTime(currentTime)} • {currentTrack.artist || 'Musik Kenangan'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          ) : (
            /* Expanded Player Widget */
            <div className="w-72 sm:w-80 p-3.5 rounded-2xl bg-[#121226]/95 backdrop-blur-md border border-purple-500/40 shadow-2xl shadow-black/60 space-y-3">
              {/* Top Bar: Drag handle, Corner Switchers, TV Toggle, and Minimize button */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div 
                    className="p-1 text-slate-400 hover:text-purple-300 cursor-grab active:cursor-grabbing flex items-center gap-1"
                    title="Geser bebas & reposisi ke corner"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono text-purple-300 font-medium">Geser</span>
                  </div>

                  {/* Corner Quick-Dock Buttons */}
                  <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/5 gap-0.5">
                    <button
                      onClick={() => updateCorner('top-left')}
                      className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${corner === 'top-left' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-500'}`}
                      title="Corner Kiri Atas"
                    >
                      <ArrowUpLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCorner('top-right')}
                      className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${corner === 'top-right' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-500'}`}
                      title="Corner Kanan Atas"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCorner('bottom-left')}
                      className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${corner === 'bottom-left' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-500'}`}
                      title="Corner Kiri Bawah"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateCorner('bottom-right')}
                      className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${corner === 'bottom-right' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-500'}`}
                      title="Corner Kanan Bawah"
                    >
                      <ArrowDownRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {trackMediaInfo.type === 'youtube' && (
                    <button
                      onClick={() => setShowEmbeddedPlayer(!showEmbeddedPlayer)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showEmbeddedPlayer ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                      title={showEmbeddedPlayer ? 'Tutup visual video' : 'Tampilkan visual video murni'}
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    title="Minimize"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spotify Embed Widget (Single Master) */}
              {trackMediaInfo.type === 'spotify' && (
                <div className="rounded-xl overflow-hidden bg-black w-full border border-emerald-500/30">
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

              {/* SoundCloud Embed Widget (Single Master) */}
              {trackMediaInfo.type === 'soundcloud' && (
                <div className="rounded-xl overflow-hidden bg-black w-full border border-purple-500/30">
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

              {/* Track Info & Artwork */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 overflow-hidden flex items-center justify-center text-purple-300 shrink-0 relative">
                  {currentTrack.coverUrl ? (
                    <img 
                      src={currentTrack.coverUrl} 
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Music className="w-5 h-5" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
                    </div>
                  )}
                </div>

                <div className="truncate flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                    {trackMediaInfo.type === 'youtube' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-semibold shrink-0">
                        {trackMediaInfo.isYtMusic ? 'YT Music' : 'YouTube'}
                      </span>
                    )}
                    {trackMediaInfo.type === 'spotify' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                        Spotify
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {currentTrack.artist || currentTrack.author}
                  </p>
                </div>

                {/* External link to open directly */}
                {currentTrack.url && currentTrack.url.startsWith('http') && (
                  <a
                    href={currentTrack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                    title="Buka di platform asli"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Dedicated Timeline Scrubber Slidebar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono select-none px-0.5">
                  <span className="text-purple-300 font-semibold">{formatTime(currentTime)}</span>
                  <span className="text-slate-500">{formatTime(duration)}</span>
                </div>

                <div className="relative flex items-center group">
                  <input
                    type="range"
                    min={0}
                    max={duration > 0 ? duration : 180}
                    step={1}
                    value={currentTime}
                    onMouseDown={() => setIsSeeking(true)}
                    onTouchStart={() => setIsSeeking(true)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCurrentTime(val);
                    }}
                    onMouseUp={(e) => {
                      setIsSeeking(false);
                      executeSeek(parseFloat((e.target as HTMLInputElement).value));
                    }}
                    onTouchEnd={(e) => {
                      setIsSeeking(false);
                      executeSeek(parseFloat((e.target as HTMLInputElement).value));
                    }}
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
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Lagu sebelumnya"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className="p-2.5 rounded-full bg-purple-500 text-white hover:bg-purple-400 transition-colors shadow-md shadow-purple-500/40 cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNext}
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
