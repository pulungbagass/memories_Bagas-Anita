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
  // startDate: '2022-04-16', // (Uncomment dan isi tanggal jadian ketika sudah resmi ya! Format: YYYY-MM-DD)
  // anniversaryDate: '04-16', // (Uncomment dan isi tanggal jadian tahunan ya! Format: MM-DD)
  startDate: "",
  anniversaryDate: "",
  hardcodedPassword: "juni2026",
  googleDriveFolderUrl: "",
  googleDriveFolderId: "",
};

export const INITIAL_GALLERY: GalleryItem[] = [];

export const INITIAL_LETTERS: LoveLetter[] = [];

export const INITIAL_NOTES: StickyNote[] = [];

export const INITIAL_AUDIOS: AudioMemory[] = [];

export const INITIAL_MILESTONES: TimelineMilestone[] = [];

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
    milestones?: TimelineMilestone[];
  }> {
    try {
      // Try /api/data first, then fallback to /api/all-data
      let res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) {
        res = await fetch("/api/all-data", { cache: "no-store" });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.gallery)) this.saveGallery(data.gallery);
          if (Array.isArray(data.letters)) this.saveLetters(data.letters);
          if (Array.isArray(data.notes)) this.saveNotes(data.notes);
          if (Array.isArray(data.audios)) this.saveAudios(data.audios);
          if (Array.isArray(data.milestones))
            this.saveMilestones(data.milestones);

          return {
            gallery: Array.isArray(data.gallery)
              ? data.gallery
              : this.getGallery(),
            letters: Array.isArray(data.letters)
              ? data.letters
              : this.getLetters(),
            notes: Array.isArray(data.notes) ? data.notes : this.getNotes(),
            audios: Array.isArray(data.audios) ? data.audios : this.getAudios(),
            milestones: Array.isArray(data.milestones)
              ? data.milestones
              : this.getMilestones(),
          };
        }
      }
    } catch (e) {
      console.warn("API sync fallback to localStorage:", e);
    }
    return {
      gallery: this.getGallery(),
      letters: this.getLetters(),
      notes: this.getNotes(),
      audios: this.getAudios(),
      milestones: this.getMilestones(),
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
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "gallery", data: item }),
      });
    } catch (err) {
      console.warn("API gallery insert fallback:", err);
    }
  }

  async deleteGalleryItemAsync(id: string): Promise<void> {
    const items = this.getGallery().filter((i) => i.id !== id);
    this.saveGallery(items);

    try {
      await fetch(`/api/data?table=gallery&id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API gallery delete fallback:", err);
    }
  }

  async updateGalleryItemAsync(item: GalleryItem): Promise<void> {
    const items = this.getGallery().map((i) => (i.id === item.id ? item : i));
    this.saveGallery(items);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "gallery", data: item }),
      });
    } catch (err) {
      console.warn("API gallery update fallback:", err);
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
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "letters", data: letter }),
      });
    } catch (err) {
      console.warn("API letter insert fallback:", err);
    }
  }

  async deleteLetterAsync(id: string): Promise<void> {
    const items = this.getLetters().filter((l) => l.id !== id);
    this.saveLetters(items);

    try {
      await fetch(`/api/data?table=letters&id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API letter delete fallback:", err);
    }
  }

  async updateLetterAsync(letter: LoveLetter): Promise<void> {
    const items = this.getLetters().map((l) =>
      l.id === letter.id ? letter : l,
    );
    this.saveLetters(items);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "letters", data: letter }),
      });
    } catch (err) {
      console.warn("API letter update fallback:", err);
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
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "notes", data: note }),
      });
    } catch (err) {
      console.warn("API note insert fallback:", err);
    }
  }

  async deleteNoteAsync(id: string): Promise<void> {
    const items = this.getNotes().filter((n) => n.id !== id);
    this.saveNotes(items);

    try {
      await fetch(`/api/data?table=notes&id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API note delete fallback:", err);
    }
  }

  async updateNoteAsync(note: StickyNote): Promise<void> {
    const items = this.getNotes().map((n) => (n.id === note.id ? note : n));
    this.saveNotes(items);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "notes", data: note }),
      });
    } catch (err) {
      console.warn("API note update fallback:", err);
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
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "audios", data: audio }),
      });
    } catch (err) {
      console.warn("API audio insert fallback:", err);
    }
  }

  async deleteAudioAsync(id: string): Promise<void> {
    const items = this.getAudios().filter((a) => a.id !== id);
    this.saveAudios(items);

    try {
      await fetch(`/api/data?table=audios&id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API audio delete fallback:", err);
    }
  }

  // Milestones CRUD
  getMilestones(): TimelineMilestone[] {
    try {
      const data = localStorage.getItem(this.getStorageKey("milestones"));
      return data ? JSON.parse(data) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  }

  saveMilestones(items: TimelineMilestone[]): void {
    try {
      localStorage.setItem(
        this.getStorageKey("milestones"),
        JSON.stringify(items),
      );
    } catch (e) {
      console.error("Failed to save milestones", e);
    }
  }

  async addMilestoneAsync(milestone: TimelineMilestone): Promise<void> {
    const items = [
      milestone,
      ...this.getMilestones().filter((m) => m.id !== milestone.id),
    ];
    this.saveMilestones(items);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "milestones", data: milestone }),
      });
    } catch (err) {
      console.warn("API milestone insert fallback:", err);
    }
  }

  async deleteMilestoneAsync(id: string): Promise<void> {
    const items = this.getMilestones().filter((m) => m.id !== id);
    this.saveMilestones(items);

    try {
      await fetch(`/api/data?table=milestones&id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API milestone delete fallback:", err);
    }
  }

  async updateMilestoneAsync(milestone: TimelineMilestone): Promise<void> {
    const items = this.getMilestones().map((m) =>
      m.id === milestone.id ? milestone : m,
    );
    this.saveMilestones(items);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "milestones", data: milestone }),
      });
    } catch (err) {
      console.warn("API milestone update fallback:", err);
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
}

export const memoryStorage = new StorageManager();
