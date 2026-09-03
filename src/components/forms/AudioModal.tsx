import React, { useState, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { 
  Music, 
  Link as LinkIcon, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Headphones,
  Mic,
  ExternalLink
} from 'lucide-react';
import { AuthorType, AudioMemory } from '../../types';
import { fetchMediaMetadataClientSide } from '../../lib/audioUtils';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (audio: AudioMemory) => void;
}

export const AudioModal: React.FC<AudioModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [audioType, setAudioType] = useState<'song' | 'voicenote'>('song');

  // Form Fields
  const [urlInput, setUrlInput] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataSuccess, setMetadataSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState<AuthorType>('Together');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setAudioType('song');
    setUrlInput('');
    setDetectedPlatform('');
    setIsLoadingMetadata(false);
    setMetadataSuccess(false);
    setTitle('');
    setArtist('');
    setCoverUrl('');
    setEmbedUrl('');
    setDescription('');
    setAuthor('Together');
    setErrorMsg(null);
    setIsSubmitting(false);
  };

  // Helper to extract YouTube videoId
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:watch\?v=|embed\/|shorts\/|youtu\.be\/|v=|\/live\/)([\w-]{11})/i);
    return match ? match[1] : '';
  };

  // Live Auto-fetch metadata when URL is pasted / typed
  useEffect(() => {
    const trimmed = urlInput.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      setDetectedPlatform('');
      setMetadataSuccess(false);
      return;
    }

    // Identify Platform
    const isYt = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');
    const isYtMusic = trimmed.includes('music.youtube.com');
    const isSp = trimmed.includes('spotify.com');
    const isTt = trimmed.includes('tiktok.com');
    const isIg = trimmed.includes('instagram.com');
    const isSc = trimmed.includes('soundcloud.com');

    if (isYtMusic) {
      setDetectedPlatform('YouTube Music');
    } else if (isYt) {
      setDetectedPlatform('YouTube');
    } else if (isSp) {
      setDetectedPlatform('Spotify');
    } else if (isTt) {
      setDetectedPlatform('TikTok');
    } else if (isIg) {
      setDetectedPlatform('Instagram');
    } else if (isSc) {
      setDetectedPlatform('SoundCloud');
    } else {
      setDetectedPlatform('Direct Audio / Stream');
    }

    // Client-side quick embeds & covers before API returns
    if (isYt || isYtMusic) {
      const vid = getYouTubeVideoId(trimmed);
      if (vid) {
        setEmbedUrl(`https://www.youtube.com/embed/${vid}?autoplay=0&enablejsapi=1`);
        if (!coverUrl) {
          setCoverUrl(`https://img.youtube.com/vi/${vid}/hqdefault.jpg`);
        }
      }
    } else if (isSp) {
      const spMatch = trimmed.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
      if (spMatch) {
        setEmbedUrl(`https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator`);
      }
    } else if (isSc) {
      setEmbedUrl(`https://w.soundcloud.com/player/?url=${encodeURIComponent(trimmed)}&color=%23a855f7&auto_play=false`);
    }

    // Debounce metadata fetch from server, with instant client-side oEmbed fallback
    const timeout = setTimeout(async () => {
      setIsLoadingMetadata(true);
      let resolved = false;

      // 1. Try server-side metadata endpoint (works in Vercel serverless and local Express)
      try {
        const res = await fetch(`/api/media-info?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            if (data.title && (!title || title.trim() === '')) {
              setTitle(data.title);
            }
            if (data.artist && (!artist || artist.trim() === '' || artist === 'YouTube Creator')) {
              setArtist(data.artist);
            }
            if (data.thumbnailUrl && !coverUrl) {
              setCoverUrl(data.thumbnailUrl);
            }
            if (data.embedUrl) {
              setEmbedUrl(data.embedUrl);
            }
            setMetadataSuccess(true);
            resolved = true;
          }
        }
      } catch {
        // Fallback to client-side extraction below
      }

      // 2. Client-side fallback if server didn't resolve (e.g. CORS oEmbed)
      if (!resolved) {
        try {
          const clientData = await fetchMediaMetadataClientSide(trimmed);
          if (clientData) {
            if (clientData.title && (!title || title.trim() === '')) {
              setTitle(clientData.title);
            }
            if (clientData.artist && (!artist || artist.trim() === '' || artist === 'YouTube Creator')) {
              setArtist(clientData.artist);
            }
            if (clientData.thumbnailUrl && !coverUrl) {
              setCoverUrl(clientData.thumbnailUrl);
            }
            if (clientData.embedUrl) {
              setEmbedUrl(clientData.embedUrl);
            }
            setMetadataSuccess(true);
          }
        } catch {}
      }

      setIsLoadingMetadata(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [urlInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = urlInput.trim();

    if (!finalUrl) {
      setErrorMsg('Harap masukkan URL / link lagu.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Harap masukkan judul lagu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let platformType: AudioMemory['platform'] = 'direct';
      let generatedEmbed = embedUrl;

      if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
        platformType = 'youtube';
        const vid = getYouTubeVideoId(finalUrl);
        if (vid) {
          generatedEmbed = `https://www.youtube.com/embed/${vid}?autoplay=0&enablejsapi=1`;
        }
      } else if (finalUrl.includes('spotify.com')) {
        platformType = 'spotify';
        const spMatch = finalUrl.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
        if (spMatch) {
          generatedEmbed = `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator`;
        }
      } else if (finalUrl.includes('tiktok.com')) {
        platformType = 'tiktok';
      } else if (finalUrl.includes('instagram.com')) {
        platformType = 'instagram';
      } else if (finalUrl.includes('soundcloud.com')) {
        platformType = 'soundcloud';
        generatedEmbed = `https://w.soundcloud.com/player/?url=${encodeURIComponent(finalUrl)}&color=%23a855f7&auto_play=false`;
      }

      const newAudio: AudioMemory = {
        id: 'aud_' + Date.now(),
        title: title.trim(),
        artist: artist.trim() || (audioType === 'voicenote' ? author : (detectedPlatform || 'Lagu Bersama')),
        url: finalUrl,
        duration: '3:00',
        author,
        type: audioType,
        platform: platformType,
        embedUrl: generatedEmbed || undefined,
        date: new Date().toISOString().split('T')[0],
        coverUrl: coverUrl.trim() || undefined,
        description: description.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      onSuccess(newAudio);
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan link lagu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-400" />
          <span>Tambah Musik & Audio Link 🎵</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Audio Type Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAudioType('song')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              audioType === 'song'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Lagu Romantis
          </button>
          <button
            type="button"
            onClick={() => setAudioType('voicenote')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              audioType === 'voicenote'
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Voice Memo
          </button>
        </div>

        {/* Link Input Section */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#14142b] border border-purple-500/30">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Link Lagu / Platform Audio *
            </label>
            {detectedPlatform && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-semibold flex items-center gap-1 border border-purple-500/40">
                <Sparkles className="w-3 h-3 text-purple-300" />
                {detectedPlatform}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste link YouTube, YouTube Music, Spotify, TikTok, IG, atau SoundCloud..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 pr-10"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {isLoadingMetadata ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : metadataSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <LinkIcon className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            Mendukung penuh <strong className="text-purple-300">YouTube, YouTube Music, Spotify, TikTok, Instagram Reel, SoundCloud</strong>, dan URL audio langsung (.mp3). Hemat ruang penyimpanan & bebas batas kuota file!
          </div>

          {metadataSuccess && (
            <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Informasi judul dan artis berhasil dimuat otomatis!</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Title & Artist fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Judul Lagu / Audio *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sampai Jadi Debu, Perfect..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nama Artis / Penyanyi
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Banda Neira, Ed Sheeran..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Dedicated By / Author */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Didedikasikan Oleh
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value as AuthorType)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm bg-slate-900 text-white"
          >
            <option value="Together">🤍 Bagas & Anita (Bersama)</option>
            <option value="Bagas">👨 Bagas</option>
            <option value="Anita">👩 Anita</option>
          </select>
        </div>

        {/* Notes / Story Behind This Track */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Catatan / Kenangan di Balik Lagu Ini
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mengapa lagu ini sangat berarti untuk kita?..."
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Batal
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={<Music className="w-4 h-4" />}
          >
            Simpan Lagu
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
