import {
  GalleryItem,
  LoveLetter,
  StickyNote,
  AudioMemory,
  TimelineMilestone,
  AppConfig,
} from "../types";

export const DEFAULT_CONFIG: AppConfig = {
  coupleNames: {
    partner1: "Bagas",
    partner2: "Anita",
  },
  startDate: "2022-04-16",
  anniversaryDate: "04-16",
  hardcodedPassword: "bagas ganteng banget",
  googleDriveFolderUrl: "",
  googleDriveFolderId: "",
};

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Sunset at Parangtritis Beach 🌅",
    description:
      "The golden hour was magical, but your smile was the brightest thing on the coast.",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    author: "Together",
    category: "Trips",
    date: "2023-07-22",
    location: "Yogyakarta",
    isFavorite: true,
    aspectRatio: 1.5,
    createdAt: new Date("2023-07-22T17:30:00Z").toISOString(),
  },
  {
    id: "gal-2",
    title: "First Coffee Date in Bandung ☕🤍",
    description:
      "We talked for 4 hours until the barista gently reminded us it was closing time!",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
    author: "Bagas",
    category: "Dates",
    date: "2022-04-16",
    location: "Kopi Toko Djawa, Braga",
    isFavorite: true,
    aspectRatio: 0.8,
    createdAt: new Date("2022-04-16T15:00:00Z").toISOString(),
  },
  {
    id: "gal-3",
    title: "Anita Laughing in the Rain 🌷✨",
    description:
      "We forgot the umbrella in the car, so we decided to dance in the rain instead.",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
    author: "Anita",
    category: "Daily",
    date: "2023-11-04",
    location: "Taman Kota",
    isFavorite: false,
    aspectRatio: 1.2,
    createdAt: new Date("2023-11-04T16:20:00Z").toISOString(),
  },
  {
    id: "gal-4",
    title: "Stargazing at Bromo Camp 🌌",
    description:
      "Wrapped in two blankets, drinking hot tea, pointing out constellations together under millions of stars.",
    mediaType: "photo",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    author: "Together",
    category: "Trips",
    date: "2024-02-14",
    location: "Mount Bromo",
    isFavorite: true,
    aspectRatio: 1.4,
    createdAt: new Date("2024-02-14T22:00:00Z").toISOString(),
  },
];

export const INITIAL_LETTERS: LoveLetter[] = [
  {
    id: "let-1",
    title: "To My Favorite Human, Anita 🤍",
    content: `Dear Anita,\n\nWhen I first met you on that rainy Tuesday, I never anticipated how deeply you would color my entire world. Your laugh is my favorite soundtrack, your patience my greatest comfort, and your kindness my daily inspiration.\n\nThank you for choosing me every day, even when I forget where I put my keys or sing off-key in the car. With you, every mundane day turns into a quiet celebration.\n\nAlways and forever yours,\nBagas 🤍`,
    sender: "Bagas",
    recipient: "Anita",
    date: "2024-04-16",
    stampEmoji: "💌",
    isRead: true,
    paperColor: "rose",
    createdAt: new Date("2024-04-16T20:00:00Z").toISOString(),
  },
  {
    id: "let-2",
    title: "A Little Reminder for Bagas 🌷",
    content: `Hai Bagas sayang,\n\nJust writing this quick note while you're focused working across the desk. I love watching how passionate you get about things. Don't forget to take a break, drink your water, and remember that I am always here rooting for you.\n\nYou make my heart feel so safe and happy.\n\nWith love,\nAnita 🌷`,
    sender: "Anita",
    recipient: "Bagas",
    date: "2024-06-20",
    stampEmoji: "🌸",
    isRead: true,
    paperColor: "lavender",
    createdAt: new Date("2024-06-20T19:30:00Z").toISOString(),
  },
];

export const INITIAL_NOTES: StickyNote[] = [
  {
    id: "note-1",
    text: "Jangan lupa minum vitamin & sarapan sebelum berangkat kerja ya mas! 🤍",
    author: "Anita",
    color: "pink",
    date: "2024-08-25",
    isPinned: true,
    emoji: "💊",
    createdAt: new Date("2024-08-25T08:30:00Z").toISOString(),
  },
  {
    id: "note-2",
    text: "Next weekend: Road trip to Dieng Plateau! Sudah siapin jaket tebal 🏔️✨",
    author: "Bagas",
    color: "purple",
    date: "2024-08-28",
    isPinned: true,
    emoji: "🚗",
    createdAt: new Date("2024-08-28T14:10:00Z").toISOString(),
  },
];

export const INITIAL_AUDIOS: AudioMemory[] = [
  {
    id: "aud-1",
    title: "Sampai Jadi Debu",
    artist: "Banda Neira",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112193.mp3",
    duration: "3:45",
    author: "Together",
    type: "song",
    date: "2022-04-16",
    coverUrl:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
    description:
      "Our eternal relationship anthem. Played in the car every time we watch the sunset.",
    createdAt: new Date("2022-04-16T12:00:00Z").toISOString(),
  },
  {
    id: "aud-2",
    title: "Good Morning Voice Note from Anita",
    artist: "Anita",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=romantic-piano-10875.mp3",
    duration: "0:42",
    author: "Anita",
    type: "voicenote",
    date: "2024-03-12",
    coverUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80",
    description:
      "Sent when Bagas had an important presentation in the morning.",
    createdAt: new Date("2024-03-12T07:15:00Z").toISOString(),
  },
];

export const INITIAL_MILESTONES: TimelineMilestone[] = [
  {
    id: "mile-1",
    title: "First Met at Campus Library",
    date: "2022-02-10",
    description:
      "Both reaching for the exact same book on the 3rd floor shelf. We smiled and exchanged numbers.",
    emoji: "📚",
    location: "Central Library",
    category: "Beginning",
  },
  {
    id: "mile-2",
    title: "First Coffee Date in Braga",
    date: "2022-03-05",
    description:
      "A simple coffee turned into walking through the vintage streets until midnight.",
    emoji: "☕",
    location: "Bandung",
    category: "Dates",
  },
  {
    id: "mile-3",
    title: "Official Day: We Said Yes 🤍",
    date: "2022-04-16",
    description:
      "Sitting under the gazebo after dinner, Bagas asked Anita to be his partner in life.",
    emoji: "💖",
    location: "Taman Bunga",
    category: "Anniversary",
  },
  {
    id: "mile-4",
    title: "First Vacation Together: Jogja",
    date: "2023-07-20",
    description:
      "3 days of exploring Malioboro, culinary adventures, and catching the sunset at Parangtritis.",
    emoji: "✈️",
    location: "Yogyakarta",
    category: "Travel",
  },
  {
    id: "mile-5",
    title: "2 Years of Joy & Countless Memories",
    date: "2024-04-16",
    description:
      "Celebrating 730 days of growth, patience, laughter, and unbreakable love.",
    emoji: "🥂",
    location: "Skyline Restaurant",
    category: "Anniversary",
  },
];

class StorageManager {
  private getStorageKey(key: string): string {
    return `bagas_anita_${key}`;
  }

  // Fetch all persistent data from Vercel Postgres / API
  async syncAllFromDatabase(): Promise<{
    gallery?: GalleryItem[];
    letters?: LoveLetter[];
    notes?: StickyNote[];
    audios?: AudioMemory[];
  }> {
    try {
      const res = await fetch("/api/all-data");
      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      if (data.success) {
        if (data.gallery) this.saveGallery(data.gallery);
        if (data.letters) this.saveLetters(data.letters);
        if (data.notes) this.saveNotes(data.notes);
        if (data.audios) this.saveAudios(data.audios);

        return {
          gallery: data.gallery,
          letters: data.letters,
          notes: data.notes,
          audios: data.audios,
        };
      }
    } catch (e) {
      console.warn("API sync fallback to localStorage:", e);
    }
    return {
      gallery: this.getGallery(),
      letters: this.getLetters(),
      notes: this.getNotes(),
      audios: this.getAudios(),
    };
  }

  // Gallery CRUD
  getGallery(): GalleryItem[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("gallery"));
      return data ? JSON.parse(data) : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  }

  saveGallery(items: GalleryItem[]): void {
    try {
      localStorage.setItem(
        this.getStorageKey("gallery"),
        JSON.stringify(items),
      );
    } catch (e) {
      console.error("Failed to save gallery to localStorage", e);
    }
  }

  async addGalleryItemAsync(item: GalleryItem): Promise<void> {
    const items = [item, ...this.getGallery().filter((i) => i.id !== item.id)];
    this.saveGallery(items);

    try {
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn("API gallery insert failed:", err);
    }
  }

  async deleteGalleryItemAsync(id: string): Promise<void> {
    const items = this.getGallery().filter((i) => i.id !== id);
    this.saveGallery(items);

    try {
      await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API gallery delete failed:", err);
    }
  }

  async updateGalleryItemAsync(item: GalleryItem): Promise<void> {
    const items = this.getGallery().map((i) => (i.id === item.id ? item : i));
    this.saveGallery(items);

    try {
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn("API gallery update failed:", err);
    }
  }

  // Letters CRUD
  getLetters(): LoveLetter[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("letters"));
      return data ? JSON.parse(data) : INITIAL_LETTERS;
    } catch {
      return INITIAL_LETTERS;
    }
  }

  saveLetters(items: LoveLetter[]): void {
    try {
      localStorage.setItem(
        this.getStorageKey("letters"),
        JSON.stringify(items),
      );
    } catch (e) {
      console.error("Failed to save letters", e);
    }
  }

  async addLetterAsync(letter: LoveLetter): Promise<void> {
    const items = [
      letter,
      ...this.getLetters().filter((l) => l.id !== letter.id),
    ];
    this.saveLetters(items);

    try {
      await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(letter),
      });
    } catch (err) {
      console.warn("API letter insert failed:", err);
    }
  }

  async deleteLetterAsync(id: string): Promise<void> {
    const items = this.getLetters().filter((l) => l.id !== id);
    this.saveLetters(items);

    try {
      await fetch(`/api/letters/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API letter delete failed:", err);
    }
  }

  async updateLetterAsync(letter: LoveLetter): Promise<void> {
    const items = this.getLetters().map((l) =>
      l.id === letter.id ? letter : l,
    );
    this.saveLetters(items);

    try {
      await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(letter),
      });
    } catch (err) {
      console.warn("API letter update failed:", err);
    }
  }

  // Notes CRUD
  getNotes(): StickyNote[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("notes"));
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  }

  saveNotes(items: StickyNote[]): void {
    try {
      localStorage.setItem(this.getStorageKey("notes"), JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save notes", e);
    }
  }

  async addNoteAsync(note: StickyNote): Promise<void> {
    const items = [note, ...this.getNotes().filter((n) => n.id !== note.id)];
    this.saveNotes(items);

    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
    } catch (err) {
      console.warn("API note insert failed:", err);
    }
  }

  async deleteNoteAsync(id: string): Promise<void> {
    const items = this.getNotes().filter((n) => n.id !== id);
    this.saveNotes(items);

    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API note delete failed:", err);
    }
  }

  async updateNoteAsync(note: StickyNote): Promise<void> {
    const items = this.getNotes().map((n) => (n.id === note.id ? note : n));
    this.saveNotes(items);

    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
    } catch (err) {
      console.warn("API note update failed:", err);
    }
  }

  // Audios CRUD
  getAudios(): AudioMemory[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("audios"));
      return data ? JSON.parse(data) : INITIAL_AUDIOS;
    } catch {
      return INITIAL_AUDIOS;
    }
  }

  saveAudios(items: AudioMemory[]): void {
    try {
      localStorage.setItem(this.getStorageKey("audios"), JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save audios", e);
    }
  }

  async addAudioAsync(audio: AudioMemory): Promise<void> {
    const items = [audio, ...this.getAudios().filter((a) => a.id !== audio.id)];
    this.saveAudios(items);

    try {
      await fetch("/api/audios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(audio),
      });
    } catch (err) {
      console.warn("API audio insert failed:", err);
    }
  }

  async deleteAudioAsync(id: string): Promise<void> {
    const items = this.getAudios().filter((a) => a.id !== id);
    this.saveAudios(items);

    try {
      await fetch(`/api/audios/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API audio delete failed:", err);
    }
  }

  // Milestones
  getMilestones(): TimelineMilestone[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("milestones"));
      return data ? JSON.parse(data) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  }

  // Auth & Session
  isAuthenticated(): boolean {
    try {
      return localStorage.getItem(this.getStorageKey("session")) === "true";
    } catch {
      return false;
    }
  }

  setAuthenticated(value: boolean): void {
    try {
      if (value) {
        localStorage.setItem(this.getStorageKey("session"), "true");
      } else {
        localStorage.removeItem(this.getStorageKey("session"));
      }
    } catch (e) {
      console.error("Failed to update session", e);
    }
  }

  // Reset to initial defaults
  resetToDefault(): void {
    try {
      localStorage.removeItem(this.getStorageKey("gallery"));
      localStorage.removeItem(this.getStorageKey("letters"));
      localStorage.removeItem(this.getStorageKey("notes"));
      localStorage.removeItem(this.getStorageKey("audios"));
    } catch (e) {
      console.error(e);
    }
  }
}

export const memoryStorage = new StorageManager();
