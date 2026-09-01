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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const hasPostgres = Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

  if (req.method === 'GET') {
    if (hasPostgres) {
      try {
        const { rows } = await sql`
          SELECT id, title, artist, url, duration, author, type, date, cover_url AS "coverUrl", description, created_at AS "createdAt"
          FROM audios ORDER BY created_at DESC;
        `;
        return res.status(200).json({ success: true, items: rows });
      } catch (err: any) {
        return res.status(200).json({ success: true, items: [], error: err.message });
      }
    }
    return res.status(200).json({ success: true, items: [] });
  }

  if (req.method === 'POST') {
    const audio = req.body || {};
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

    if (hasPostgres && url) {
      try {
        await sql`
          INSERT INTO audios (id, title, artist, url, duration, author, type, date, cover_url, description, created_at)
          VALUES (${id}, ${title}, ${artist}, ${url}, ${duration}, ${author}, ${type}, ${date}, ${coverUrl}, ${description}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            artist = EXCLUDED.artist;
        `;
      } catch (err: any) {
        console.warn('Postgres audios insert error:', err.message);
      }
    }

    return res.status(200).json({ success: true, item: newAudio });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || req.body || {};
    if (hasPostgres && id) {
      try {
        await sql`DELETE FROM audios WHERE id = ${id};`;
      } catch (err: any) {
        console.warn('Postgres delete error:', err.message);
      }
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
