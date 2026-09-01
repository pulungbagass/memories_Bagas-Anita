import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Heart, 
  Filter, 
  MapPin, 
  Calendar, 
  Video, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ZoomIn, 
  Play,
  Sparkles,
  User
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassModal } from '../ui/GlassModal';
import { GalleryItem, AuthorType } from '../../types';

interface GalleryPageProps {
  gallery: GalleryItem[];
  onOpenUpload: () => void;
  onDeleteMedia: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

type FilterCategory = 'All' | 'Bagas' | 'Anita' | 'Dates' | 'Trips' | 'Daily' | 'Anniversary' | 'Favorites' | 'Videos';

export const GalleryPage: React.FC<GalleryPageProps> = ({
  gallery,
  onOpenUpload,
  onDeleteMedia,
  onToggleFavorite
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filterTabs: { id: FilterCategory; label: string; icon?: string }[] = [
    { id: 'All', label: '✨ All Moments' },
    { id: 'Favorites', label: '💖 Favorites' },
    { id: 'Bagas', label: '👨‍💼 By Bagas' },
    { id: 'Anita', label: '🌷 By Anita' },
    { id: 'Dates', label: '☕ Dates & Cafes' },
    { id: 'Trips', label: '✈️ Trips & Travels' },
    { id: 'Daily', label: '🌟 Daily Life' },
    { id: 'Videos', label: '🎬 Videos' },
  ];

  const filteredItems = gallery.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Favorites') return item.isFavorite;
    if (activeFilter === 'Bagas') return item.author === 'Bagas';
    if (activeFilter === 'Anita') return item.author === 'Anita';
    if (activeFilter === 'Videos') return item.mediaType === 'video';
    return item.category === activeFilter;
  });

  return (
    <div className="space-y-6 pb-28 pt-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Visual Memories</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-white tracking-tight mt-1">
            Our Gallery & Moments 📸
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Every snapshot tells a story of where we have been and where we are going.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <GlassButton
            variant="primary"
            onClick={onOpenUpload}
            icon={<Plus className="w-4 h-4" />}
          >
            Upload Photo / Video
          </GlassButton>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 border border-white/20' 
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'}
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Masonry Grid Layout */}
      {filteredItems.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-400 max-w-md mx-auto my-8">
          <div className="text-3xl mb-2">📸</div>
          <h3 className="text-lg font-semibold text-white">No memories found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            No photos or videos match this filter. Upload one to get started!
          </p>
          <GlassButton variant="primary" size="sm" onClick={onOpenUpload}>
            Upload Memory
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
              className="break-inside-avoid"
            >
              <GlassCard
                hoverEffect
                className="overflow-hidden border-white/10 group cursor-pointer relative"
                onClick={() => setSelectedItem(item)}
              >
                {/* Media Container */}
                <div className="relative overflow-hidden bg-slate-950">
                  {item.mediaType === 'video' ? (
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="p-3 rounded-full bg-pink-500/80 text-white backdrop-blur-md group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] bg-black/70 text-white font-mono flex items-center gap-1">
                        <Video className="w-3 h-3 text-pink-400" /> Video
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[160px]"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-pink-200 border border-white/10">
                        {item.author}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          item.isFavorite ? 'bg-pink-500 text-white' : 'bg-black/50 text-white hover:bg-pink-500/50'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    <div className="text-white text-xs">
                      <div className="font-semibold line-clamp-1">{item.title}</div>
                      <div className="text-[10px] text-pink-300">{item.date}</div>
                    </div>
                  </div>
                </div>

                {/* Card footer description */}
                <div className="p-3 bg-slate-900/60 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-300/80 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-pink-400" /> {item.date}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="w-3 h-3 text-pink-400" /> {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox / Media Viewer Modal */}
      <GlassModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={
          <div className="flex items-center justify-between w-full pr-6">
            <span className="truncate">{selectedItem?.title}</span>
            {selectedItem && (
              <button
                onClick={() => onToggleFavorite(selectedItem.id)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  selectedItem.isFavorite ? 'text-pink-400 fill-pink-400' : 'text-slate-400 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedItem.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        }
        maxWidth="4xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Media Display */}
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh] border border-white/10">
              {selectedItem.mediaType === 'video' ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
            </div>

            {/* Details & Actions */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-medium">
                    By {selectedItem.author}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" /> {selectedItem.date}
                  </span>
                  {selectedItem.location && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" /> {selectedItem.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-300 hover:text-pink-200 text-xs flex items-center gap-1"
                  >
                    <span>Open Full Media</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {selectedItem.description && (
                <p className="text-sm text-slate-200 leading-relaxed font-light">
                  {selectedItem.description}
                </p>
              )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirmId === selectedItem.id ? (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between">
                <span className="text-xs text-rose-300 font-medium">Delete this memory permanently?</span>
                <div className="flex gap-2">
                  <GlassButton size="sm" variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</GlassButton>
                  <GlassButton
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onDeleteMedia(selectedItem.id);
                      setDeleteConfirmId(null);
                      setSelectedItem(null);
                    }}
                  >
                    Confirm Delete
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center pt-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirmId(selectedItem.id)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Memory
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Close Viewer
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </GlassModal>
    </div>
  );
};
