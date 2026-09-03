import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Heart, 
  ArrowUpDown, 
  ChevronRight,
  Eye,
  Plus,
  Clock
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { StoryDetailModal } from '../modals/StoryDetailModal';
import { 
  GalleryItem, 
  LoveLetter, 
  StickyNote, 
  AudioMemory, 
  TimelineMilestone, 
  UnifiedStoryItem,
  StoryItemType
} from '../../types';

interface TimelinePageProps {
  gallery: GalleryItem[];
  letters: LoveLetter[];
  notes: StickyNote[];
  audios: AudioMemory[];
  milestones?: TimelineMilestone[];
  onOpenUpload?: (type?: 'media' | 'letter' | 'note' | 'audio') => void;
}

/**
 * Extracts a high-precision millisecond timestamp from story item,
 * taking into account Year, Month, Day, Hour, Minute, and Second (Full Timestamp).
 */
export function getStoryTimestamp(item: UnifiedStoryItem): number {
  if (item.createdAt) {
    const time = new Date(item.createdAt).getTime();
    if (!isNaN(time) && time > 0) return time;
  }
  if (item.rawItem && 'createdAt' in item.rawItem && (item.rawItem as any).createdAt) {
    const time = new Date((item.rawItem as any).createdAt).getTime();
    if (!isNaN(time) && time > 0) return time;
  }
  // Check if item id contains timestamp digits (e.g. gal_1712345678901)
  const match = item.id.match(/\d{10,13}/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (!isNaN(num) && num > 1000000000) return num;
  }
  if (item.date) {
    const time = new Date(item.date).getTime();
    if (!isNaN(time) && time > 0) return time;
  }
  return 0;
}

/**
 * Formats a story timestamp gracefully, showing date and hours:minutes:seconds when available.
 */
export function formatStoryTimestamp(createdAt?: string, dateStr?: string): string {
  const source = createdAt || dateStr;
  if (!source) return 'Momen Kenangan';

  const d = new Date(source);
  if (isNaN(d.getTime())) return dateStr || source;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  // If timestamp contains hours/minutes/seconds
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  if (hours !== 0 || minutes !== 0 || seconds !== 0) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return `${day} ${month} ${year} • ${h}:${m}:${s}`;
  }

  return `${day} ${month} ${year}`;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  gallery,
  letters,
  notes,
  audios,
  milestones = [],
  onOpenUpload
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = newest first (Descendant)
  const [selectedStory, setSelectedStory] = useState<UnifiedStoryItem | null>(null);

  // Automatically aggregate ALL memory items into a unified story feed in real-time
  const allStoryItems = useMemo<UnifiedStoryItem[]>(() => {
    const list: UnifiedStoryItem[] = [];

    // 1. Gallery items
    gallery.forEach((g) => {
      const isVideo = g.mediaType === 'video';
      const accurateCreatedAt = g.createdAt || (g.date ? new Date(g.date).toISOString() : new Date().toISOString());
      list.push({
        id: `story_gal_${g.id}`,
        itemType: 'gallery',
        title: g.title,
        date: g.date || (g.createdAt ? g.createdAt.split('T')[0] : '2024-01-01'),
        description: g.description || (isVideo ? 'Video kenangan diabadikan bersama.' : 'Foto kenangan diabadikan bersama.'),
        emoji: isVideo ? '🎬' : '📸',
        badge: isVideo ? 'Video Galeri' : 'Foto Galeri',
        author: g.author,
        location: g.location,
        photoUrl: !isVideo ? g.url : undefined,
        videoUrl: isVideo ? g.url : undefined,
        category: g.category,
        createdAt: accurateCreatedAt,
        rawItem: g
      });
    });

    // 2. Love Letters
    letters.forEach((l) => {
      const accurateCreatedAt = l.createdAt || (l.date ? new Date(l.date).toISOString() : new Date().toISOString());
      list.push({
        id: `story_let_${l.id}`,
        itemType: 'letter',
        title: l.title,
        date: l.date || (l.createdAt ? l.createdAt.split('T')[0] : '2024-01-01'),
        description: l.content,
        emoji: l.stampEmoji || '💌',
        badge: 'Surat Cinta',
        author: `${l.sender} ➔ ${l.recipient}`,
        category: 'Surat Cinta',
        createdAt: accurateCreatedAt,
        rawItem: l
      });
    });

    // 3. Sticky Notes
    notes.forEach((n) => {
      const accurateCreatedAt = n.createdAt || (n.date ? new Date(n.date).toISOString() : new Date().toISOString());
      list.push({
        id: `story_note_${n.id}`,
        itemType: 'note',
        title: `Catatan dari ${n.author}`,
        date: n.date || (n.createdAt ? n.createdAt.split('T')[0] : '2024-01-01'),
        description: n.text,
        emoji: n.emoji || '📌',
        badge: 'Sticky Note',
        author: n.author,
        category: 'Catatan Kecil',
        createdAt: accurateCreatedAt,
        rawItem: n
      });
    });

    // 4. Audio & Music
    audios.forEach((a) => {
      const isVoice = a.type === 'voicenote';
      const accurateCreatedAt = a.createdAt || (a.date ? new Date(a.date).toISOString() : new Date().toISOString());
      list.push({
        id: `story_aud_${a.id}`,
        itemType: 'audio',
        title: a.title,
        date: a.date || (a.createdAt ? a.createdAt.split('T')[0] : '2024-01-01'),
        description: a.description || (a.artist ? `Artis: ${a.artist}` : 'Lagu kenangan romantis kita.'),
        emoji: isVoice ? '🎙️' : '🎵',
        badge: isVoice ? 'Voice Memo' : (a.platform ? `Musik (${a.platform})` : 'Musik & Lagu'),
        author: a.author,
        audioUrl: a.url,
        category: 'Musik & Audio',
        createdAt: accurateCreatedAt,
        rawItem: a
      });
    });

    // 5. Custom Milestones (if any)
    milestones.forEach((m) => {
      const accurateCreatedAt = m.createdAt || (m.date ? new Date(m.date).toISOString() : new Date().toISOString());
      list.push({
        id: `story_mil_${m.id}`,
        itemType: 'milestone',
        title: m.title,
        date: m.date,
        description: m.description,
        emoji: m.emoji || '✨',
        badge: m.category || 'Momen Kisah',
        author: 'Together',
        location: m.location,
        photoUrl: m.photoUrl,
        category: m.category,
        createdAt: accurateCreatedAt,
        rawItem: m
      });
    });

    // High Precision Sorting: Tanggal, Bulan, Tahun, Jam, Menit, dan Detik (Full Timestamp)
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        // Descending (newest first): timeB - timeA; Ascending: timeA - timeB
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }

      // Robust fallback if createdAt was not in ISO string format
      const preciseA = getStoryTimestamp(a);
      const preciseB = getStoryTimestamp(b);
      if (preciseA !== preciseB) {
        return sortOrder === 'desc' ? preciseB - preciseA : preciseA - preciseB;
      }

      // Deterministic tie-breaker
      return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
    });
  }, [gallery, letters, notes, audios, milestones, sortOrder]);

  // Filter and search
  const filteredStories = useMemo(() => {
    return allStoryItems.filter((item) => {
      const matchType = selectedTypeFilter === 'all' || item.itemType === selectedTypeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        item.author.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [allStoryItems, selectedTypeFilter, searchQuery]);

  const typeCounts = useMemo(() => {
    return {
      all: allStoryItems.length,
      gallery: allStoryItems.filter(i => i.itemType === 'gallery').length,
      letter: allStoryItems.filter(i => i.itemType === 'letter').length,
      note: allStoryItems.filter(i => i.itemType === 'note').length,
      audio: allStoryItems.filter(i => i.itemType === 'audio').length,
    };
  }, [allStoryItems]);

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-pink-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kisah Perjalanan Cinta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-0.5">
            Story Timeline Kita ✨
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Semua foto, video, surat cinta, sticky notes, dan lagu romantis terangkum otomatis sesuai urutan waktu presisi.
          </p>
        </div>

        {onOpenUpload && (
          <GlassButton
            variant="primary"
            onClick={() => onOpenUpload('media')}
            icon={<Plus className="w-4 h-4" />}
            className="shrink-0 shadow-md"
          >
            Tambah Momen Baru
          </GlassButton>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'Semua Momen', count: typeCounts.all },
              { id: 'gallery', label: '📸 Galeri', count: typeCounts.gallery },
              { id: 'letter', label: '💌 Surat', count: typeCounts.letter },
              { id: 'note', label: '📌 Notes', count: typeCounts.note },
              { id: 'audio', label: '🎵 Musik', count: typeCounts.audio },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedTypeFilter === tab.id
                    ? 'bg-pink-500 text-white font-semibold shadow-sm'
                    : 'bg-[#14142b] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedTypeFilter === tab.id ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14142b] border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer shadow-sm"
            title="Klik untuk mengubah urutan waktu"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-pink-400" />
            <span>{sortOrder === 'desc' ? 'Terbaru di Atas' : 'Terlama di Atas'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari cerita, judul, pesan, lokasi, atau penulis kenangan..."
            className="w-full pl-9 pr-4 py-2 bg-[#131328] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Story Timeline Items */}
      {filteredStories.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#131328] border border-dashed border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Tidak Ada Cerita Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Tidak ada momen kenangan yang cocok dengan kata kunci pencarianmu.'
                : 'Belum ada momen kenangan yang ditambahkan. Mulai upload foto, tulis surat cinta, atau tempelkan sticky note!'}
            </p>
          </div>
          {onOpenUpload && !searchQuery && (
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => onOpenUpload('media')}
              icon={<Plus className="w-4 h-4" />}
            >
              Buat Kenangan Pertama
            </GlassButton>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-pink-500/30 space-y-6">
          {filteredStories.map((item) => {
            const badgeBg =
              item.itemType === 'gallery' ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' :
              item.itemType === 'letter' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
              item.itemType === 'note' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              'bg-purple-500/20 text-purple-300 border-purple-500/40';

            const dotBg =
              item.itemType === 'gallery' ? 'bg-pink-500' :
              item.itemType === 'letter' ? 'bg-rose-500' :
              item.itemType === 'note' ? 'bg-amber-500' :
              'bg-purple-500';

            return (
              <div key={item.id} className="relative group">
                {/* Node Glowing Dot on Spine */}
                <div 
                  className={`
                    absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full ${dotBg}
                    border-4 border-[#0b0b18] shadow-md transition-transform group-hover:scale-125
                  `}
                />

                {/* Story Card */}
                <GlassCard 
                  onClick={() => setSelectedStory(item)}
                  className="p-4 sm:p-5 border-slate-800 hover:border-pink-500/40 transition-all cursor-pointer bg-[#131328] group-hover:bg-[#161630]"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top Row: Badge, Emoji & High-Precision Timestamp */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                          {item.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        <span>{formatStoryTimestamp(item.createdAt, item.date)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Image / Video Thumbnail Preview if gallery item */}
                    {item.photoUrl && (
                      <div className="rounded-xl overflow-hidden max-h-48 w-full bg-black/40 border border-white/5">
                        <img
                          src={item.photoUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Description Snippet */}
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed font-light">
                      {item.description}
                    </p>

                    {/* Footer Row: Author, Location & 'Lihat Detail' CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                      <div className="flex items-center gap-3 truncate">
                        <span className="flex items-center gap-1 text-[11px] truncate">
                          <User className="w-3 h-3 text-pink-400 shrink-0" />
                          <span className="text-slate-300 truncate">{item.author}</span>
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1 text-[11px] truncate text-slate-400">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-400 group-hover:text-pink-300 shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}

      {/* Rich Story Detail Modal */}
      <StoryDetailModal
        isOpen={Boolean(selectedStory)}
        item={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </div>
  );
};
