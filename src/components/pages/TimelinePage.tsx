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
  Plus
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
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = newest first
  const [selectedStory, setSelectedStory] = useState<UnifiedStoryItem | null>(null);

  // Automatically aggregate ALL memory items into a unified story feed in real-time
  const allStoryItems = useMemo<UnifiedStoryItem[]>(() => {
    const list: UnifiedStoryItem[] = [];

    // 1. Gallery items
    gallery.forEach((g) => {
      const isVideo = g.mediaType === 'video';
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
        createdAt: g.createdAt || g.date,
        rawItem: g
      });
    });

    // 2. Love Letters
    letters.forEach((l) => {
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
        createdAt: l.createdAt || l.date,
        rawItem: l
      });
    });

    // 3. Sticky Notes
    notes.forEach((n) => {
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
        createdAt: n.createdAt || n.date,
        rawItem: n
      });
    });

    // 4. Audio & Music
    audios.forEach((a) => {
      const isVoice = a.type === 'voicenote';
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
        createdAt: a.createdAt || a.date,
        rawItem: a
      });
    });

    // 5. Custom Milestones (if any)
    milestones.forEach((m) => {
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
        createdAt: m.date,
        rawItem: m
      });
    });

    // Sort by Date
    return list.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-semibold text-pink-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Real-time Auto Story Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-1">
            Rangkuman Kisah Kita 📖✨
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Setiap foto, video, surat, catatan, dan lagu terangkum otomatis di timeline ini secara real-time.
          </p>
        </div>

        {onOpenUpload && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => onOpenUpload('media')}
            icon={<Plus className="w-4 h-4" />}
            className="shrink-0 shadow-md"
          >
            Tambah Kenangan
          </GlassButton>
        )}
      </div>

      {/* Filter Chips & Search Bar */}
      {allStoryItems.length > 0 && (
        <div className="space-y-3">
          {/* Search & Sort Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari cerita, pesan cinta, atau momen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm glass-input bg-[#131328] placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 rounded-xl bg-[#131328] border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              title={sortOrder === 'desc' ? 'Urutkan dari terlama' : 'Urutkan dari terbaru'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">
                {sortOrder === 'desc' ? 'Terbaru' : 'Awal Kisah'}
              </span>
            </button>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
            {[
              { id: 'all', label: '🌟 Semua Momen', count: typeCounts.all },
              { id: 'gallery', label: '📸 Galeri Foto & Video', count: typeCounts.gallery },
              { id: 'letter', label: '💌 Surat Cinta', count: typeCounts.letter },
              { id: 'note', label: '📌 Catatan / Notes', count: typeCounts.note },
              { id: 'audio', label: '🎵 Musik & Lagu', count: typeCounts.audio },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedTypeFilter(btn.id)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0
                  ${selectedTypeFilter === btn.id
                    ? 'bg-pink-500 text-white font-semibold shadow-sm'
                    : 'bg-[#131328] text-slate-300 hover:text-white border border-slate-800'
                  }
                `}
              >
                <span>{btn.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedTypeFilter === btn.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allStoryItems.length === 0 ? (
        <div className="text-center py-16 px-4 space-y-4 rounded-2xl border border-dashed border-slate-800 bg-[#131328]/60">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto text-2xl">
            <Heart className="w-7 h-7 text-pink-400 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-serif-display text-white font-medium">
              Belum Ada Momen Tercatat
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tambahkan foto di galeri, tulis surat cinta, buat sticky note, atau masukkan lagu kenangan. Semuanya akan otomatis terangkum rapi di menu Story ini!
            </p>
          </div>
          {onOpenUpload && (
            <div className="flex justify-center gap-2 pt-2">
              <GlassButton
                onClick={() => onOpenUpload('media')}
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                Mulai Tambah Kenangan
              </GlassButton>
            </div>
          )}
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#131328] border border-slate-800">
          <p className="text-sm text-slate-300">Tidak ada momen yang cocok dengan pencarian / filter.</p>
        </div>
      ) : (
        /* The Rich Vertical Timeline */
        <div className="relative pl-6 sm:pl-8 border-l-2 border-pink-500/30 space-y-6">
          {filteredStories.map((item, idx) => {
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
                    {/* Top Row: Badge, Emoji & Date */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                          {item.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-pink-400" />
                        <span>{item.date}</span>
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
