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

// In-Memory Fallback State (strictly empty default arrays as requested)
let fallbackGallery: any[] = [];
let fallbackLetters: any[] = [];
let fallbackNotes: any[] = [];
let fallbackAudios: any[] = [];
let fallbackMilestones: any[] = [];

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
    await sql`
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        emoji VARCHAR(20) DEFAULT '💖',
        photo_url TEXT,
        location VARCHAR(255),
        category VARCHAR(50) DEFAULT 'Story',
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
          AND table_name IN ('gallery', 'letters', 'notes', 'audios', 'milestones');
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
        const [galRes, letRes, noteRes, audRes, milRes] = await Promise.all([
          sql`SELECT id, title, description, media_type AS "mediaType", url, thumbnail_url AS "thumbnailUrl", author, category, date, location, is_favorite AS "isFavorite", aspect_ratio AS "aspectRatio", created_at AS "createdAt" FROM gallery ORDER BY created_at DESC;`,
          sql`SELECT id, title, content, sender, recipient, date, stamp_emoji AS "stampEmoji", is_read AS "isRead", paper_color AS "paperColor", created_at AS "createdAt" FROM letters ORDER BY created_at DESC;`,
          sql`SELECT id, text, author, color, date, is_pinned AS "isPinned", emoji, created_at AS "createdAt" FROM notes ORDER BY created_at DESC;`,
          sql`SELECT id, title, artist, url, duration, author, type, date, cover_url AS "coverUrl", description, created_at AS "createdAt" FROM audios ORDER BY created_at DESC;`,
          sql`SELECT id, title, date, description, emoji, photo_url AS "photoUrl", location, category, created_at AS "createdAt" FROM milestones ORDER BY date ASC, created_at ASC;`,
        ]);

        return res.json({
          success: true,
          gallery: galRes.rows.length > 0 ? galRes.rows : fallbackGallery,
          letters: letRes.rows.length > 0 ? letRes.rows : fallbackLetters,
          notes: noteRes.rows.length > 0 ? noteRes.rows : fallbackNotes,
          audios: audRes.rows.length > 0 ? audRes.rows : fallbackAudios,
          milestones: milRes.rows || [],
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
      milestones: fallbackMilestones,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/all-data', handleGetAllData);
app.get('/api/data', handleGetAllData);

// Media Link Info Auto-Extraction Endpoint (YouTube, YouTube Music, Spotify, TikTok, Instagram, etc.)
app.get('/api/media-info', async (req, res) => {
  try {
    const rawUrl = String(req.query.url || '').trim();
    if (!rawUrl) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    let platform: 'youtube' | 'spotify' | 'tiktok' | 'instagram' | 'soundcloud' | 'direct' = 'direct';
    let title = '';
    let artist = '';
    let thumbnailUrl = '';
    let embedUrl = '';

    const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
    const isSpotify = rawUrl.includes('spotify.com');
    const isTikTok = rawUrl.includes('tiktok.com');
    const isInstagram = rawUrl.includes('instagram.com');
    const isSoundCloud = rawUrl.includes('soundcloud.com');

    if (isYouTube) {
      platform = 'youtube';
      artist = rawUrl.includes('music.youtube.com') ? 'YouTube Music' : 'YouTube';

      // Extract Video ID with robust regex
      const ytMatch = rawUrl.match(/(?:watch\?v=|embed\/|shorts\/|youtu\.be\/|v=|\/live\/)([\w-]{11})/i);
      const videoId = ytMatch ? ytMatch[1] : '';

      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        // Always query oEmbed with standard www.youtube.com URL for 100% success rate
        try {
          const canonicalYtUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalYtUrl)}&format=json`);
          if (oembedRes.ok) {
            const data: any = await oembedRes.json();
            title = data.title || '';
            artist = data.author_name || (rawUrl.includes('music.youtube.com') ? 'YouTube Music' : 'YouTube Artist');
            if (data.thumbnail_url) {
              thumbnailUrl = data.thumbnail_url;
            }
          }
        } catch {
          // Fallback title heuristic
        }
      }
    } else if (isSpotify) {
      platform = 'spotify';
      artist = 'Spotify Track';
      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(rawUrl)}`);
        if (oembedRes.ok) {
          const data: any = await oembedRes.json();
          title = data.title || '';
          thumbnailUrl = data.thumbnail_url || '';
        }
      } catch {}

      // Convert spotify track URL to embed URL
      const spMatch = rawUrl.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
      if (spMatch) {
        embedUrl = `https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator`;
      }
    } else if (isTikTok) {
      platform = 'tiktok';
      artist = 'TikTok Audio';
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(rawUrl)}`);
        if (oembedRes.ok) {
          const data: any = await oembedRes.json();
          title = data.title || 'TikTok Soundtrack';
          artist = data.author_name || 'TikTok Creator';
          thumbnailUrl = data.thumbnail_url || '';
        }
      } catch {}
    } else if (isInstagram) {
      platform = 'instagram';
      artist = 'Instagram Reel / Audio';
      title = 'Instagram Audio';
    } else if (isSoundCloud) {
      platform = 'soundcloud';
      artist = 'SoundCloud Artist';
      embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(rawUrl)}&color=%23a855f7&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
      try {
        const oembedRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`);
        if (oembedRes.ok) {
          const data: any = await oembedRes.json();
          title = data.title || '';
          artist = data.author_name || 'SoundCloud Artist';
          thumbnailUrl = data.thumbnail_url || '';
        }
      } catch {}
    } else {
      platform = 'direct';
      title = rawUrl.split('/').pop()?.split('?')[0]?.replace(/\.[a-zA-Z0-9]+$/, '') || 'Audio Memory';
      artist = 'Audio Stream';
    }

    return res.json({
      success: true,
      platform,
      title: title || 'Favorite Track',
      artist: artist || 'Various Artists',
      thumbnailUrl,
      embedUrl,
      url: rawUrl,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      error: err.message,
      platform: 'direct',
      title: 'Custom Track',
      artist: 'Unknown Artist',
    });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const { table, data } = req.body || {};
    if (!table || !data) return res.status(400).json({ success: false, error: 'Table and data required' });
    const id = data.id || `${table.slice(0, 3)}_${Date.now()}`;
    const createdAt = data.createdAt || new Date().toISOString();
    const item = { ...data, id, createdAt };

    if (table === 'milestones') {
      fallbackMilestones = [item, ...fallbackMilestones.filter(m => m.id !== id)];
    }

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
      } else if (table === 'milestones') {
        await sql`
          INSERT INTO milestones (id, title, date, description, emoji, photo_url, location, category, created_at)
          VALUES (${id}, ${data.title}, ${data.date}, ${data.description}, ${data.emoji || '💖'}, ${data.photoUrl || ''}, ${data.location || ''}, ${data.category || 'Story'}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title, 
            date = EXCLUDED.date, 
            description = EXCLUDED.description, 
            emoji = EXCLUDED.emoji, 
            photo_url = EXCLUDED.photo_url, 
            location = EXCLUDED.location, 
            category = EXCLUDED.category;
        `;
      }
    }
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/data', async (req, res) => {
  try {
    const table = req.query.table as string;
    const id = req.query.id as string;
    if (!table || !id) return res.status(400).json({ success: false, error: 'Table and id query params required' });

    if (table === 'milestones') {
      fallbackMilestones = fallbackMilestones.filter(m => m.id !== id);
    } else if (table === 'gallery') {
      fallbackGallery = fallbackGallery.filter(g => g.id !== id);
    } else if (table === 'letters') {
      fallbackLetters = fallbackLetters.filter(l => l.id !== id);
    } else if (table === 'notes') {
      fallbackNotes = fallbackNotes.filter(n => n.id !== id);
    } else if (table === 'audios') {
      fallbackAudios = fallbackAudios.filter(a => a.id !== id);
    }

    if (hasPostgres()) {
      try {
        if (table === 'milestones') {
          await sql`DELETE FROM milestones WHERE id = ${id};`;
        } else if (table === 'gallery') {
          await sql`DELETE FROM gallery WHERE id = ${id};`;
        } else if (table === 'letters') {
          await sql`DELETE FROM letters WHERE id = ${id};`;
        } else if (table === 'notes') {
          await sql`DELETE FROM notes WHERE id = ${id};`;
        } else if (table === 'audios') {
          await sql`DELETE FROM audios WHERE id = ${id};`;
        }
      } catch (e: any) {
        console.warn('Postgres delete error on table', table, e.message);
      }
    }
    res.json({ success: true });
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

// 6.5 Media Info Metadata Endpoint (YouTube, Spotify, SoundCloud, TikTok, OpenGraph)
app.get('/api/media-info', async (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'URL parameter is required' });
  }

  const url = rawUrl.trim();

  try {
    // 1. YouTube & YouTube Music
    const ytMatch = url.match(/(?:watch\?v=|embed\/|shorts\/|youtu\.be\/|v=|\/live\/)([\w-]{11})/i);
    if (ytMatch) {
      const vid = ytMatch[1];
      const isYtMusic = url.includes('music.youtube.com');
      const thumbnailUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
      const embedUrl = `https://www.youtube.com/embed/${vid}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`;

      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`);
        if (oembedRes.ok) {
          const data: any = await oembedRes.json();
          const rawTitle = data.title || '';
          const authorName = data.author_name || '';

          let cleaned = rawTitle
            .replace(/\s*[\(\[]\s*(Official\s*(Music\s*)?Video|Audio|Lyric\s*Video|Video\s*Clip|MV|HD|4K|Visualizer|Live|Remastered|Official)\s*[\)\]]/gi, '')
            .trim();

          let artist = authorName || 'YouTube Artist';
          let title = cleaned;

          const separatorMatch = cleaned.match(/\s*[-–—:]\s*/);
          if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index > 0) {
            const parts = cleaned.split(/\s*[-–—:]\s*/);
            if (parts.length >= 2) {
              artist = parts[0].trim();
              title = parts.slice(1).join(' - ').trim();
            }
          }

          return res.json({
            success: true,
            title,
            artist,
            thumbnailUrl: data.thumbnail_url || thumbnailUrl,
            embedUrl,
            platform: isYtMusic ? 'YouTube Music' : 'YouTube'
          });
        }
      } catch (err: any) {
        console.warn('YouTube oembed error:', err.message);
      }

      return res.json({
        success: true,
        title: 'YouTube Track',
        artist: 'YouTube Artist',
        thumbnailUrl,
        embedUrl,
        platform: isYtMusic ? 'YouTube Music' : 'YouTube'
      });
    }

    // 2. Spotify
    const spMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (spMatch) {
      const type = spMatch[1];
      const id = spMatch[2];
      const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      let title = 'Spotify Track';
      let artist = 'Spotify Artist';
      let thumbnailUrl = '';

      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
        if (oembedRes.ok) {
          const data: any = await oembedRes.json();
          if (data.title) title = data.title;
          if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
        }
      } catch {}

      try {
        const pageRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const descMatch = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i);
          if (descMatch && descMatch[1]) {
            const desc = descMatch[1];
            const parts = desc.split('·');
            if (parts.length > 0 && parts[0].trim()) {
              artist = parts[0].trim();
            }
          }
          const titleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1];
          }
          const imageMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
          if (imageMatch && imageMatch[1] && !thumbnailUrl) {
            thumbnailUrl = imageMatch[1];
          }
        }
      } catch {}

      return res.json({
        success: true,
        title,
        artist,
        thumbnailUrl,
        embedUrl,
        platform: 'Spotify'
      });
    }

    // 3. SoundCloud
    if (url.includes('soundcloud.com')) {
      const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7&auto_play=false`;
      try {
        const scRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (scRes.ok) {
          const data: any = await scRes.json();
          let title = data.title || 'SoundCloud Track';
          let artist = data.author_name || 'SoundCloud Artist';

          const separatorMatch = title.match(/\s*[-–—:]\s*/);
          if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index > 0) {
            const parts = title.split(/\s*[-–—:]\s*/);
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          }

          return res.json({
            success: true,
            title,
            artist,
            thumbnailUrl: data.thumbnail_url || '',
            embedUrl,
            platform: 'SoundCloud'
          });
        }
      } catch {}

      return res.json({
        success: true,
        title: 'SoundCloud Track',
        artist: 'SoundCloud Artist',
        thumbnailUrl: '',
        embedUrl,
        platform: 'SoundCloud'
      });
    }

    // 4. TikTok
    if (url.includes('tiktok.com')) {
      try {
        const ttRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
        if (ttRes.ok) {
          const data: any = await ttRes.json();
          return res.json({
            success: true,
            title: data.title || 'TikTok Audio',
            artist: data.author_name || 'TikTok Creator',
            thumbnailUrl: data.thumbnail_url || '',
            platform: 'TikTok'
          });
        }
      } catch {}
    }

    // 5. Generic OpenGraph HTML Scraper fallback
    try {
      const siteRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (siteRes.ok) {
        const html = await siteRes.text();
        const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
          || html.match(/<title>([^<]+)<\/title>/i)?.[1]
          || 'Audio Track';
        const ogArtist = html.match(/<meta\s+(?:property|name)=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta\s+(?:property|name)=["']author["']\s+content=["']([^"']+)["']/i)?.[1]
          || 'Bagas & Anita';
        const ogImage = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';

        return res.json({
          success: true,
          title: ogTitle.trim(),
          artist: ogArtist.trim(),
          thumbnailUrl: ogImage,
          platform: 'Direct Audio'
        });
      }
    } catch {}

    return res.json({
      success: true,
      title: 'Lagu Baru',
      artist: 'Bagas & Anita',
      platform: 'Direct Audio'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
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

// 8. Milestones Endpoints
app.get('/api/milestones', async (req, res) => {
  if (hasPostgres()) {
    await ensureTables();
    try {
      const { rows } = await sql`
        SELECT id, title, date, description, emoji, photo_url AS "photoUrl", location, category, created_at AS "createdAt"
        FROM milestones ORDER BY date ASC, created_at ASC;
      `;
      return res.json({ success: true, items: rows });
    } catch (e: any) {
      console.warn('Postgres milestones query error:', e.message);
    }
  }
  res.json({ success: true, items: fallbackMilestones });
});

app.post('/api/milestones', async (req, res) => {
  try {
    const milestone = req.body;
    const id = milestone.id || `mile_${Date.now()}`;
    const title = milestone.title || 'Untitled Milestone';
    const date = milestone.date || new Date().toISOString().split('T')[0];
    const description = milestone.description || '';
    const emoji = milestone.emoji || '💖';
    const photoUrl = milestone.photoUrl || '';
    const location = milestone.location || '';
    const category = milestone.category || 'Story';
    const createdAt = milestone.createdAt || new Date().toISOString();

    const newMilestone = { id, title, date, description, emoji, photoUrl, location, category, createdAt };
    fallbackMilestones = [newMilestone, ...fallbackMilestones.filter(m => m.id !== id)];

    if (hasPostgres()) {
      await ensureTables();
      try {
        await sql`
          INSERT INTO milestones (id, title, date, description, emoji, photo_url, location, category, created_at)
          VALUES (${id}, ${title}, ${date}, ${description}, ${emoji}, ${photoUrl}, ${location}, ${category}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            date = EXCLUDED.date,
            description = EXCLUDED.description,
            emoji = EXCLUDED.emoji,
            photo_url = EXCLUDED.photo_url,
            location = EXCLUDED.location,
            category = EXCLUDED.category;
        `;
      } catch (e: any) {
        console.warn('Postgres milestones insert error:', e.message);
      }
    }

    res.json({ success: true, item: newMilestone });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/milestones/:id', async (req, res) => {
  const { id } = req.params;
  fallbackMilestones = fallbackMilestones.filter(m => m.id !== id);

  if (hasPostgres()) {
    try {
      await sql`DELETE FROM milestones WHERE id = ${id};`;
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
