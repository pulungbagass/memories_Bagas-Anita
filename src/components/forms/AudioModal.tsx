import React, { useState, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { 
  Music, 
  UploadCloud, 
  Link as LinkIcon, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Headphones,
  Mic
} from 'lucide-react';
import { AuthorType, AudioMemory } from '../../types';
import { uploadMediaToVercelBlob, DebugErrorLog } from '../../lib/vercelClient';
import { DiagnosticInspector } from '../ui/DiagnosticInspector';

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
  // Mode: 'link' (YouTube, Spotify, TikTok, Instagram) or 'upload' (File from storage)
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
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

  // File Upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<DebugErrorLog | null>(null);

  const resetForm = () => {
    setInputMode('link');
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
    setFile(null);
    setErrorMsg(null);
    setDebugError(null);
    setIsUploading(false);
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
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      setDetectedPlatform('YouTube');
    } else if (trimmed.includes('spotify.com')) {
      setDetectedPlatform('Spotify');
    } else if (trimmed.includes('tiktok.com')) {
      setDetectedPlatform('TikTok');
    } else if (trimmed.includes('instagram.com')) {
      setDetectedPlatform('Instagram');
    } else if (trimmed.includes('soundcloud.com')) {
      setDetectedPlatform('SoundCloud');
    } else {
      setDetectedPlatform('Web Audio');
    }

    // Debounce metadata fetch
    const timeout = setTimeout(async () => {
      setIsLoadingMetadata(true);
      try {
        const res = await fetch(`/api/media-info?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title && !title) {
            setTitle(data.title);
          } else if (data.title && title === '') {
            setTitle(data.title);
          }

          if (data.artist && (!artist || artist === 'Shared Playlist')) {
            setArtist(data.artist);
          }

          if (data.thumbnailUrl) {
            setCoverUrl(data.thumbnailUrl);
          }
          if (data.embedUrl) {
            setEmbedUrl(data.embedUrl);
          }

          setMetadataSuccess(true);
        }
      } catch {
        // Silent fallback
      } finally {
        setIsLoadingMetadata(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [urlInput]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/') && !selectedFile.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setErrorMsg('Pilih file audio yang valid (.mp3, .wav, .m4a, .ogg).');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg('Ukuran file audio melebihi batas 50MB.');
      return;
    }
    setFile(selectedFile);
    setErrorMsg(null);
    setDebugError(null);

    // Auto populate title from file name if blank
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Harap masukkan judul lagu atau rekaman.');
      return;
    }

    if (inputMode === 'link' && !urlInput.trim()) {
      setErrorMsg('Harap masukkan link URL lagu / media.');
      return;
    }

    if (inputMode === 'upload' && !file) {
      setErrorMsg('Harap pilih file audio dari penyimpanan.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setDebugError(null);

    try {
      let finalUrl = urlInput.trim();

      if (inputMode === 'upload' && file) {
        const uploadRes = await uploadMediaToVercelBlob(file, author, 'Audio');
        finalUrl = uploadRes.url;
      }

      let platformType: AudioMemory['platform'] = 'direct';
      if (inputMode === 'upload') {
        platformType = 'upload';
      } else if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
        platformType = 'youtube';
      } else if (finalUrl.includes('spotify.com')) {
        platformType = 'spotify';
      } else if (finalUrl.includes('tiktok.com')) {
        platformType = 'tiktok';
      } else if (finalUrl.includes('instagram.com')) {
        platformType = 'instagram';
      } else if (finalUrl.includes('soundcloud.com')) {
        platformType = 'soundcloud';
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
        embedUrl: embedUrl || undefined,
        date: new Date().toISOString().split('T')[0],
        coverUrl: coverUrl.trim() || undefined,
        description: description.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      onSuccess(newAudio);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Audio upload error:', err);
      setErrorMsg(err.message || 'Gagal menyimpan lagu / audio');
      setDebugError({
        endpoint: err.endpoint || '/api/upload',
        httpStatus: err.httpStatus || 500,
        message: err.message || 'Failed to process audio',
        timestamp: err.timestamp || new Date().toISOString(),
        details: err.details || { error: String(err) },
        suggestions: [
          'Pastikan link URL valid (YouTube, Spotify, TikTok, IG, atau MP3 langsung).',
          'Jika upload file, pastikan file berukuran di bawah 50MB.'
        ]
      });
    } finally {
      setIsUploading(false);
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
          <span>Tambah Musik & Audio 🎵</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Mode Selector Tabs: Link vs Upload */}
        <div className="p-1 rounded-xl bg-white/5 border border-white/10 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setInputMode('link');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              inputMode === 'link'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link Platform (YT/Spotify/TikTok)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('upload');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              inputMode === 'upload'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload dari Penyimpanan</span>
          </button>
        </div>

        {/* Audio Type (Song or Voice Note) */}
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

        {/* Mode 1: URL Input with Auto Platform & Metadata Detection */}
        {inputMode === 'link' && (
          <div className="space-y-2 p-3.5 rounded-xl bg-[#14142b] border border-purple-500/30">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
                Link Lagu / Video / Audio *
              </label>
              {detectedPlatform && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-medium flex items-center gap-1">
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
                placeholder="Paste link YouTube, Spotify, TikTok, Instagram, atau SoundCloud..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 pr-10"
                required={inputMode === 'link'}
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

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Mendukung YouTube, YouTube Music, Spotify, TikTok, Instagram Reel, SoundCloud & MP3 URL.</span>
            </div>

            {metadataSuccess && (
              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Informasi judul lagu dan artis berhasil terisi otomatis!</span>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Storage Upload */}
        {inputMode === 'upload' && (
          <div className="p-3.5 rounded-xl bg-[#14142b] border border-pink-500/30 space-y-2">
            <label className="block text-xs font-semibold text-pink-300 uppercase tracking-wider flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" /> Pilih File Audio dari Penyimpanan *
            </label>
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-500/20 file:text-pink-300 hover:file:bg-pink-500/30 cursor-pointer"
              required={inputMode === 'upload' && !file}
            />
            {file ? (
              <div className="text-[11px] text-pink-300">
                Terpilih: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                Mendukung format MP3, WAV, M4A, OGG hingga 50MB.
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Diagnostic Inspector */}
        {debugError && (
          <DiagnosticInspector
            debugError={debugError}
            defaultExpanded={true}
          />
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

        {/* Author / Dedicated By */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Diunggah / Didedikasikan Oleh
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
            placeholder="Mengapa lagu atau pesan suara ini sangat berharga bagi kita?..."
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
            isLoading={isUploading}
            icon={<Music className="w-4 h-4" />}
          >
            {isUploading ? 'Menyimpan...' : 'Simpan Musik'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
