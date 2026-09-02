import React, { useState } from 'react';
import { 
  Home, 
  Image as ImageIcon, 
  Mail, 
  StickyNote, 
  Music, 
  CalendarHeart, 
  Plus, 
  Settings, 
  LogOut,
  UploadCloud,
  FileText,
  Mic,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type NavTab = 'home' | 'gallery' | 'letters' | 'notes' | 'music' | 'timeline';

interface FloatingNavBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenUpload: (type?: 'media' | 'letter' | 'note' | 'audio' | 'story') => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  currentTab,
  onTabChange,
  onOpenUpload,
  onOpenSettings,
  onLogout
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'letters', label: 'Letters', icon: Mail },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'timeline', label: 'Story', icon: CalendarHeart },
  ] as const;

  return (
    <>
      {/* Quick Add Popover Backdrop */}
      {showAddMenu && (
        <div
          onClick={() => setShowAddMenu(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        />
      )}

      {/* Floating Action Menu for Quick Add */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 p-2.5 bg-[#131328] border border-pink-500/30 rounded-2xl shadow-2xl min-w-[240px] max-w-[90vw]"
          >
            <div className="px-3 py-1.5 text-[11px] font-bold text-pink-400 uppercase tracking-wider">
              Tambah Kenangan ✨
            </div>
            
            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('media');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Foto / Video</div>
                <div className="text-[11px] text-slate-400">Vercel Blob Upload</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('letter');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Surat Cinta</div>
                <div className="text-[11px] text-slate-400">Pesan romantis</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('note');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Sticky Note</div>
                <div className="text-[11px] text-slate-400">Catatan kecil</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('audio');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Audio / Lagu</div>
                <div className="text-[11px] text-slate-400">Voice memo</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onTabChange('timeline');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Momen Story</div>
                <div className="text-[11px] text-slate-400">Timeline cerita</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-2.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-xl"
      >
        <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-full bg-[#131328]/95 backdrop-blur-md border border-slate-700/70 shadow-2xl">
          {/* Scrollable Navigation Tabs Area for Mobile & Desktop */}
          <div className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-1 py-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as NavTab)}
                  className={`
                    relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all cursor-pointer shrink-0 min-h-[36px] select-none
                    ${isActive
                      ? 'bg-pink-500 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fixed Action Group (Add, Settings, Logout) */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700/70 shrink-0">
            {/* Quick Create (+) Button */}
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`
                w-8 h-8 rounded-full text-white cursor-pointer transition-colors flex items-center justify-center shrink-0
                ${showAddMenu ? 'bg-rose-600' : 'bg-pink-500 hover:bg-pink-400'}
              `}
              title="Tambah Kenangan"
              aria-label="Tambah Kenangan"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Settings / Cloud Info */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center shrink-0"
              title="Storage & Settings"
              aria-label="Storage and Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center shrink-0"
              title="Kunci & Keluar"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
