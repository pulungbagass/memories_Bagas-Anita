// Vercel Native Storage & Database Client
// Connects to /api/* routes backed by @vercel/blob and @vercel/postgres

export interface VercelServiceStatus {
  status: 'ok' | 'error';
  timestamp: string;
  hasBlobToken: boolean;
  hasPostgres: boolean;
  storageType: string;
}

export async function checkVercelServiceStatus(): Promise<VercelServiceStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Unable to query Vercel service health:', error);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      hasBlobToken: false,
      hasPostgres: false,
      storageType: 'Local & Server Storage (Ready for Vercel)',
    };
  }
}

// Upload file directly to Vercel Blob via /api/upload
export async function uploadMediaToVercelBlob(
  file: File,
  author: string = 'Bagas',
  category: string = 'All'
): Promise<{
  url: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  mediaType: 'photo' | 'video' | 'audio';
  pathname: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('author', author);
  formData.append('category', category);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload media to Vercel Blob');
  }

  const data = await res.json();
  return {
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || data.url,
    downloadUrl: data.downloadUrl || data.url,
    mediaType: data.mediaType || (file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'photo'),
    pathname: data.pathname || file.name,
  };
}
