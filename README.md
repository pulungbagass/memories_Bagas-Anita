# 💖 Bagas & Anita - Our Digital Memories & Love Sanctuary

Aplikasi web kenangan interaktif personal yang dirancang dengan estetika modern **Glassmorphism**, atmosfer malam berbintang romantis, animasi halus, pemutar musik persisten, galeri foto & video, surat cinta digital, serta catatan kenangan.

---

## 📖 Daftar Isi
1. [Tentang Web Ini](#-tentang-web-ini)
2. [Fitur-Fitur Utama](#-fitur-fitur-utama)
3. [Informasi Kredensial & Akses](#-informasi-kredensial--akses)
4. [Panduan: Mengaktifkan Kembali Time Anniversary / Counter Jadian](#-panduan-mengaktifkan-kembali-time-anniversary--counter-jadian)
5. [Panduan: Mengganti Tujuan Tombol "Buka Album Kenangan"](#-panduan-mengganti-tujuan-tombol-buka-album-kenangan)
6. [Panduan: Mengganti Tujuan Tombol "Explore Our Memories"](#-panduan-mengganti-tujuan-tombol-explore-our-memories)
7. [Daftar ID Tab / Halaman yang Tersedia](#-daftar-id-tab--halaman-yang-tersedia)
8. [Struktur Folder & Berkas Penting](#-struktur-folder--berkas-penting)
9. [Panduan Menjalankan di Lokal (VS Code) & Deploy ke Vercel](#-panduan-menjalankan-di-lokal-vs-code--deploy-ke-vercel)

---

## 🌟 Tentang Web Ini

Web ini dibuat sebagai tempat istimewa (*digital sanctuary*) untuk mengabadikan setiap momen, foto, lagu kenangan, dan pesan cinta antara **Bagas & Anita**. 

Web ini mengedepankan pengalaman visual yang intim dan menyenangkan:
- **Desain UI Elegan**: Palet warna *deep cosmic purple/navy* (`#0b0b18`), aksen *glowing pink/rose*, efek kaca (*frosted glass*), dan partikel konfeti animasi.
- **Proteksi Masuk Personal**: Menggunakan halaman sandi (*passcode protection*) sebelum dapat melihat isi album kenangan.
- **Transisi Mulus**: Transisi antar halaman dikelola menggunakan animasi `motion` yang lembut tanpa *hard reload*.
- **Audio Persisten**: Musik kenangan tetap berputar tanpa terputus ketika berpindah antar halaman atau melihat galeri.

---

## ✨ Fitur-Fitur Utama

- 🔐 **Passcode Login Screen**: Gerbang pembuka berkeamanan kata sandi interaktif.
- 🌸 **Welcome Sanctuary Page**: Sambutan personal dengan kutipan romantis dan tombol ajakan eksplorasi bertabur animasi konfeti.
- 📸 **Masonry Photo & Video Gallery**: Galeri media dengan kategorisasi (*Dates, Trips, Daily, Special*), tombol favorit, dan Lightbox modal interaktif untuk melihat foto/video resolusi penuh.
- 💌 **Virtual Love Letters**: Koleksi surat cinta interaktif dengan amplop khusus, pilihan warna kertas surat (*rose, amber, lavender, sky, emerald*), dan editor pembuatan surat baru.
- 📌 **Colorful Sticky Notes**: Papan catatan kenangan manis warna-warni yang dapat disematkan (*pin*).
- 🎵 **Persistent Audio Player & Music Library**: Pemutar musik melayang (*floating player*) di pojok kanan atas dengan kontrol timeline, volume, play/pause, dan dukungan untuk YouTube, SoundCloud, serta file audio langsung.
- ⏳ **Milestone Counter (Siap Diaktifkan)**: Modul penghitung hari, jam, menit, dan detik kebersamaan secara *real-time* (saat ini dinonaktifkan sementara dan siap diaktifkan saat jadian).
- ⚙️ **Data Persistence & Storage**: Mendukung penyimpanan lokal (*localStorage*) dan siap disinkronkan ke Supabase, Vercel Postgres, maupun Vercel Blob.

---

## 🔑 Informasi Kredensial & Akses

- **Password Masuk Saat Ini:**
  ```text
  bagas ganteng banget
  ```
- **Lokasi Kode Password:**
  - `src/components/pages/LoginPage.tsx` (Validasi input dan teks petunjuk)
  - `src/lib/storage.ts` (`hardcodedPassword`)
  - `src/components/ui/SettingsModal.tsx` (Tampilan master password)

---

## ⏳ Panduan: Mengaktifkan Kembali Time Anniversary / Counter Jadian

Saat ini seluruh elemen tanggal jadian, hitungan hari bersama (*Milestone Counter*), dan label `Est. 2022` telah di-comment rapi agar tidak menampilkan tanggal sembarangan.

Jika nanti kamu sudah resmi jadian dan ingin mengaktifkannya kembali, cukup ikuti langkah mudah berikut lewat **VS Code**:

### Langkah 1: Atur Tanggal di `src/lib/storage.ts`
Buka file `src/lib/storage.ts` pada baris ke-8 s/d 11:
```ts
// Ganti nilai startDate dan anniversaryDate dengan tanggal jadian kalian:
startDate: '2025-05-20',       // Format: YYYY-MM-DD
anniversaryDate: '05-20',      // Format: MM-DD
```

### Langkah 2: Atur Default Date di `src/components/welcome/MilestoneCounter.tsx`
Buka file `src/components/welcome/MilestoneCounter.tsx`:
1. Pada baris ~11, isi nilai default tanggal:
   ```tsx
   startDateStr = '2025-05-20' // Sesuaikan dengan tanggal jadian
   ```
2. Pada baris ~58, uncomment teks judul:
   ```tsx
   <CalendarHeart className="w-4 h-4 text-pink-400" />
   <span>Loving Each Other Since 20 Mei 2025</span>
   ```

### Langkah 3: Tampilkan Komponen di `src/components/pages/WelcomePage.tsx`
Buka file `src/components/pages/WelcomePage.tsx`:
1. Hapus tanda komentar pada import di baris ke-3:
   ```tsx
   import { MilestoneCounter } from '../welcome/MilestoneCounter';
   ```
2. Hapus tanda komentar pada props `startDate` di baris ~9 dan ~16:
   ```tsx
   startDate?: string;
   ...
   startDate = '2025-05-20',
   ```
3. Hapus tanda komentar pada blok JSX counter di baris ~32-34:
   ```tsx
   {/* 2. Live Relationship Counter */}
   <MilestoneCounter startDateStr={startDate} />
   ```

### Langkah 4: Hubungkan ke `src/App.tsx`
Buka file `src/App.tsx` pada baris ~210:
Uncomment properti `startDate` pada `<WelcomePage />`:
```tsx
<WelcomePage
  onContinue={() => setShowWelcome(false)}
  startDate="2025-05-20" // Tanggal resmi kalian
  partner1Name="Bagas"
  partner2Name="Anita"
/>
```

### Langkah 5 (Opsional): Tampilkan Tahun di `src/components/pages/HomePage.tsx`
Buka file `src/components/pages/HomePage.tsx` pada baris ~65:
Uncomment tulisan `Est.` sesuai tahun kalian:
```tsx
<span className="text-xs sm:text-sm font-mono text-slate-300">
  Est. 2025 • {gallery.length} Moments
</span>
```

---

## 🚪 Panduan: Mengganti Tujuan Tombol "Buka Album Kenangan"

Tombol **"Buka Album Kenangan"** berada di halaman login (`src/components/pages/LoginPage.tsx`), sedangkan logika yang menentukan halaman mana yang terbuka setelah login sukses berada di `src/App.tsx`.

### 1. Lokasi Berkas:
- Tombol: `src/components/pages/LoginPage.tsx` (baris ~95-103)
- Logika Navigasi: `src/App.tsx` fungsi `handleLoginSuccess()` (baris ~77-81)

### 2. Skenario Perubahan di `src/App.tsx`:

#### Skenario A: Langsung Masuk ke Home Dashboard (Lewati Welcome Page)
Ubah `setShowWelcome(true)` menjadi `setShowWelcome(false)`:
```ts
const handleLoginSuccess = () => {
  memoryStorage.setAuthenticated(true);
  setIsAuthenticated(true);
  setShowWelcome(false); // Langsung ke Dashboard Beranda
};
```

#### Skenario B: Langsung Masuk ke Galeri Foto, Surat Cinta, atau Musik
Tambahkan perubahan `currentTab`:
```ts
const handleLoginSuccess = () => {
  memoryStorage.setAuthenticated(true);
  setIsAuthenticated(true);
  setShowWelcome(false);
  setCurrentTab('gallery'); // Pilih: 'gallery', 'letters', 'music', 'notes', atau 'story'
};
```

#### Skenario C: Redirect ke Link / Website Luar
```ts
const handleLoginSuccess = () => {
  window.location.href = 'https://link-tujuan-kamu.com';
};
```

---

## 💖 Panduan: Mengganti Tujuan Tombol "Explore Our Memories"

Tombol **"Explore Our Memories 💖"** adalah tombol utama di bagian bawah `WelcomePage`.

### 1. Lokasi Berkas:
- Komponen Tombol: `src/components/welcome/ContinueButton.tsx`
- Penggunaan di Halaman: `src/components/pages/WelcomePage.tsx` (baris ~43-46)
- Logika Tujuan saat Diklik: `src/App.tsx` (baris ~210-215)

### 2. Cara Mengubah Teks & Ikon Tombol:
Buka `src/components/pages/WelcomePage.tsx`:
```tsx
<ContinueButton
  onContinue={onContinue}
  buttonLabel="Buka Rahasia Kita ✨" // Ganti teks label sesukamu
/>
```

### 3. Cara Mengubah Tujuan Halaman Saat Tombol Diklik:
Buka `src/App.tsx` pada baris ~210-215:

#### Buka Tab Tertentu (Misal: Galeri Foto):
```tsx
<WelcomePage
  onContinue={() => {
    setShowWelcome(false);
    setCurrentTab('gallery'); // Mengarahkan langsung ke galeri foto
  }}
  partner1Name="Bagas"
  partner2Name="Anita"
/>
```

#### Buka Tab Surat Cinta:
```tsx
<WelcomePage
  onContinue={() => {
    setShowWelcome(false);
    setCurrentTab('letters'); // Mengarahkan ke surat cinta
  }}
  partner1Name="Bagas"
  partner2Name="Anita"
/>
```

#### Putar Lagu Tertentu Secara Otomatis Saat Tombol Diklik:
Kamu juga bisa memicu pemutaran musik saat tombol ditekan dengan memanggil fungsi `play()` dari `useAudio()`.

---

## 📑 Daftar ID Tab / Halaman yang Tersedia

Kamu dapat mengarahkan `setCurrentTab(tabName)` ke salah satu tab berikut:
| Nama Tab (`currentTab`) | Keterangan Halaman |
| :--- | :--- |
| `'home'` | Beranda utama, rangkuman momen, kutipan cinta, dan widget cepat |
| `'gallery'` | Album foto & video masonry dengan filter kategori |
| `'letters'` | Lemari surat cinta romantis dengan kertas custom & modal baca |
| `'notes'` | Papan catatan tempel (*sticky notes*) manis |
| `'music'` | Perpustakaan musik romantis & daftar lagu kenangan |
| `'story'` | Linimasa perjalanan (*Journey Timeline*) dari awal pertemuan |

---

## 📁 Struktur Folder & Berkas Penting

```text
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        # Halaman Login / Passcode
│   │   │   ├── WelcomePage.tsx      # Halaman Sambutan / Welcome Sanctuary
│   │   │   ├── HomePage.tsx         # Dashboard Beranda Utama
│   │   │   ├── GalleryPage.tsx      # Galeri Foto & Video
│   │   │   ├── LettersPage.tsx      # Halaman Surat Cinta
│   │   │   ├── NotesPage.tsx        # Halaman Sticky Notes
│   │   │   ├── MusicPage.tsx        # Perpustakaan Musik
│   │   │   └── StoryPage.tsx        # Linimasa Momen Kenangan
│   │   ├── welcome/
│   │   │   ├── WelcomeHeader.tsx    # Header sapaan di Welcome Page
│   │   │   ├── MilestoneCounter.tsx # Penghitung waktu jadian real-time
│   │   │   ├── LoveQuoteCard.tsx    # Kartu kutipan cinta
│   │   │   └── ContinueButton.tsx   # Tombol Explore Our Memories + Konfeti
│   │   └── ui/
│   │       ├── AudioPlayerBar.tsx   # Pemutar musik melayang di kanan atas
│   │       ├── GlassCard.tsx        # Kartu efek kaca (Glassmorphism)
│   │       └── SettingsModal.tsx    # Modal pengaturan, backup data, & cloud
│   ├── context/
│   │   └── AudioContext.tsx         # Manajemen audio player global persisten
│   ├── lib/
│   │   └── storage.ts               # State lokal, mock data awal, & helper database
│   ├── types/
│   │   └── index.ts                 # Definisi tipe TypeScript (Gallery, Letter, Audio, dll.)
│   ├── App.tsx                      # Komponen utama penentu alur rute & state aplikasi
│   ├── main.tsx                     # Entry point React
│   └── index.css                    # Tailwind CSS 4 konfigurasi styling
├── server.ts                        # Express server pendukung & API endpoints
├── metadata.json                    # Metadata aplikasi
├── package.json                     # Daftar paket dan dependency
└── README.md                        # Dokumentasi panduan lengkap
```

---

## 🚀 Panduan Menjalankan di Lokal (VS Code) & Deploy ke Vercel

### 1. Menjalankan di Komputer Lokal (VS Code)
1. Buka folder proyek di **VS Code**.
2. Buka terminal (`Ctrl + ~` atau `Cmd + ~`), lalu install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Buka browser pada alamat `http://localhost:3000`.

### 2. Push ke GitHub
```bash
git add .
git commit -m "Update memories web application"
git push origin main
```

### 3. Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login.
2. Klik tombol **Add New Project** lalu pilih repository GitHub proyek ini.
3. Vercel akan otomatis mendeteksi framework **Vite**:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. (Opsional) Jika ingin menggunakan database cloud / penyimpanan media, tambahkan *Environment Variables* di dashboard Vercel:
   - `BLOB_READ_WRITE_TOKEN` (Untuk penyimpanan upload foto Vercel Blob)
   - `POSTGRES_URL` atau Supabase credentials jika menghubungkan database.
5. Klik **Deploy**. Website kenangan kamu dan Anita sudah online secara resmi!

---

*Dibuat dengan segenap cinta dan harapan terbaik untuk Bagas & Anita.* 🌸✨
