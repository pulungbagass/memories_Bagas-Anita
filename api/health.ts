import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  let dbPingMs: number | null = null;
  let dbError: string | null = null;
  let tablesFound: string[] = [];

  const hasPostgres = Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  const hasBlobToken = Boolean(token);

  if (hasPostgres) {
    try {
      const pingStart = Date.now();
      await sql`SELECT 1;`;
      dbPingMs = Date.now() - pingStart;

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

  const tokenPreview = token ? `${token.substring(0, 15)}...` : null;

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    executionTimeMs: Date.now() - startTime,
    blob: {
      hasToken: hasBlobToken,
      tokenPreview,
      status: hasBlobToken ? 'Connected' : 'Missing BLOB_READ_WRITE_TOKEN',
    },
    postgres: {
      hasConfig: hasPostgres,
      pingMs: dbPingMs,
      error: dbError,
      status: hasPostgres ? (dbError ? 'Error: ' + dbError : 'Connected') : 'Missing POSTGRES_URL',
      tables: tablesFound,
    },
    environment: {
      isVercel: Boolean(process.env.VERCEL),
      nodeEnv: process.env.NODE_ENV || 'production',
      availableEnvKeys: Object.keys(process.env).filter(k => 
        k.startsWith('POSTGRES') || k.startsWith('BLOB') || k === 'VERCEL'
      ),
    },
    storageType: hasBlobToken && hasPostgres ? 'Vercel Native (Blob + Postgres)' : 'Persistent Storage',
  });
}
