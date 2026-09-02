import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(() => memoryStorage.getMilestones());

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
      if (Array.isArray(data.gallery)) setGallery(data.gallery);
      if (Array.isArray(data.letters)) setLetters(data.letters);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (Array.isArray(data.audios)) setAudios(data.audios);
      if (Array.isArray(data.milestones)) setMilestones(data.milestones);
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
    setMilestones(data.milestones || memoryStorage.getMilestones());
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

  // CRUD Handlers - Gallery
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

  // CRUD Handlers - Letters
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

  // CRUD Handlers - Notes
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

  // CRUD Handlers - Audios
  const handleAddAudio = (newAudio: AudioMemory) => {
    setAudios((prev) => [newAudio, ...prev.filter(a => a.id !== newAudio.id)]);
    memoryStorage.addAudioAsync(newAudio);
  };

  const handleDeleteAudio = (id: string) => {
    setAudios((prev) => prev.filter((a) => a.id !== id));
    memoryStorage.deleteAudioAsync(id);
  };

  // CRUD Handlers - Milestones / Story
  const handleAddMilestone = (newMilestone: TimelineMilestone) => {
    setMilestones((prev) => [newMilestone, ...prev.filter(m => m.id !== newMilestone.id)]);
    memoryStorage.addMilestoneAsync(newMilestone);
  };

  const handleEditMilestone = (updatedMilestone: TimelineMilestone) => {
    setMilestones((prev) => prev.map((m) => (m.id === updatedMilestone.id ? updatedMilestone : m)));
    memoryStorage.updateMilestoneAsync(updatedMilestone);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    memoryStorage.deleteMilestoneAsync(id);
  };

  // Generic Open Creator
  const handleOpenCreator = (type?: 'media' | 'letter' | 'note' | 'audio' | 'story') => {
    if (type === 'letter') {
      setEditLetter(null);
      setIsLetterModalOpen(true);
    } else if (type === 'note') {
      setEditNote(null);
      setIsNoteModalOpen(true);
    } else if (type === 'audio') {
      setIsAudioModalOpen(true);
    } else if (type === 'story') {
      setCurrentTab('timeline');
    } else {
      setIsUploadOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b18] text-white font-sans selection:bg-pink-500/30 selection:text-pink-200 overflow-x-hidden">
      {/* 1. Top-Right Audio Player Bar (when logged in) */}
      {isAuthenticated && !showWelcome && (
        <AudioPlayerBar
          tracks={audios}
          currentTrackIndex={currentTrackIndex}
          onTrackChange={(idx) => setCurrentTrackIndex(idx)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      )}

      {/* 2. Main Views & Route Transitions */}
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
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'home' && (
                <HomePage
                  gallery={gallery}
                  letters={letters}
                  notes={notes}
                  audios={audios}
                  onNavigate={setCurrentTab}
                  onOpenUpload={handleOpenCreator}
                  onSelectLetter={() => {
                    setCurrentTab('letters');
                  }}
                  onSelectMedia={() => {
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
                <TimelinePage
                  gallery={gallery}
                  letters={letters}
                  notes={notes}
                  audios={audios}
                  milestones={milestones}
                  onOpenUpload={handleOpenCreator}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* 3. Floating Glassmorphism Navigation Bar */}
      {isAuthenticated && !showWelcome && (
        <FloatingNavBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenUpload={handleOpenCreator}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 4. Modals & Forms */}
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
