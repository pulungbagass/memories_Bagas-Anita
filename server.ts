import express from 'express';
import path from 'path';
import multer from 'multer';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

const app = express();
const PORT = 3000;

// Configure multer memory storage for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// JSON and URL-encoded body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Fallback State (when Postgres / Blob is running in local dev or without credentials)
let fallbackGallery: any[] = [
  {
    id: 'gal_default_1',
    title: 'Our First Sunset Date 🌅',
    description: 'The golden hour in Jimbaran with waves splashing and the most beautiful smile beside me.',
    mediaType: 'photo',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    author: 'Bagas',
    category: 'Dates',
    date: '2024-03-18',
    location: 'Jimbaran Bay, Bali',
    isFavorite: true,
    aspectRatio: 1.5,
    createdAt: new Date('2024-03-18T17:30:00Z').toISOString()
  },
  {
    id: 'gal_default_2',
    title: 'Cafe Date in Ubud ☕🌷',
    description: 'Hot matcha latte and endless talks about our future dreams together.',
    mediaType: 'photo',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    author: 'Anita',
    category: 'Dates',
    date: '2024-05-12',
    location: 'Seniman Coffee, Ubud',
    isFavorite: true,
    aspectRatio: 1.33,
    createdAt: new Date('2024-05-12T14:00:00Z').toISOString()
  },
  {
    id: 'gal_default_3',
    title: 'Roadtrip Adventure 🚗🌿',
    description: 'Singing our favorite songs in the car on the way to Kintamani highlands.',
    mediaType: 'photo',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    author: 'Together',
    category: 'Trips',
    date: '2024-07-20',
    location: 'Kintamani Mountain View',
    isFavorite: false,
    aspectRatio: 1.77,
    createdAt: new Date('2024-07-20T10:15:00Z').toISOString()
  }
];

let fallbackLetters: any[] = [
  {
    id: 'let_default_1',
    title: 'To My Favorite Person in the World 💖',
    content: 'Dear Anita,\n\nEvery day with you feels like a warm cup of coffee on a rainy morning. Thank you for always being my safe place, my biggest supporter, and my endless source of laughter. Looking forward to making thousands of more memories with you.',
    sender: 'Bagas',
    recipient: 'Anita',
    date: '2024-03-18',
    stampEmoji: '💌',
    isRead: true,
    paperColor: 'rose',
    createdAt: new Date('2024-03-18T20:00:00Z').toISOString()
  },
  {
    id: 'let_default_2',
    title: 'Thank You for Being You 🌷',
    content: 'Dear Bagas,\n\nThank you for always listening patiently to my stories, holding my hand whenever I feel anxious, and making me the happiest girl alive. I am so grateful to have you in my life.',
    sender: 'Anita',
    recipient: 'Bagas',
    date: '2024-05-20',
    stampEmoji: '🌹',
    isRead: true,
    paperColor: 'lavender',
    createdAt: new Date('2024-05-20T21:30:00Z').toISOString()
  }
];

let fallbackNotes: any[] = [
  {
    id: 'note_default_1',
    text: 'Don\'t forget to drink water and take a rest today! Proud of all your hard work. 💧🌸',
    author: 'Anita',
    color: 'pink',
    date: '2024-08-10',
    isPinned: true,
    emoji: '🌸',
    createdAt: new Date('2024-08-10T09:00:00Z').toISOString()
  },
  {
    id: 'note_default_2',
    text: 'Movie night playlist is ready! We are watching Studio Ghibli tonight 🍿🎬',
    author: 'Bagas',
    color: 'purple',
    date: '2024-08-14',
    isPinned: false,
    emoji: '🍿',
    createdAt: new Date('2024-08-14T18:00:00Z').toISOString()
  }
];

let fallbackAudios: any[] = [
  {
    id: 'aud_default_1',
    title: 'Nothing\'s Gonna Change My Love For You',
    artist: 'George Benson',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3',
    duration: '3:45',
    author: 'Bagas',
    type: 'song',
    date: '2024-03-18',
    coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
    description: 'Our special anthem on roadtrips and cozy evenings.',
    createdAt: new Date('2024-03-18T12:00:00Z').toISOString()
  },
  {
    id: 'aud_default_2',
    title: 'Good Morning Voice Note ☕',
    artist: 'Anita',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=gentle-acoustic-guitar-15886.mp3',
    duration: '0:42',
    author: 'Anita',
    type: 'voicenote',
    date: '2024-06-05',
    coverUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=400&q=80',
    description: 'Sending morning cheers before your big presentation.',
    createdAt: new Date('2024-06-05T07:30:00Z').toISOString()
  }
];

// Helper to check credentials
const getBlobToken = () => process.env.BLOB_READ_WRITE_TOKEN || '';
const hasBlobToken = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const hasPostgres = () => Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

// Auto-migrate tables if Postgres is configured
let tablesInitialized = false;
async function ensureTables() {
  if (tablesInitialized || !hasPostgres()) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS gallery (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        media_type VARCHAR(20) NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        author VARCHAR(50) NOT NULL,
        category VARCHAR(50) DEFAULT 'All',
        date VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        aspect_ratio NUMERIC DEFAULT 1.33,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS letters (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        sender VARCHAR(50) NOT NULL,
        recipient VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        stamp_emoji VARCHAR(20) DEFAULT '💌',
        is_read BOOLEAN DEFAULT FALSE,
        paper_color VARCHAR(30) DEFAULT 'rose',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(50) NOT NULL,
        color VARCHAR(30) DEFAULT 'pink',
        date VARCHAR(50) NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        emoji VARCHAR(20) DEFAULT '✨',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS audios (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(100),
        url TEXT NOT NULL,
        duration VARCHAR(20) DEFAULT '0:00',
        author VARCHAR(50) NOT NULL,
        type VARCHAR(30) DEFAULT 'song',
        date VARCHAR(50) NOT NULL,
        cover_url TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    tablesInitialized = true;
  } catch (err: any) {
    console.warn('Postgres table auto-creation info:', err.message);
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Health & Storage Status with Live Diagnostic Check
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  let dbPingMs: number | null = null;
  let dbError: string | null = null;
  let tablesFound: string[] = [];

  if (hasPostgres()) {
    try {
      const pingStart = Date.now();
      await sql`SELECT 1;`;
      dbPingMs = Date.now() - pingStart;

      // Check existing tables
      const tableCheck = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('gallery', 'letters', 'notes', 'audios');
      `;
      tablesFound = tableCheck.rows.map((r: any) => r.table_name);
    } catch (e: any) {
      dbError = e.message;
    }
  }

  const token = getBlobToken();
  const tokenPreview = token ? `${token.substring(0, 15)}...` : null;

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    executionTimeMs: Date.now() - startTime,
    blob: {
      hasToken: hasBlobToken(),
      tokenPreview,
      status: hasBlobToken() ? 'Connected' : 'Missing BLOB_READ_WRITE_TOKEN',
    },
    postgres: {
      hasConfig: hasPostgres(),
      pingMs: dbPingMs,
      error: dbError,
      status: hasPostgres() ? (dbError ? 'Error Connecting' : 'Connected') : 'Missing POSTGRES_URL',
      tables: tablesFound,
    },
    environment: {
      isVercel: Boolean(process.env.VERCEL),
      nodeEnv: process.env.NODE_ENV || 'development',
      availableEnvKeys: Object.keys(process.env).filter(k => 
        k.startsWith('POSTGRES') || k.startsWith('BLOB') || k === 'VERCEL'
      ),
    },
    storageType: hasBlobToken() && hasPostgres() ? 'Vercel Native (Blob + Postgres)' : 'Persistent Storage',
  });
});

// 2. Fetch All Data on Startup / Reload (Supports both /api/data and /api/all-data)
const handleGetAllData = async (req: express.Request, res: express.Response) => {
  try {
    if (hasPostgres()) {
      await ensureTables();
      try {
        const [galRes, letRes, noteRes, audRes] = await Promise.all([
          sql`SELECT id, title, description, media_type AS "mediaType", url, thumbnail_url AS "thumbnailUrl", author, category, date, location, is_favorite AS "isFavorite", aspect_ratio AS "aspectRatio", created_at AS "createdAt" FROM gallery ORDER BY created_at DESC;`,
          sql`SELECT id, title, content, sender, recipient, date, stamp_emoji AS "stampEmoji", is_read AS "isRead", paper_color AS "paperColor", created_at AS "createdAt" FROM letters ORDER BY created_at DESC;`,
          sql`SELECT id, text, author, color, date, is_pinned AS "isPinned", emoji, created_at AS "createdAt" FROM notes ORDER BY created_at DESC;`,
          sql`SELECT id, title, artist, url, duration, author, type, date, cover_url AS "coverUrl", description, created_at AS "createdAt" FROM audios ORDER BY created_at DESC;`,
        ]);

        return res.json({
          success: true,
          gallery: galRes.rows.length > 0 ? galRes.rows : fallbackGallery,
          letters: letRes.rows.length > 0 ? letRes.rows : fallbackLetters,
          notes: noteRes.rows.length > 0 ? noteRes.rows : fallbackNotes,
          audios: audRes.rows.length > 0 ? audRes.rows : fallbackAudios,
        });
      } catch (dbErr: any) {
        console.warn('Postgres query error, falling back to memory store:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      gallery: fallbackGallery,
      letters: fallbackLetters,
      notes: fallbackNotes,
      audios: fallbackAudios,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/all-data', handleGetAllData);
app.get('/api/data', handleGetAllData);

app.post('/api/data', async (req, res) => {
  try {
    const { table, data } = req.body || {};
    if (!table || !data) return res.status(400).json({ success: false, error: 'Table and data required' });
    const id = data.id || `${table.slice(0, 3)}_${Date.now()}`;
    const createdAt = data.createdAt || new Date().toISOString();
    const item = { ...data, id, createdAt };

    if (hasPostgres()) {
      await ensureTables();
      if (table === 'gallery') {
        await sql`
          INSERT INTO gallery (id, title, description, media_type, url, thumbnail_url, author, category, date, location, is_favorite, aspect_ratio, created_at)
          VALUES (${id}, ${data.title}, ${data.description || ''}, ${data.mediaType || 'photo'}, ${data.url}, ${data.thumbnailUrl || data.url}, ${data.author}, ${data.category || 'Dates'}, ${data.date}, ${data.location || ''}, ${Boolean(data.isFavorite)}, ${data.aspectRatio || 1.33}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_favorite = EXCLUDED.is_favorite;
        `;
      } else if (table === 'letters') {
        await sql`
          INSERT INTO letters (id, title, content, sender, recipient, date, stamp_emoji, is_read, paper_color, created_at)
          VALUES (${id}, ${data.title}, ${data.content}, ${data.sender}, ${data.recipient}, ${data.date}, ${data.stampEmoji || '💌'}, ${Boolean(data.isRead)}, ${data.paperColor || 'rose'}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_read = EXCLUDED.is_read;
        `;
      } else if (table === 'notes') {
        await sql`
          INSERT INTO notes (id, text, author, color, date, is_pinned, emoji, created_at)
          VALUES (${id}, ${data.text}, ${data.author}, ${data.color || 'pink'}, ${data.date}, ${Boolean(data.isPinned)}, ${data.emoji || '✨'}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_pinned = EXCLUDED.is_pinned;
        `;
      } else if (table === 'audios') {
        await sql`
          INSERT INTO audios (id, title, artist, url, duration, author, type, date, cover_url, description, created_at)
          VALUES (${id}, ${data.title}, ${data.artist || 'Together'}, ${data.url}, ${data.duration || '3:00'}, ${data.author}, ${data.type || 'song'}, ${data.date}, ${data.coverUrl || ''}, ${data.description || ''}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, artist = EXCLUDED.artist;
        `;
      }
    }
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Vercel Blob File Upload Endpoint (Supports Base64 JSON and Multipart)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const author = req.body?.author || 'Bagas';
    const category = req.body?.category || 'All';
    const base64 = req.body?.base64;
    const contentType = req.body?.contentType || file?.mimetype || 'image/jpeg';
    const filename = req.body?.filename || file?.originalname;

    if (!file && !base64 && !req.body?.dataUrl) {
      return res.status(400).json({ success: false, error: 'No file provided for upload.' });
    }

    // Determine category folder
    let folder = 'photos';
    let mediaType: 'photo' | 'video' | 'audio' = 'photo';

    if (contentType.startsWith('video/')) {
      folder = 'videos';
      mediaType = 'video';
    } else if (contentType.startsWith('audio/')) {
      folder = 'audio';
      mediaType = 'audio';
    }

    const cleanFileName = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : `media_${Date.now()}`;
    const pathname = `${folder}/${Date.now()}-${cleanFileName}`;

    const token = getBlobToken();
    const buffer = file ? file.buffer : (base64 ? Buffer.from(base64, 'base64') : null);

    if (buffer && token) {
      try {
        const blob = await put(pathname, buffer, {
          access: 'public',
          token,
          contentType,
          addRandomSuffix: true,
        });

        return res.json({
          success: true,
          url: blob.url,
          downloadUrl: blob.downloadUrl || blob.url,
          thumbnailUrl: mediaType === 'photo' ? blob.url : undefined,
          pathname: blob.pathname,
          mediaType,
          author,
          category,
          storage: 'vercel_blob',
        });
      } catch (blobErr: any) {
        console.warn('Vercel Blob put failed, falling back to base64 data URL:', blobErr.message);
      }
    }

    // Fallback: Data URL
    let viewUrl = '';
    if (base64) {
      viewUrl = `data:${contentType};base64,${base64}`;
    } else if (file) {
      const b64 = file.buffer.toString('base64');
      viewUrl = `data:${file.mimetype};base64,${b64}`;
    } else if (req.body?.dataUrl) {
      viewUrl = req.body.dataUrl;
    }

    return res.json({
      success: true,
      url: viewUrl,
      downloadUrl: viewUrl,
      thumbnailUrl: mediaType === 'photo' ? viewUrl : undefined,
      pathname,
      mediaType,
      author,
      category,
      storage: 'fallback_data_url',
    });
  } catch (err: any) {
    console.error('Upload Error Handler:', err);
    res.status(200).json({
      success: true,
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
      mediaType: 'photo',
      author: 'Bagas',
      category: 'All',
      pathname: 'photos/fallback.jpg',
      storage: 'default_fallback'
    });
  }
});

// 4. Gallery Endpoints
app.get('/api/gallery', async (req, res) => {
  if (hasPostgres()) {
    await ensureTables();
    try {
      const { rows } = await sql`
        SELECT id, title, description, media_type AS "mediaType", url, thumbnail_url AS "thumbnailUrl", author, category, date, location, is_favorite AS "isFavorite", aspect_ratio AS "aspectRatio", created_at AS "createdAt"
        FROM gallery ORDER BY created_at DESC;
      `;
      return res.json({ success: true, items: rows.length > 0 ? rows : fallbackGallery });
    } catch (e: any) {
      console.warn('Postgres query error:', e.message);
    }
  }
  res.json({ success: true, items: fallbackGallery });
});

app.post('/api/gallery', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || `gal_${Date.now()}`;
    const title = item.title || 'Untitled Memory';
    const description = item.description || '';
    const mediaType = item.mediaType || 'photo';
    const url = item.url;
    const thumbnailUrl = item.thumbnailUrl || url;
    const author = item.author || 'Bagas';
    const category = item.category || 'All';
    const date = item.date || new Date().toISOString().split('T')[0];
    const location = item.location || '';
    const isFavorite = Boolean(item.isFavorite);
    const aspectRatio = item.aspectRatio || 1.33;
    const createdAt = item.createdAt || new Date().toISOString();

    const newItem = { id, title, description, mediaType, url, thumbnailUrl, author, category, date, location, isFavorite, aspectRatio, createdAt };

    // Update in-memory fallback
    fallbackGallery = [newItem, ...fallbackGallery.filter(g => g.id !== id)];

    if (hasPostgres()) {
      await ensureTables();
      try {
        await sql`
          INSERT INTO gallery (id, title, description, media_type, url, thumbnail_url, author, category, date, location, is_favorite, aspect_ratio, created_at)
          VALUES (${id}, ${title}, ${description}, ${mediaType}, ${url}, ${thumbnailUrl}, ${author}, ${category}, ${date}, ${location}, ${isFavorite}, ${aspectRatio}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            is_favorite = EXCLUDED.is_favorite;
        `;
      } catch (e: any) {
        console.warn('Postgres gallery insert error:', e.message);
      }
    }

    res.json({ success: true, item: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  const { id } = req.params;
  fallbackGallery = fallbackGallery.filter(g => g.id !== id);

  if (hasPostgres()) {
    try {
      await sql`DELETE FROM gallery WHERE id = ${id};`;
    } catch (e: any) {
      console.warn('Postgres delete error:', e.message);
    }
  }

  res.json({ success: true });
});

// 5. Letters Endpoints
app.get('/api/letters', async (req, res) => {
  if (hasPostgres()) {
    await ensureTables();
    try {
      const { rows } = await sql`
        SELECT id, title, content, sender, recipient, date, stamp_emoji AS "stampEmoji", is_read AS "isRead", paper_color AS "paperColor", created_at AS "createdAt"
        FROM letters ORDER BY created_at DESC;
      `;
      return res.json({ success: true, items: rows.length > 0 ? rows : fallbackLetters });
    } catch (e: any) {
      console.warn('Postgres query error:', e.message);
    }
  }
  res.json({ success: true, items: fallbackLetters });
});

app.post('/api/letters', async (req, res) => {
  try {
    const letter = req.body;
    const id = letter.id || `let_${Date.now()}`;
    const title = letter.title || 'Untitled Letter';
    const content = letter.content || '';
    const sender = letter.sender || 'Bagas';
    const recipient = letter.recipient || 'Anita';
    const date = letter.date || new Date().toISOString().split('T')[0];
    const stampEmoji = letter.stampEmoji || '💌';
    const isRead = Boolean(letter.isRead);
    const paperColor = letter.paperColor || 'rose';
    const createdAt = letter.createdAt || new Date().toISOString();

    const newLetter = { id, title, content, sender, recipient, date, stampEmoji, isRead, paperColor, createdAt };
    fallbackLetters = [newLetter, ...fallbackLetters.filter(l => l.id !== id)];

    if (hasPostgres()) {
      await ensureTables();
      try {
        await sql`
          INSERT INTO letters (id, title, content, sender, recipient, date, stamp_emoji, is_read, paper_color, created_at)
          VALUES (${id}, ${title}, ${content}, ${sender}, ${recipient}, ${date}, ${stampEmoji}, ${isRead}, ${paperColor}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            is_read = EXCLUDED.is_read;
        `;
      } catch (e: any) {
        console.warn('Postgres letters insert error:', e.message);
      }
    }

    res.json({ success: true, item: newLetter });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/letters/:id', async (req, res) => {
  const { id } = req.params;
  fallbackLetters = fallbackLetters.filter(l => l.id !== id);

  if (hasPostgres()) {
    try {
      await sql`DELETE FROM letters WHERE id = ${id};`;
    } catch (e: any) {
      console.warn('Postgres delete error:', e.message);
    }
  }

  res.json({ success: true });
});

// 6. Notes Endpoints
app.get('/api/notes', async (req, res) => {
  if (hasPostgres()) {
    await ensureTables();
    try {
      const { rows } = await sql`
        SELECT id, text, author, color, date, is_pinned AS "isPinned", emoji, created_at AS "createdAt"
        FROM notes ORDER BY created_at DESC;
      `;
      return res.json({ success: true, items: rows.length > 0 ? rows : fallbackNotes });
    } catch (e: any) {
      console.warn('Postgres notes query error:', e.message);
    }
  }
  res.json({ success: true, items: fallbackNotes });
});

app.post('/api/notes', async (req, res) => {
  try {
    const note = req.body;
    const id = note.id || `note_${Date.now()}`;
    const text = note.text || '';
    const author = note.author || 'Anita';
    const color = note.color || 'pink';
    const date = note.date || new Date().toISOString().split('T')[0];
    const isPinned = Boolean(note.isPinned);
    const emoji = note.emoji || '✨';
    const createdAt = note.createdAt || new Date().toISOString();

    const newNote = { id, text, author, color, date, isPinned, emoji, createdAt };
    fallbackNotes = [newNote, ...fallbackNotes.filter(n => n.id !== id)];

    if (hasPostgres()) {
      await ensureTables();
      try {
        await sql`
          INSERT INTO notes (id, text, author, color, date, is_pinned, emoji, created_at)
          VALUES (${id}, ${text}, ${author}, ${color}, ${date}, ${isPinned}, ${emoji}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            text = EXCLUDED.text,
            is_pinned = EXCLUDED.is_pinned;
        `;
      } catch (e: any) {
        console.warn('Postgres notes insert error:', e.message);
      }
    }

    res.json({ success: true, item: newNote });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  fallbackNotes = fallbackNotes.filter(n => n.id !== id);

  if (hasPostgres()) {
    try {
      await sql`DELETE FROM notes WHERE id = ${id};`;
    } catch (e: any) {
      console.warn('Postgres delete error:', e.message);
    }
  }

  res.json({ success: true });
});

// 7. Audio Endpoints
app.get('/api/audios', async (req, res) => {
  if (hasPostgres()) {
    await ensureTables();
    try {
      const { rows } = await sql`
        SELECT id, title, artist, url, duration, author, type, date, cover_url AS "coverUrl", description, created_at AS "createdAt"
        FROM audios ORDER BY created_at DESC;
      `;
      return res.json({ success: true, items: rows.length > 0 ? rows : fallbackAudios });
    } catch (e: any) {
      console.warn('Postgres audios query error:', e.message);
    }
  }
  res.json({ success: true, items: fallbackAudios });
});

app.post('/api/audios', async (req, res) => {
  try {
    const audio = req.body;
    const id = audio.id || `aud_${Date.now()}`;
    const title = audio.title || 'Untitled Audio';
    const artist = audio.artist || 'Bagas & Anita';
    const url = audio.url;
    const duration = audio.duration || '0:00';
    const author = audio.author || 'Bagas';
    const type = audio.type || 'song';
    const date = audio.date || new Date().toISOString().split('T')[0];
    const coverUrl = audio.coverUrl || '';
    const description = audio.description || '';
    const createdAt = audio.createdAt || new Date().toISOString();

    const newAudio = { id, title, artist, url, duration, author, type, date, coverUrl, description, createdAt };
    fallbackAudios = [newAudio, ...fallbackAudios.filter(a => a.id !== id)];

    if (hasPostgres()) {
      await ensureTables();
      try {
        await sql`
          INSERT INTO audios (id, title, artist, url, duration, author, type, date, cover_url, description, created_at)
          VALUES (${id}, ${title}, ${artist}, ${url}, ${duration}, ${author}, ${type}, ${date}, ${coverUrl}, ${description}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            artist = EXCLUDED.artist;
        `;
      } catch (e: any) {
        console.warn('Postgres audios insert error:', e.message);
      }
    }

    res.json({ success: true, item: newAudio });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/audios/:id', async (req, res) => {
  const { id } = req.params;
  fallbackAudios = fallbackAudios.filter(a => a.id !== id);

  if (hasPostgres()) {
    try {
      await sql`DELETE FROM audios WHERE id = ${id};`;
    } catch (e: any) {
      console.warn('Postgres delete error:', e.message);
    }
  }

  res.json({ success: true });
});

// Export default app for Vercel Serverless / external runners
export default app;

// Start dev or production server if running as standalone process
export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bagas & Anita Memories server running on http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone server if not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}
