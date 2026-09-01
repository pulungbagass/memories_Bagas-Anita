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
          SELECT id, title, description, media_type AS "mediaType", url, thumbnail_url AS "thumbnailUrl", author, category, date, location, is_favorite AS "isFavorite", aspect_ratio AS "aspectRatio", created_at AS "createdAt"
          FROM gallery ORDER BY created_at DESC;
        `;
        return res.status(200).json({ success: true, items: rows });
      } catch (err: any) {
        return res.status(200).json({ success: true, items: [], error: err.message });
      }
    }
    return res.status(200).json({ success: true, items: [] });
  }

  if (req.method === 'POST') {
    const item = req.body || {};
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

    if (hasPostgres && url) {
      try {
        await sql`
          INSERT INTO gallery (id, title, description, media_type, url, thumbnail_url, author, category, date, location, is_favorite, aspect_ratio, created_at)
          VALUES (${id}, ${title}, ${description}, ${mediaType}, ${url}, ${thumbnailUrl}, ${author}, ${category}, ${date}, ${location}, ${isFavorite}, ${aspectRatio}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            is_favorite = EXCLUDED.is_favorite;
        `;
      } catch (err: any) {
        console.warn('Postgres gallery save error:', err.message);
      }
    }

    return res.status(200).json({ success: true, item: newItem });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || req.body || {};
    if (hasPostgres && id) {
      try {
        await sql`DELETE FROM gallery WHERE id = ${id};`;
      } catch (err: any) {
        console.warn('Postgres delete error:', err.message);
      }
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
