import React, { useState } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { Mic, Music, UploadCloud, AlertCircle } from 'lucide-react';
import { AuthorType, AudioMemory } from '../../types';
import { uploadMediaToVercelBlob, DebugErrorLog } from '../../lib/vercelClient';
import { DiagnosticInspector } from '../ui/DiagnosticInspector';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (audio: AudioMemory) => void;
}

const SAMPLE_TRACKS = [
  {
    title: 'Acoustic Sunset Melody',
    artist: 'Bagas & Anita Acoustic',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112193.mp3',
    duration: '3:45'
  },
  {
    title: 'Romantic Piano & Rain',
    artist: 'Memories Piano',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=romantic-piano-10875.mp3',
    duration: '2:30'
  },
  {
    title: 'Midnight Lo-Fi Love Beats',
    artist: 'Chill Sessions',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    duration: '2:15'
  }
];

export const AudioModal: React.FC<AudioModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [audioType, setAudioType] = useState<'song' | 'voicenote'>('song');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState<AuthorType>('Together');
  const [audioUrl, setAudioUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<DebugErrorLog | null>(null);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setDescription('');
    setAuthor('Together');
    setAudioUrl('');
    setFile(null);
    setErrorMsg(null);
    setDebugError(null);
    setIsUploading(false);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/') && !selectedFile.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setErrorMsg('Please select a valid audio file (MP3, WAV, M4A, OGG).');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg('Audio file size exceeds the 50MB limit.');
      return;
    }
    setFile(selectedFile);
    setErrorMsg(null);
    setDebugError(null);
  };

  const handleSelectSample = (sample: typeof SAMPLE_TRACKS[0]) => {
    setTitle(sample.title);
    setArtist(sample.artist);
    setAudioUrl(sample.url);
    setFile(null);
    setErrorMsg(null);
    setDebugError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setDebugError(null);

    try {
      let finalUrl = audioUrl;

      if (file) {
        const uploadRes = await uploadMediaToVercelBlob(file, author, 'Audio');
        finalUrl = uploadRes.url;
      }

      if (!finalUrl) {
        finalUrl = SAMPLE_TRACKS[0].url;
      }

      const newAudio: AudioMemory = {
        id: 'aud_' + Date.now(),
        title: title.trim(),
        artist: artist.trim() || (audioType === 'voicenote' ? author : 'Shared Playlist'),
        url: finalUrl,
        duration: '3:00',
        author,
        type: audioType,
        date: new Date().toISOString().split('T')[0],
        coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
        description: description.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      onSuccess(newAudio);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Audio upload error:', err);
      setErrorMsg(err.message || 'Failed to save audio');
      setDebugError({
        endpoint: err.endpoint || '/api/upload',
        httpStatus: err.httpStatus || 500,
        message: err.message || 'Failed to upload audio file',
        timestamp: err.timestamp || new Date().toISOString(),
        details: err.details || { error: String(err) },
        suggestions: err.suggestions || [
          'Verify that the audio file is in MP3 or WAV format under 50MB.',
          'Check storage status in the Settings & Storage modal.'
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
          <span>Add Audio / Voice Memo 🎵</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAudioType('song');
              if (!artist) setArtist('Shared Playlist');
            }}
            className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              audioType === 'song' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" /> Favorite Song
          </button>
          <button
            type="button"
            onClick={() => {
              setAudioType('voicenote');
              if (artist === 'Shared Playlist') setArtist('');
            }}
            className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              audioType === 'voicenote' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Voice Note Memo
          </button>
        </div>

        {/* Preset Samples Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Or Pick Romantic Melody Preset
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SAMPLE_TRACKS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  audioUrl === sample.url && !file
                    ? 'border-pink-500 bg-pink-500/15'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-white">{sample.title}</div>
                  <div className="text-[11px] text-slate-400">{sample.artist}</div>
                </div>
                <span className="text-[11px] text-pink-300 font-mono">{sample.duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Audio File */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5 text-purple-400" /> Upload Custom MP3 / Voice Memo
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
          />
          {file && (
            <div className="mt-1 text-[11px] text-pink-300">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
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

        {/* Diagnostic Inspector */}
        {debugError && (
          <DiagnosticInspector
            debugError={debugError}
            defaultExpanded={true}
          />
        )}

        {/* Title & Artist */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Audio Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={audioType === 'song' ? 'e.g. Perfect - Ed Sheeran' : 'e.g. Good Morning Cheer'}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            required
          />
        </div>

        {audioType === 'song' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Artist Name
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Taylor Swift, Bagas Guitar Cover..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>
        )}

        {/* Author */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Dedicated By / Recorded By
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value as AuthorType)}
            className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900"
          >
            <option value="Together">🤍 Bagas & Anita (Both)</option>
            <option value="Bagas">👨 Bagas</option>
            <option value="Anita">👩 Anita</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Notes / Story Behind This Track
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this song / voice note special to us?..."
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-white placeholder-slate-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            isLoading={isUploading}
            icon={<Music className="w-4 h-4" />}
          >
            {isUploading ? 'Saving Track...' : 'Save Audio Memory'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
