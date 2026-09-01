import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const body = req.body || {};
    const { filename, contentType, base64, author = 'Bagas', category = 'All' } = body;

    let mediaType: 'photo' | 'video' | 'audio' = 'photo';
    let folder = 'photos';

    const mime = contentType || 'image/jpeg';
    if (mime.startsWith('video/')) {
      mediaType = 'video';
      folder = 'videos';
    } else if (mime.startsWith('audio/')) {
      mediaType = 'audio';
      folder = 'audio';
    }

    const safeName = (filename || `media_${Date.now()}`).replace(/[^a-zA-Z0-9.-]/g, '_');
    const pathname = `${folder}/${Date.now()}-${safeName}`;

    // If Base64 was sent
    if (base64) {
      const buffer = Buffer.from(base64, 'base64');

      if (token) {
        try {
          const blob = await put(pathname, buffer, {
            access: 'public',
            token,
            contentType: mime,
            addRandomSuffix: true,
          });

          return res.status(200).json({
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
        } catch (blobError: any) {
          console.warn('Vercel Blob put error, using fallback:', blobError);
          // Fallback to data URL or error info
          return res.status(200).json({
            success: true,
            url: `data:${mime};base64,${base64}`,
            thumbnailUrl: mediaType === 'photo' ? `data:${mime};base64,${base64}` : undefined,
            pathname,
            mediaType,
            author,
            category,
            storage: 'fallback_data_url',
            warning: 'Stored as data URL because Blob token rejected the upload: ' + blobError.message,
          });
        }
      } else {
        return res.status(200).json({
          success: true,
          url: `data:${mime};base64,${base64}`,
          thumbnailUrl: mediaType === 'photo' ? `data:${mime};base64,${base64}` : undefined,
          pathname,
          mediaType,
          author,
          category,
          storage: 'fallback_data_url',
          warning: 'BLOB_READ_WRITE_TOKEN is not configured.',
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: 'No valid file payload (base64) provided in request body.',
    });
  } catch (err: any) {
    console.error('Upload handler exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal upload handler error',
    });
  }
}
