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
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type NavTab = 'home' | 'gallery' | 'letters' | 'notes' | 'music' | 'timeline';

interface FloatingNavBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenUpload: (type?: 'media' | 'letter' | 'note' | 'audio') => void;
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
    { id: 'home', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, emoji: '📸' },
    { id: 'letters', label: 'Letters', icon: Mail, emoji: '💌' },
    { id: 'notes', label: 'Notes', icon: StickyNote, emoji: '📝' },
    { id: 'music', label: 'Music', icon: Music, emoji: '🎵' },
    { id: 'timeline', label: 'Story', icon: CalendarHeart, emoji: '🗺️' },
  ] as const;

  return (
    <>
      {/* Quick Add Popover Backdrop */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMenu(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Floating Action Menu for Quick Add */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 p-3 bg-slate-900/90 backdrop-blur-2xl border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-900/40 min-w-[240px]"
          >
            <div className="px-3 py-1 text-xs font-semibold text-pink-300 uppercase tracking-wider">
              Add New Memory ✨
            </div>
            
            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('media');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-white hover:bg-white/10 transition-colors text-left group"
            >
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 group-hover:bg-pink-500/30 group-hover:scale-105 transition-all">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Photo / Video</div>
                <div className="text-xs text-slate-400">Max 5MB img / 500MB video</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('letter');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-white hover:bg-white/10 transition-colors text-left group"
            >
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 group-hover:bg-rose-500/30 group-hover:scale-105 transition-all">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Love Letter</div>
                <div className="text-xs text-slate-400">Write heartfelt words</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('note');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-white hover:bg-white/10 transition-colors text-left group"
            >
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30 group-hover:scale-105 transition-all">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Sticky Note</div>
                <div className="text-xs text-slate-400">Cute reminder or thought</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('audio');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-white hover:bg-white/10 transition-colors text-left group"
            >
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30 group-hover:scale-105 transition-all">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">Audio / Song</div>
                <div className="text-xs text-slate-400">Voice memo or shared music</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-2xl w-auto"
      >
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-4 sm:px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_15px_45px_rgba(0,0,0,0.6)] shadow-pink-950/20">
          {/* Main Navigation Tabs */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`
                  relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium
                  transition-all duration-200 cursor-pointer
                  ${isActive ? 'text-white font-semibold' : 'text-white/50 hover:text-white hover:bg-white/10'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1 shrink-0" />

          {/* Quick Create (+) Button */}
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`
              relative p-2.5 rounded-full text-white cursor-pointer transition-all duration-300
              ${showAddMenu 
                ? 'bg-rose-500 rotate-45 shadow-lg shadow-rose-500/50' 
                : 'bg-pink-500 hover:scale-105 shadow-lg shadow-pink-500/40 hover:bg-pink-400'}
            `}
            title="Add New Memory"
            aria-label="Add New Memory"
          >
            <Plus className="w-4 h-4 transition-transform" />
          </button>

          {/* Settings / Cloud Info */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Storage & Settings"
            aria-label="Storage and Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-full text-white/50 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
            title="Lock & Exit"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </>
  );
};
