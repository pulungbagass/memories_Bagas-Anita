import { sql } from '@vercel/postgres';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasPostgres = Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

  if (hasPostgres) {
    try {
      // Ensure tables exist
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

      const [galRes, letRes, noteRes, audRes] = await Promise.all([
        sql`SELECT id, title, description, media_type AS "mediaType", url, thumbnail_url AS "thumbnailUrl", author, category, date, location, is_favorite AS "isFavorite", aspect_ratio AS "aspectRatio", created_at AS "createdAt" FROM gallery ORDER BY created_at DESC;`,
        sql`SELECT id, title, content, sender, recipient, date, stamp_emoji AS "stampEmoji", is_read AS "isRead", paper_color AS "paperColor", created_at AS "createdAt" FROM letters ORDER BY created_at DESC;`,
        sql`SELECT id, text, author, color, date, is_pinned AS "isPinned", emoji, created_at AS "createdAt" FROM notes ORDER BY created_at DESC;`,
        sql`SELECT id, title, artist, url, duration, author, type, date, cover_url AS "coverUrl", description, created_at AS "createdAt" FROM audios ORDER BY created_at DESC;`,
      ]);

      return res.status(200).json({
        success: true,
        gallery: galRes.rows,
        letters: letRes.rows,
        notes: noteRes.rows,
        audios: audRes.rows,
      });
    } catch (err: any) {
      console.warn('Postgres query error in /api/all-data:', err.message);
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
    warning: 'POSTGRES_URL is not set. Data stored in local client cache.',
  });
}
