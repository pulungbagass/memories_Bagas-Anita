import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EmoticonParticles } from './components/particles/EmoticonParticles';
import { FloatingNavBar, NavTab } from './components/ui/FloatingNavBar';
import { AudioPlayerBar } from './components/ui/AudioPlayerBar';
import { SettingsModal } from './components/ui/SettingsModal';
import { UploadModal } from './components/forms/UploadModal';
import { LetterModal } from './components/forms/LetterModal';
import { NoteModal } from './components/forms/NoteModal';
import { AudioModal } from './components/forms/AudioModal';

import { LoginPage } from './components/pages/LoginPage';
import { WelcomePage } from './components/pages/WelcomePage';
import { HomePage } from './components/pages/HomePage';
import { GalleryPage } from './components/pages/GalleryPage';
import { LettersPage } from './components/pages/LettersPage';
import { NotesPage } from './components/pages/NotesPage';
import { MusicPage } from './components/pages/MusicPage';
import { TimelinePage } from './components/pages/TimelinePage';

import { memoryStorage } from './lib/storage';
import { GalleryItem, LoveLetter, StickyNote, AudioMemory, TimelineMilestone } from './types';

export default function App() {
  // Session & Navigation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => memoryStorage.isAuthenticated());
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Memories Data State
  const [gallery, setGallery] = useState<GalleryItem[]>(() => memoryStorage.getGallery());
  const [letters, setLetters] = useState<LoveLetter[]>(() => memoryStorage.getLetters());
  const [notes, setNotes] = useState<StickyNote[]>(() => memoryStorage.getNotes());
  const [audios, setAudios] = useState<AudioMemory[]>(() => memoryStorage.getAudios());
  const [milestones] = useState<TimelineMilestone[]>(() => memoryStorage.getMilestones());

  // Audio Playback
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Form Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [editLetter, setEditLetter] = useState<LoveLetter | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editNote, setEditNote] = useState<StickyNote | null>(null);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial sync from Vercel Postgres / Database upon startup
  useEffect(() => {
    let isMounted = true;
    memoryStorage.syncAllFromDatabase().then((data) => {
      if (!isMounted) return;
      if (data.gallery && data.gallery.length > 0) setGallery(data.gallery);
      if (data.letters && data.letters.length > 0) setLetters(data.letters);
      if (data.notes && data.notes.length > 0) setNotes(data.notes);
      if (data.audios && data.audios.length > 0) setAudios(data.audios);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshAllData = async () => {
    const data = await memoryStorage.syncAllFromDatabase();
    setGallery(data.gallery || memoryStorage.getGallery());
    setLetters(data.letters || memoryStorage.getLetters());
    setNotes(data.notes || memoryStorage.getNotes());
    setAudios(data.audios || memoryStorage.getAudios());
  };

  // Auth Handlers
  const handleLoginSuccess = () => {
    memoryStorage.setAuthenticated(true);
    setIsAuthenticated(true);
    setShowWelcome(true);
  };

  const handleLogout = () => {
    memoryStorage.setAuthenticated(false);
    setIsAuthenticated(false);
    setShowWelcome(false);
    setIsPlaying(false);
  };

  // CRUD Handlers - Gallery (Optimistic UI + Supabase Sync)
  const handleAddMedia = (newItem: GalleryItem) => {
    setGallery((prev) => [newItem, ...prev.filter(g => g.id !== newItem.id)]);
    memoryStorage.addGalleryItemAsync(newItem);
  };

  const handleDeleteMedia = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    memoryStorage.deleteGalleryItemAsync(id);
  };

  const handleToggleFavoriteMedia = (id: string) => {
    const target = gallery.find((g) => g.id === id);
    if (!target) return;
    const updatedItem = { ...target, isFavorite: !target.isFavorite };
    setGallery((prev) => prev.map((g) => (g.id === id ? updatedItem : g)));
    memoryStorage.updateGalleryItemAsync(updatedItem);
  };

  // CRUD Handlers - Letters (Optimistic UI + Supabase Sync)
  const handleSaveLetter = (letter: LoveLetter) => {
    if (editLetter) {
      setLetters((prev) => prev.map((l) => (l.id === letter.id ? letter : l)));
      memoryStorage.updateLetterAsync(letter);
    } else {
      setLetters((prev) => [letter, ...prev.filter(l => l.id !== letter.id)]);
      memoryStorage.addLetterAsync(letter);
    }
    setEditLetter(null);
  };

  const handleDeleteLetter = (id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
    memoryStorage.deleteLetterAsync(id);
  };

  // CRUD Handlers - Notes (Optimistic UI + Supabase Sync)
  const handleSaveNote = (note: StickyNote) => {
    if (editNote) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      memoryStorage.updateNoteAsync(note);
    } else {
      setNotes((prev) => [note, ...prev.filter(n => n.id !== note.id)]);
      memoryStorage.addNoteAsync(note);
    }
    setEditNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    memoryStorage.deleteNoteAsync(id);
  };

  const handleTogglePinNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updatedNote = { ...target, isPinned: !target.isPinned };
    setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
    memoryStorage.updateNoteAsync(updatedNote);
  };

  // CRUD Handlers - Audios (Optimistic UI + Supabase Sync)
  const handleAddAudio = (newAudio: AudioMemory) => {
    setAudios((prev) => [newAudio, ...prev.filter(a => a.id !== newAudio.id)]);
    memoryStorage.addAudioAsync(newAudio);
  };

  const handleDeleteAudio = (id: string) => {
    setAudios((prev) => prev.filter((a) => a.id !== id));
    memoryStorage.deleteAudioAsync(id);
  };

  // Generic Open Creator
  const handleOpenCreator = (type?: 'media' | 'letter' | 'note' | 'audio') => {
    if (type === 'letter') {
      setEditLetter(null);
      setIsLetterModalOpen(true);
    } else if (type === 'note') {
      setEditNote(null);
      setIsNoteModalOpen(true);
    } else if (type === 'audio') {
      setIsAudioModalOpen(true);
    } else {
      setIsUploadOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0c0c1e] text-white font-sans selection:bg-pink-500/30 selection:text-pink-200 overflow-x-hidden">
      {/* Immersive UI Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-pink-900/20 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] bg-indigo-900/30 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed top-[35%] left-[25%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-glow" />

      {/* Immersive Ambient Floating Emoji Elements */}
      <div className="fixed top-[10%] left-[12%] text-2xl opacity-35 select-none pointer-events-none z-0 animate-float-slow">✨</div>
      <div className="fixed top-[38%] right-[8%] text-3xl opacity-25 select-none pointer-events-none z-0 animate-float-slow" style={{ animationDelay: '1.5s' }}>🌸</div>
      <div className="fixed bottom-[18%] left-[7%] text-2xl opacity-35 select-none pointer-events-none z-0 animate-float-slow" style={{ animationDelay: '3s' }}>🌷</div>
      <div className="fixed top-[72%] left-[22%] text-xl opacity-25 select-none pointer-events-none z-0 animate-float-slow" style={{ animationDelay: '2s' }}>🤍</div>
      <div className="fixed top-[18%] right-[26%] text-2xl opacity-40 select-none pointer-events-none z-0 animate-float-slow" style={{ animationDelay: '0.8s' }}>💖</div>
      <div className="fixed bottom-[28%] right-[18%] text-xl opacity-30 select-none pointer-events-none z-0 animate-float-slow" style={{ animationDelay: '2.5s' }}>✨</div>

      {/* 1. Global Interactive Emoticon Particles */}
      <EmoticonParticles />

      {/* 2. Top-Right Ambient Audio Player Bar (when logged in) */}
      {isAuthenticated && !showWelcome && (
        <AudioPlayerBar
          tracks={audios}
          currentTrackIndex={currentTrackIndex}
          onTrackChange={(idx) => setCurrentTrackIndex(idx)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      )}

      {/* 3. Main Views & Route Transitions */}
      <main className="relative z-10">
        {!isAuthenticated ? (
          /* Isolated Dedicated Login Page */
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : showWelcome ? (
          /* Dedicated Modular Welcome Page */
          <WelcomePage
            onContinue={() => setShowWelcome(false)}
            startDate="2022-04-16"
            partner1Name="Bagas"
            partner2Name="Anita"
          />
        ) : (
          /* Dashboard Layout with floating nav */
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentTab === 'home' && (
                <HomePage
                  gallery={gallery}
                  letters={letters}
                  notes={notes}
                  audios={audios}
                  onNavigate={setCurrentTab}
                  onOpenUpload={handleOpenCreator}
                  onSelectLetter={(l) => {
                    setCurrentTab('letters');
                  }}
                  onSelectMedia={(m) => {
                    setCurrentTab('gallery');
                  }}
                />
              )}

              {currentTab === 'gallery' && (
                <GalleryPage
                  gallery={gallery}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onDeleteMedia={handleDeleteMedia}
                  onToggleFavorite={handleToggleFavoriteMedia}
                />
              )}

              {currentTab === 'letters' && (
                <LettersPage
                  letters={letters}
                  onOpenCompose={() => {
                    setEditLetter(null);
                    setIsLetterModalOpen(true);
                  }}
                  onEditLetter={(l) => {
                    setEditLetter(l);
                    setIsLetterModalOpen(true);
                  }}
                  onDeleteLetter={handleDeleteLetter}
                />
              )}

              {currentTab === 'notes' && (
                <NotesPage
                  notes={notes}
                  onOpenCreate={() => {
                    setEditNote(null);
                    setIsNoteModalOpen(true);
                  }}
                  onEditNote={(n) => {
                    setEditNote(n);
                    setIsNoteModalOpen(true);
                  }}
                  onDeleteNote={handleDeleteNote}
                  onTogglePin={handleTogglePinNote}
                />
              )}

              {currentTab === 'music' && (
                <MusicPage
                  audios={audios}
                  currentTrackIndex={currentTrackIndex}
                  isPlaying={isPlaying}
                  onPlayTrack={(idx) => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onOpenUpload={() => setIsAudioModalOpen(true)}
                  onDeleteAudio={handleDeleteAudio}
                />
              )}

              {currentTab === 'timeline' && (
                <TimelinePage milestones={milestones} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* 4. Floating Glassmorphism Navigation Bar */}
      {isAuthenticated && !showWelcome && (
        <FloatingNavBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenUpload={handleOpenCreator}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 5. Modals & Forms */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleAddMedia}
      />

      <LetterModal
        isOpen={isLetterModalOpen}
        onClose={() => {
          setIsLetterModalOpen(false);
          setEditLetter(null);
        }}
        onSuccess={handleSaveLetter}
        editLetter={editLetter}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditNote(null);
        }}
        onSuccess={handleSaveNote}
        editNote={editNote}
      />

      <AudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSuccess={handleAddAudio}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={refreshAllData}
      />
    </div>
  );
}
