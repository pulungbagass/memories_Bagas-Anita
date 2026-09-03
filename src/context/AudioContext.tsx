import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { AudioMemory } from '../types';
import { extractYouTubeId, extractSpotifyInfo, parseAudioDuration } from '../lib/audioUtils';

export type MediaPlatformType = 'youtube' | 'spotify' | 'soundcloud' | 'direct' | 'none';

export interface TrackMediaInfo {
  type: MediaPlatformType;
  url?: string;
  videoId?: string;
  isYtMusic?: boolean;
  embedUrl?: string;
  spInfo?: { type: string; id: string };
}

interface AudioContextType {
  tracks: AudioMemory[];
  currentTrackIndex: number;
  currentTrack: AudioMemory | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  isSeeking: boolean;
  isMuted: boolean;
  showVideoPlayer: boolean;
  progressPercent: number;
  trackMediaInfo: TrackMediaInfo;
  ytIframeRef: React.RefObject<HTMLIFrameElement | null>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  startSeeking: () => void;
  seekProgress: (seconds: number) => void;
  commitSeek: (seconds: number) => void;
  toggleMute: () => void;
  setShowVideoPlayer: (show: boolean) => void;
  openVideoPlayer: () => void;
  sendYtCommand: (func: string, args?: any[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
  tracks: AudioMemory[];
  initialTrackIndex?: number;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({
  children,
  tracks,
  initialTrackIndex = 0,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(() => {
    return initialTrackIndex >= 0 && initialTrackIndex < tracks.length ? initialTrackIndex : 0;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const isBufferingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const shouldAutoPlayNewTrackRef = useRef<boolean>(false);
  const durationRef = useRef<number>(180);
  const seekTimeoutRef = useRef<any>(null);
  const transitionTimestampRef = useRef<number>(0);

  // Sync isSeekingRef, isBufferingRef, isPlayingRef & durationRef
  useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  useEffect(() => {
    isBufferingRef.current = isBuffering;
  }, [isBuffering]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const activeTrackIdRef = useRef<string | null>(null);

  // Keep reference of current active track ID
  useEffect(() => {
    if (tracks[currentTrackIndex]?.id) {
      activeTrackIdRef.current = tracks[currentTrackIndex].id;
    }
  }, [currentTrackIndex, tracks]);

  // Ensure currentTrackIndex remains pointing to the same active song when tracks array changes (e.g., when adding a new song)
  useEffect(() => {
    if (tracks.length > 0) {
      if (activeTrackIdRef.current) {
        const existingIndex = tracks.findIndex((t) => t.id === activeTrackIdRef.current);
        if (existingIndex !== -1 && existingIndex !== currentTrackIndex) {
          setCurrentTrackIndex(existingIndex);
          return;
        }
      }
      if (currentTrackIndex >= tracks.length) {
        setCurrentTrackIndex(0);
      }
    }
  }, [tracks, currentTrackIndex]);

  const currentTrack = tracks[currentTrackIndex] || tracks[0] || null;

  // Initialize duration from track metadata on track change
  useEffect(() => {
    if (currentTrack?.duration) {
      const parsed = parseAudioDuration(currentTrack.duration);
      if (parsed > 0) {
        setDuration(parsed);
        durationRef.current = parsed;
      }
    }
  }, [currentTrackIndex, currentTrack?.duration]);

  // Track media information & embed URLs
  // CRITICAL: embedUrl MUST be completely static and independent of play/pause state.
  // Changing iframe src causes the browser to reload the entire YouTube player from scratch, resetting currentTime to 0.
  // All play/pause actions are controlled exclusively via postMessage (sendYtCommand).
  const trackMediaInfo = useMemo<TrackMediaInfo>(() => {
    if (!currentTrack) return { type: 'none' };
    const url = currentTrack.url || '';

    const ytId = extractYouTubeId(url) || extractYouTubeId(currentTrack.embedUrl || '');
    if (ytId) {
      const isYtMusic = url.includes('music.youtube.com');
      return {
        type: 'youtube',
        videoId: ytId,
        isYtMusic,
        // Fixed persistent embedUrl with autoplay=0 and enablejsapi=1
        embedUrl: `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`,
      };
    }

    const spInfo = extractSpotifyInfo(url);
    if (spInfo) {
      return {
        type: 'spotify',
        spInfo,
        embedUrl: `https://open.spotify.com/embed/${spInfo.type}/${spInfo.id}?utm_source=generator&theme=0`,
      };
    }

    const scUrl = url.includes('soundcloud.com')
      ? url
      : (currentTrack.embedUrl && currentTrack.embedUrl.includes('soundcloud.com') ? currentTrack.embedUrl : '');
    if (scUrl) {
      return {
        type: 'soundcloud',
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&color=%23a855f7&auto_play=false`,
      };
    }

    return { type: 'direct', url };
  }, [currentTrack?.id, currentTrack?.url, currentTrack?.embedUrl]);

  // Helper to send postMessage to YouTube iframe
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    if (ytIframeRef.current?.contentWindow) {
      try {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch {}
    }
  }, []);

  // Next Track: locks timeline at 0 until new track finishes loading/buffering
  const nextTrack = useCallback(() => {
    if (tracks.length > 0) {
      const willPlay = isPlayingRef.current;
      transitionTimestampRef.current = Date.now();
      shouldAutoPlayNewTrackRef.current = willPlay;

      setCurrentTrackIndex((prev) => {
        const nextIdx = (prev + 1) % tracks.length;
        const dur = parseAudioDuration(tracks[nextIdx]?.duration);
        if (dur > 0) {
          setDuration(dur);
          durationRef.current = dur;
        }
        return nextIdx;
      });
      setCurrentTime(0);
      setIsSeeking(false);
      isSeekingRef.current = false;

      if (willPlay) {
        setIsBuffering(true);
        isBufferingRef.current = true;
      } else {
        setIsBuffering(false);
        isBufferingRef.current = false;
      }
    }
  }, [tracks]);

  // Prev Track: locks timeline at 0 until new track finishes loading/buffering
  const prevTrack = useCallback(() => {
    if (tracks.length > 0) {
      const willPlay = isPlayingRef.current;
      transitionTimestampRef.current = Date.now();
      shouldAutoPlayNewTrackRef.current = willPlay;

      setCurrentTrackIndex((prev) => {
        const prevIdx = (prev - 1 + tracks.length) % tracks.length;
        const dur = parseAudioDuration(tracks[prevIdx]?.duration);
        if (dur > 0) {
          setDuration(dur);
          durationRef.current = dur;
        }
        return prevIdx;
      });
      setCurrentTime(0);
      setIsSeeking(false);
      isSeekingRef.current = false;

      if (willPlay) {
        setIsBuffering(true);
        isBufferingRef.current = true;
      } else {
        setIsBuffering(false);
        isBufferingRef.current = false;
      }
    }
  }, [tracks]);

  // Select Track
  const playTrack = useCallback((index: number) => {
    if (index >= 0 && index < tracks.length) {
      transitionTimestampRef.current = Date.now();
      shouldAutoPlayNewTrackRef.current = true;
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      const dur = parseAudioDuration(tracks[index]?.duration);
      if (dur > 0) {
        setDuration(dur);
        durationRef.current = dur;
      }
      setIsSeeking(false);
      isSeekingRef.current = false;
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsBuffering(true);
      isBufferingRef.current = true;
    }
  }, [tracks]);

  // Global Play
  const play = useCallback(() => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (trackMediaInfo.type === 'direct' && audioRef.current) {
      audioRef.current.play().catch(() => {});
    } else if (trackMediaInfo.type === 'youtube') {
      sendYtCommand('playVideo');
    }
  }, [trackMediaInfo, sendYtCommand]);

  // Global Pause
  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    shouldAutoPlayNewTrackRef.current = false;
    if (trackMediaInfo.type === 'direct' && audioRef.current) {
      audioRef.current.pause();
    } else if (trackMediaInfo.type === 'youtube') {
      sendYtCommand('pauseVideo');
    }
  }, [trackMediaInfo, sendYtCommand]);

  // Global Toggle Play/Pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      isPlayingRef.current = next;
      if (!next) {
        shouldAutoPlayNewTrackRef.current = false;
      }
      if (trackMediaInfo.type === 'direct' && audioRef.current) {
        if (next) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      } else if (trackMediaInfo.type === 'youtube') {
        sendYtCommand(next ? 'playVideo' : 'pauseVideo');
      }
      return next;
    });
  }, [trackMediaInfo, sendYtCommand]);

  // Direct HTML5 Audio Playback sync
  useEffect(() => {
    if (trackMediaInfo.type === 'direct' && audioRef.current) {
      if (isPlaying) {
        setIsBuffering(true);
        isBufferingRef.current = true;
        audioRef.current.play().then(() => {
          setIsBuffering(false);
          isBufferingRef.current = false;
        }).catch(() => {
          setIsBuffering(false);
          isBufferingRef.current = false;
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, trackMediaInfo, currentTrackIndex]);

  // YouTube Play/Pause command sync
  useEffect(() => {
    if (trackMediaInfo.type === 'youtube') {
      sendYtCommand(isPlaying ? 'playVideo' : 'pauseVideo');
    }
  }, [isPlaying, trackMediaInfo, sendYtCommand]);

  // Buffering safety release: prevents UI lockup if an embed never sends playback events
  useEffect(() => {
    if (isBuffering) {
      const timeoutMs = trackMediaInfo.type === 'youtube' ? 8000 : 2500;
      const timer = setTimeout(() => {
        setIsBuffering(false);
        isBufferingRef.current = false;
        shouldAutoPlayNewTrackRef.current = false;
      }, timeoutMs);
      return () => clearTimeout(timer);
    }
  }, [isBuffering, currentTrackIndex, trackMediaInfo.type]);

  // Direct Audio HTML5 Listeners with complete cleanup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || trackMediaInfo.type !== 'direct') return;

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current && !isBufferingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        durationRef.current = audio.duration;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      isBufferingRef.current = false;
      shouldAutoPlayNewTrackRef.current = false;
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      isBufferingRef.current = true;
    };

    const handlePause = () => {
      if (!shouldAutoPlayNewTrackRef.current) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [trackMediaInfo, nextTrack]);

  // YouTube postMessage communication & listener with complete cleanup
  useEffect(() => {
    const handleYtMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && (data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
          // Filter out any stale messages from the previous track during track transitions
          if (Date.now() - transitionTimestampRef.current < 750) {
            return;
          }

          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
            durationRef.current = data.info.duration;
          }

          if (typeof data.info.playerState === 'number') {
            const state = data.info.playerState;
            // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED, -1 = UNSTARTED, 5 = CUED
            if (state === 1) {
              // Crucial Guard: If the app controller is paused and never asked to play, enforce pause!
              if (!isPlayingRef.current && !shouldAutoPlayNewTrackRef.current) {
                sendYtCommand('pauseVideo');
                return;
              }
              // Media is confirmed actively playing! Now unlock timeline
              setIsBuffering(false);
              isBufferingRef.current = false;
              shouldAutoPlayNewTrackRef.current = false;
              setIsPlaying(true);
              isPlayingRef.current = true;
            } else if (state === 3 || state === -1) {
              // Video is buffering/loading, lock timeline at 0 or current position
              if (shouldAutoPlayNewTrackRef.current || isPlayingRef.current) {
                setIsBuffering(true);
                isBufferingRef.current = true;
              }
            } else if (state === 5) {
              // CUED: video is ready
              if (shouldAutoPlayNewTrackRef.current || isPlayingRef.current) {
                sendYtCommand('playVideo');
              }
            } else if (state === 2) {
              // Paused
              if (shouldAutoPlayNewTrackRef.current) {
                // If this is a transition where we intended to play, tell YouTube to play rather than pausing the app
                sendYtCommand('playVideo');
              } else {
                setIsPlaying(false);
                isPlayingRef.current = false;
                setIsBuffering(false);
                isBufferingRef.current = false;
              }
            } else if (state === 0) {
              nextTrack();
            }
          }

          if (typeof data.info.currentTime === 'number' && !isSeekingRef.current) {
            // Update currentTime in sync with YouTube once playback is live
            if (!isBufferingRef.current) {
              setCurrentTime(data.info.currentTime);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleYtMessage);
    return () => {
      window.removeEventListener('message', handleYtMessage);
    };
  }, [nextTrack, sendYtCommand]);

  // YouTube initial handshake on track mount or change
  useEffect(() => {
    if (trackMediaInfo.type === 'youtube') {
      const initYt = () => {
        sendYtCommand('addEventListener', ['onStateChange']);
        if (ytIframeRef.current?.contentWindow) {
          try {
            ytIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'listening' }),
              '*'
            );
          } catch {}
        }
        if (isPlayingRef.current || shouldAutoPlayNewTrackRef.current) {
          sendYtCommand('playVideo');
        } else {
          sendYtCommand('pauseVideo');
        }
      };

      const t1 = setTimeout(initYt, 350);
      const t2 = setTimeout(initYt, 850);
      const t3 = setTimeout(initYt, 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [trackMediaInfo.videoId, sendYtCommand]);

  // Active High-Precision Playback Engine (100% Synchronous Timeline Movement)
  // Ensures the timeline slidebar always advances smoothly in real-time while audio is playing
  // PAUSES execution while media player is buffering or loading new track
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      // DO NOT advance timeline if user is actively seeking OR if media is still buffering/loading!
      if (isSeekingRef.current || isBufferingRef.current) {
        return;
      }

      if (trackMediaInfo.type === 'direct' && audioRef.current && !audioRef.current.paused) {
        // Native HTML5 audio ground truth
        setCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.duration && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
          setDuration(audioRef.current.duration);
          durationRef.current = audioRef.current.duration;
        }
      } else {
        // Smooth real-time progression for YouTube, Spotify, and all embeds
        setCurrentTime((prevTime) => {
          const next = prevTime + deltaSec;
          const maxDur = durationRef.current > 0 ? durationRef.current : 180;
          if (next >= maxDur) {
            // Track completed, proceed to next track
            setTimeout(() => nextTrack(), 50);
            return maxDur;
          }
          return next;
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, trackMediaInfo.type, nextTrack]);

  // Timeline Scrubbing: Start Seeking
  const startSeeking = useCallback(() => {
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    isSeekingRef.current = true;
    setIsSeeking(true);
  }, []);

  // Timeline Scrubbing: Drag/Move Progress (updates UI instantly with zero latency)
  const seekProgress = useCallback((targetSeconds: number) => {
    isSeekingRef.current = true;
    setIsSeeking(true);
    setCurrentTime(targetSeconds);
  }, []);

  // Timeline Scrubbing: Release / Commit Seek
  const commitSeek = useCallback((targetSeconds: number) => {
    const maxDur = durationRef.current > 0 ? durationRef.current : 180;
    const clamped = Math.max(0, Math.min(targetSeconds, maxDur));
    setCurrentTime(clamped);

    if (trackMediaInfo.type === 'direct' && audioRef.current) {
      audioRef.current.currentTime = clamped;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    } else if (trackMediaInfo.type === 'youtube') {
      sendYtCommand('seekTo', [clamped, true]);
      if (isPlaying) {
        sendYtCommand('playVideo');
      }
    }

    // 120ms debounce buffer before accepting background time updates to prevent rewind glitch
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    seekTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
      setIsSeeking(false);
    }, 120);
  }, [trackMediaInfo, isPlaying, sendYtCommand]);

  // Mute / Unmute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      if (trackMediaInfo.type === 'youtube') {
        sendYtCommand(next ? 'mute' : 'unMute');
      }
      return next;
    });
  }, [trackMediaInfo, sendYtCommand]);

  // Open Visual Video player
  const openVideoPlayer = useCallback(() => {
    setShowVideoPlayer(true);
  }, []);

  // Calculate progress percentage
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Context value object memoized
  const value = useMemo<AudioContextType>(() => ({
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
    progressPercent,
    trackMediaInfo,
    ytIframeRef,
    play,
    pause,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    startSeeking,
    seekProgress,
    commitSeek,
    toggleMute,
    setShowVideoPlayer,
    openVideoPlayer,
    sendYtCommand,
  }), [
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
    progressPercent,
    trackMediaInfo,
    play,
    pause,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    startSeeking,
    seekProgress,
    commitSeek,
    toggleMute,
    openVideoPlayer,
    sendYtCommand,
  ]);

  return (
    <AudioContext.Provider value={value}>
      {/* 
        Single Global HTML5 Audio Element:
        Mounted permanently at the root provider to avoid tearing down or duplicate streams
      */}
      {trackMediaInfo.type === 'direct' && currentTrack?.url && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          preload="metadata"
          muted={isMuted}
        />
      )}
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
