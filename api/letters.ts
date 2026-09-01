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
          SELECT id, title, content, sender, recipient, date, stamp_emoji AS "stampEmoji", is_read AS "isRead", paper_color AS "paperColor", created_at AS "createdAt"
          FROM letters ORDER BY created_at DESC;
        `;
        return res.status(200).json({ success: true, items: rows });
      } catch (err: any) {
        return res.status(200).json({ success: true, items: [], error: err.message });
      }
    }
    return res.status(200).json({ success: true, items: [] });
  }

  if (req.method === 'POST') {
    const letter = req.body || {};
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

    if (hasPostgres) {
      try {
        await sql`
          INSERT INTO letters (id, title, content, sender, recipient, date, stamp_emoji, is_read, paper_color, created_at)
          VALUES (${id}, ${title}, ${content}, ${sender}, ${recipient}, ${date}, ${stampEmoji}, ${isRead}, ${paperColor}, ${createdAt})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            is_read = EXCLUDED.is_read;
        `;
      } catch (err: any) {
        console.warn('Postgres letter insert error:', err.message);
      }
    }

    return res.status(200).json({ success: true, item: newLetter });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || req.body || {};
    if (hasPostgres && id) {
      try {
        await sql`DELETE FROM letters WHERE id = ${id};`;
      } catch (err: any) {
        console.warn('Postgres delete error:', err.message);
      }
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
