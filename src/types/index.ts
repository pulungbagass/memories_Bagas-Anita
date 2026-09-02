export type AuthorType = 'Bagas' | 'Anita' | 'Together';

export type MediaType = 'photo' | 'video' | 'audio';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  mediaType: 'photo' | 'video';
  url: string;
  driveFileId?: string;
  thumbnailUrl?: string;
  author: AuthorType;
  category: 'All' | 'Dates' | 'Trips' | 'Daily' | 'Anniversary' | 'Special';
  date: string;
  location?: string;
  isFavorite?: boolean;
  aspectRatio?: number; // width / height
  createdAt: string;
}

export interface LoveLetter {
  id: string;
  title: string;
  content: string;
  sender: 'Bagas' | 'Anita';
  recipient: 'Bagas' | 'Anita';
  date: string;
  stampEmoji?: string;
  isRead?: boolean;
  paperColor?: 'rose' | 'amber' | 'lavender' | 'sky' | 'emerald';
  createdAt: string;
}

export interface StickyNote {
  id: string;
  text: string;
  author: AuthorType;
  color: 'pink' | 'purple' | 'yellow' | 'blue' | 'green';
  date: string;
  isPinned?: boolean;
  emoji?: string;
  createdAt: string;
}

export interface AudioMemory {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: string;
  author: AuthorType;
  type: 'song' | 'voicenote';
  platform?: 'youtube' | 'spotify' | 'tiktok' | 'instagram' | 'soundcloud' | 'upload' | 'direct';
  embedUrl?: string;
  date: string;
  coverUrl?: string;
  description?: string;
  createdAt: string;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  description: string;
  emoji: string;
  photoUrl?: string;
  location?: string;
  category: string;
}

export type StoryItemType = 'gallery' | 'letter' | 'note' | 'audio' | 'milestone';

export interface UnifiedStoryItem {
  id: string;
  itemType: StoryItemType;
  title: string;
  date: string;
  description: string;
  emoji: string;
  badge: string;
  author: string;
  location?: string;
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  category?: string;
  createdAt: string;
  rawItem: GalleryItem | LoveLetter | StickyNote | AudioMemory | TimelineMilestone;
}

export interface AppConfig {
  coupleNames: {
    partner1: string;
    partner2: string;
  };
  startDate: string; // YYYY-MM-DD
  anniversaryDate: string;
  hardcodedPassword: string;
  googleDriveFolderUrl: string;
  googleDriveFolderId: string;
}
