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
          className="fixed inset-0 z-40 bg-black/60"
        />
      )}

      {/* Floating Action Menu for Quick Add */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1.5 p-3 bg-[#131328] border border-pink-500/30 rounded-2xl shadow-xl min-w-[220px]"
          >
            <div className="px-3 py-1 text-[11px] font-bold text-pink-400 uppercase tracking-wider">
              Add New Memory ✨
            </div>
            
            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('media');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Photo / Video</div>
                <div className="text-[11px] text-slate-400">Vercel Blob Upload</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('letter');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Love Letter</div>
                <div className="text-[11px] text-slate-400">Sweet thoughts</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('note');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Sticky Note</div>
                <div className="text-[11px] text-slate-400">Cute reminder</div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onOpenUpload('audio');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-xs sm:text-sm">Audio / Song</div>
                <div className="text-[11px] text-slate-400">Voice memo</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-xl w-auto"
      >
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#131328]/95 border border-slate-700/70 shadow-xl">
          {/* Main Navigation Tabs */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`
                  relative flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium
                  transition-colors cursor-pointer min-h-[38px]
                  ${isActive ? 'bg-pink-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700 mx-0.5 shrink-0" />

          {/* Quick Create (+) Button */}
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`
              p-2 rounded-full text-white cursor-pointer transition-colors
              ${showAddMenu ? 'bg-rose-600' : 'bg-pink-500 hover:bg-pink-400'}
            `}
            title="Add New Memory"
            aria-label="Add New Memory"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Settings / Cloud Info */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Storage & Settings"
            aria-label="Storage and Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
