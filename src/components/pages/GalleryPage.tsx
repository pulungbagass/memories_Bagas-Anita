import React, { useState } from 'react';
import { 
  Plus, 
  Heart, 
  MapPin, 
  Calendar, 
  Video, 
  Trash2, 
  Sparkles,
  User,
  ZoomIn
} from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { GlassModal } from '../ui/GlassModal';
import { GalleryItem } from '../../types';

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

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: 'All', label: '✨ All' },
    { id: 'Favorites', label: '💖 Favorites' },
    { id: 'Bagas', label: '🤍 Bagas' },
    { id: 'Anita', label: '🌷 Anita' },
    { id: 'Dates', label: '☕ Dates' },
    { id: 'Trips', label: '✈️ Trips' },
    { id: 'Daily', label: '🌟 Daily' },
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
    <div className="space-y-5 pb-28 pt-2 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-pink-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Memories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight mt-0.5">
            Our Gallery & Moments 📸
          </h1>
        </div>

        <GlassButton
          variant="primary"
          onClick={onOpenUpload}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Upload Photo / Video
        </GlassButton>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer
                ${isActive 
                  ? 'bg-pink-500 text-white font-semibold' 
                  : 'bg-[#14142b] text-slate-300 hover:text-white hover:bg-[#1f1f3d] border border-slate-800'}
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Masonry / Grid of Moments */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#131328] border border-dashed border-slate-800 p-6">
          <div className="text-3xl mb-2">📸</div>
          <h3 className="text-base font-semibold text-white">No memories found in this filter</h3>
          <p className="text-xs text-slate-400 mt-1">Upload a photo or video to add to this category!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-3.5 space-y-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid rounded-2xl overflow-hidden bg-[#131328] border border-slate-800/80 shadow-md group relative"
            >
              {/* Media Thumbnail */}
              <div 
                onClick={() => setSelectedItem(item)}
                className="relative cursor-pointer overflow-hidden bg-black/40"
              >
                {item.mediaType === 'video' ? (
                  <div className="relative aspect-video flex items-center justify-center bg-slate-900">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="p-3 rounded-full bg-pink-500 text-white shadow-md">
                        <Video className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                )}
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">{item.title}</h3>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 text-slate-400 hover:text-pink-400 transition-colors"
                      title="Toggle favorite"
                    >
                      <Heart
                        className={`w-4 h-4 ${item.isFavorite ? 'text-pink-400 fill-pink-400' : ''}`}
                      />
                    </button>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-pink-300">
                    {item.author}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{item.date}</span>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <GlassModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title}
        maxWidth="2xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
              {selectedItem.mediaType === 'video' ? (
                <video src={selectedItem.url} controls autoPlay className="w-full max-h-[60vh]" />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-pink-300 font-semibold">Captured by: {selectedItem.author}</span>
                <span>{selectedItem.date}</span>
              </div>
              {selectedItem.description && (
                <p className="text-sm text-slate-200 leading-relaxed">{selectedItem.description}</p>
              )}
              {selectedItem.location && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" /> {selectedItem.location}
                </p>
              )}
            </div>
          </div>
        )}
      </GlassModal>

      {/* Delete Confirmation Modal */}
      <GlassModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Memory?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this memory? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => {
                if (deleteConfirmId) {
                  onDeleteMedia(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Delete
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
