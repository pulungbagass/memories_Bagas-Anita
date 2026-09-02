import { sql } from '@vercel/postgres';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Ensure all database tables exist
async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      media_type VARCHAR(20) NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      author VARCHAR(50) NOT NULL,
      category VARCHAR(50) DEFAULT 'Dates',
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
      duration VARCHAR(20) DEFAULT '3:00',
      author VARCHAR(50) NOT NULL,
      type VARCHAR(30) DEFAULT 'song',
      date VARCHAR(50) NOT NULL,
      cover_url TEXT,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasPostgres = Boolean(
    (process.env.POSTGRES_URL && process.env.POSTGRES_URL.trim().length > 0) || 
    (process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_PRISMA_URL.trim().length > 0) ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) ||
    (process.env.POSTGRES_URL_NON_POOLING && process.env.POSTGRES_URL_NON_POOLING.trim().length > 0)
  );

  // 1. GET: Fetch all persistent data from Vercel Postgres
  if (req.method === 'GET') {
    if (hasPostgres) {
      try {
        await ensureTables();
        const [galRes, letRes, noteRes, audRes] = await Promise.all([
          sql`SELECT id, title, description, media_type AS "mediaType", url, thumbnail_url AS "thumbnailUrl", author, category, date, location, is_favorite AS "isFavorite", aspect_ratio AS "aspectRatio", created_at AS "createdAt" FROM gallery ORDER BY created_at DESC;`,
          sql`SELECT id, title, content, sender, recipient, date, stamp_emoji AS "stampEmoji", is_read AS "isRead", paper_color AS "paperColor", created_at AS "createdAt" FROM letters ORDER BY created_at DESC;`,
          sql`SELECT id, text, author, color, date, is_pinned AS "isPinned", emoji, created_at AS "createdAt" FROM notes ORDER BY is_pinned DESC, created_at DESC;`,
          sql`SELECT id, title, artist, url, duration, author, type, date, cover_url AS "coverUrl", description, created_at AS "createdAt" FROM audios ORDER BY created_at DESC;`,
        ]);

        return res.status(200).json({
          success: true,
          gallery: galRes.rows,
          letters: letRes.rows,
          notes: noteRes.rows,
          audios: audRes.rows,
          storage: 'vercel_postgres',
        });
      } catch (err: any) {
        console.warn('Postgres query error in /api/data:', err);
        return res.status(200).json({
          success: true,
          gallery: [],
          letters: [],
          notes: [],
          audios: [],
          warning: 'Postgres query failed: ' + err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      gallery: [],
      letters: [],
      notes: [],
      audios: [],
      warning: 'POSTGRES_URL not configured',
    });
  }

  // 2. POST: Insert / Update a record in Postgres
  if (req.method === 'POST') {
    const body = req.body || {};
    const { table, data } = body;

    if (!table || !data) {
      return res.status(400).json({ success: false, error: 'Table and data are required' });
    }

    const id = data.id || `${table.slice(0, 3)}_${Date.now()}`;
    const createdAt = data.createdAt || new Date().toISOString();
    const itemWithMeta = { ...data, id, createdAt };

    if (hasPostgres) {
      try {
        await ensureTables();
        if (table === 'gallery') {
          await sql`
            INSERT INTO gallery (id, title, description, media_type, url, thumbnail_url, author, category, date, location, is_favorite, aspect_ratio, created_at)
            VALUES (${id}, ${data.title}, ${data.description || ''}, ${data.mediaType || 'photo'}, ${data.url}, ${data.thumbnailUrl || data.url}, ${data.author}, ${data.category || 'Dates'}, ${data.date}, ${data.location || ''}, ${Boolean(data.isFavorite)}, ${data.aspectRatio || 1.33}, ${createdAt})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              is_favorite = EXCLUDED.is_favorite;
          `;
        } else if (table === 'letters') {
          await sql`
            INSERT INTO letters (id, title, content, sender, recipient, date, stamp_emoji, is_read, paper_color, created_at)
            VALUES (${id}, ${data.title}, ${data.content}, ${data.sender}, ${data.recipient}, ${data.date}, ${data.stampEmoji || '💌'}, ${Boolean(data.isRead)}, ${data.paperColor || 'rose'}, ${createdAt})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              is_read = EXCLUDED.is_read;
          `;
        } else if (table === 'notes') {
          await sql`
            INSERT INTO notes (id, text, author, color, date, is_pinned, emoji, created_at)
            VALUES (${id}, ${data.text}, ${data.author}, ${data.color || 'pink'}, ${data.date}, ${Boolean(data.isPinned)}, ${data.emoji || '✨'}, ${createdAt})
            ON CONFLICT (id) DO UPDATE SET
              text = EXCLUDED.text,
              is_pinned = EXCLUDED.is_pinned;
          `;
        } else if (table === 'audios') {
          await sql`
            INSERT INTO audios (id, title, artist, url, duration, author, type, date, cover_url, description, created_at)
            VALUES (${id}, ${data.title}, ${data.artist || 'Together'}, ${data.url}, ${data.duration || '3:00'}, ${data.author}, ${data.type || 'song'}, ${data.date}, ${data.coverUrl || ''}, ${data.description || ''}, ${createdAt})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              artist = EXCLUDED.artist;
          `;
        }
      } catch (err: any) {
        console.error('Postgres insert error in /api/data:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({ success: true, item: itemWithMeta });
  }

  // 3. DELETE: Remove record from Postgres
  if (req.method === 'DELETE') {
    const { table, id } = req.query || req.body || {};
    if (!table || !id) {
      return res.status(400).json({ success: false, error: 'Table and ID are required' });
    }

    if (hasPostgres) {
      try {
        if (table === 'gallery') await sql`DELETE FROM gallery WHERE id = ${id};`;
        if (table === 'letters') await sql`DELETE FROM letters WHERE id = ${id};`;
        if (table === 'notes') await sql`DELETE FROM notes WHERE id = ${id};`;
        if (table === 'audios') await sql`DELETE FROM audios WHERE id = ${id};`;
      } catch (err: any) {
        console.error('Postgres delete error in /api/data:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({ success: true, id });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
