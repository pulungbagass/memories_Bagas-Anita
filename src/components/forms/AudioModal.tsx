import React, { useState } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { Mic, Music, UploadCloud, AlertCircle } from 'lucide-react';
import { AuthorType, AudioMemory } from '../../types';
import { uploadMediaToVercelBlob } from '../../lib/vercelClient';

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

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setDescription('');
    setAuthor('Together');
    setAudioUrl('');
    setFile(null);
    setErrorMsg(null);
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
  };

  const handleSelectSample = (sample: typeof SAMPLE_TRACKS[0]) => {
    setTitle(sample.title);
    setArtist(sample.artist);
    setAudioUrl(sample.url);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

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
      setErrorMsg(err.message || 'Failed to save audio');
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
            <Mic className="w-3.5 h-3.5" /> Voice Memo
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Audio File Selection */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Audio Source
          </div>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-pink-500/20 file:text-pink-300 hover:file:bg-pink-500/30 file:cursor-pointer"
          />
          {file && (
            <div className="text-xs text-pink-300 font-medium">Selected: {file.name}</div>
          )}

          <div className="pt-2">
            <div className="text-[11px] text-slate-400 mb-1.5">Or choose a romantic melody preset:</div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TRACKS.map((st, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSample(st)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 truncate max-w-[200px]"
                >
                  🎶 {st.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Track / Recording Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sampai Jadi Debu, Anita singing in car..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Artist & Author */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Artist / Performer
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g., Banda Neira / Anita"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Recorded / Shared By
            </label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value as AuthorType)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-slate-900"
            >
              <option value="Together">🤍 Together</option>
              <option value="Bagas">👨‍💼 Bagas</option>
              <option value="Anita">🌷 Anita</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Story / Context
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this sound special to us?"
            className="w-full px-4 py-2 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            isLoading={isUploading}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            {isUploading ? 'Uploading to Vercel...' : 'Save Audio Memory'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
