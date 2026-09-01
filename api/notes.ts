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
          SELECT id, text, author, color, date, is_pinned AS "isPinned", emoji, created_at AS "createdAt"
          FROM notes ORDER BY created_at DESC;
        `;
        return res.status(200).json({ success: true, items: rows });
      } catch (err: any) {
        return res.status(200).json({ success: true, items: [], error: err.message });
      }
    }
    return res.status(200).json({ success: true, items: [] });
  }

  if (req.method === 'POST') {
    const note = req.body || {};
    const id = note.id || `note_${Date.now()}`;
    const text = note.text || '';
    const author = note.author || 'Anita';
    const color = note.color || 'pink';
    const date = note.date || new Date().toISOString().split('T')[0];
    const isPinned = Boolean(note.isPinned);
    const emoji = note.emoji || '✨';
    const createdAt = note.createdAt || new Date().toISOString();

    const newNote = { id, text, author, color, date, isPinned, emoji, createdAt };

    if (hasPostgres) {
      try {
        await sql`
          INSERT INTO notes (id, text, author, color, date, is_pinned, emoji, created_at)
          VALUES (${id}, ${text}, ${author}, ${color}, ${date}, ${isPinned}, ${emoji}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            text = EXCLUDED.text,
            is_pinned = EXCLUDED.is_pinned;
        `;
      } catch (err: any) {
        console.warn('Postgres notes insert error:', err.message);
      }
    }

    return res.status(200).json({ success: true, item: newNote });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || req.body || {};
    if (hasPostgres && id) {
      try {
        await sql`DELETE FROM notes WHERE id = ${id};`;
      } catch (err: any) {
        console.warn('Postgres delete error:', err.message);
      }
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
