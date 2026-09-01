// Vercel Native Storage & Database Client
// Connects to /api/* routes backed by @vercel/blob and @vercel/postgres

export interface VercelServiceStatus {
  status: 'ok' | 'error';
  timestamp: string;
  executionTimeMs?: number;
  blob?: {
    hasToken: boolean;
    tokenPreview?: string | null;
    status: string;
  };
  postgres?: {
    hasConfig: boolean;
    pingMs: number | null;
    error: string | null;
    status: string;
    tables: string[];
  };
  environment?: {
    isVercel: boolean;
    nodeEnv: string;
    availableEnvKeys: string[];
  };
  hasBlobToken?: boolean;
  hasPostgres?: boolean;
  storageType: string;
}

export interface UploadDebugResult {
  url: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  mediaType: 'photo' | 'video' | 'audio';
  pathname: string;
  storage?: string;
  originalSizeMb?: string;
  uploadedSizeMb?: string;
  wasCompressed?: boolean;
  durationMs?: number;
  httpStatus?: number;
}

export interface DebugErrorLog {
  endpoint: string;
  httpStatus?: number;
  message: string;
  timestamp: string;
  details?: any;
  suggestions?: string[];
}

export async function checkVercelServiceStatus(): Promise<VercelServiceStatus> {
  const startTime = Date.now();
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status} (${res.statusText})`);
    }
    const data = await res.json();
    return {
      ...data,
      hasBlobToken: data.blob?.hasToken ?? false,
      hasPostgres: data.postgres?.hasConfig ?? false,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.warn('Unable to query Vercel service health:', error);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      blob: {
        hasToken: false,
        status: 'Endpoint unreachable or offline',
      },
      postgres: {
        hasConfig: false,
        pingMs: null,
        error: error.message || 'Connection failed',
        status: 'Offline / Mock Mode',
        tables: [],
      },
      hasBlobToken: false,
      hasPostgres: false,
      storageType: 'Client LocalStorage (Offline Mode)',
    };
  }
}

// Convert File to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Client-side image compressor to prevent exceeding Vercel Serverless Function 4.5MB body limit
async function compressImageIfNeeded(file: File): Promise<{ file: File; wasCompressed: boolean }> {
  if (!file.type.startsWith('image/') || file.size <= 1.5 * 1024 * 1024) {
    return { file, wasCompressed: false };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, wasCompressed: false });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve({ file: compressedFile, wasCompressed: true });
            } else {
              resolve({ file, wasCompressed: false });
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve({ file, wasCompressed: false });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ file, wasCompressed: false });
    reader.readAsDataURL(file);
  });
}

// Upload file to Vercel Blob via /api/upload with complete diagnostics
export async function uploadMediaToVercelBlob(
  file: File,
  author: string = 'Bagas',
  category: string = 'All'
): Promise<UploadDebugResult> {
  const startTime = Date.now();
  const originalSizeMb = (file.size / (1024 * 1024)).toFixed(2);

  // Compress if large image
  const { file: fileToUpload, wasCompressed } = await compressImageIfNeeded(file);
  const uploadedSizeMb = (fileToUpload.size / (1024 * 1024)).toFixed(2);

  const base64Data = await fileToBase64(fileToUpload);

  let res: Response;
  try {
    res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: fileToUpload.name,
        contentType: fileToUpload.type,
        base64: base64Data,
        author,
        category,
      }),
    });
  } catch (networkErr: any) {
    throw {
      endpoint: '/api/upload',
      message: networkErr.message || 'Network error: Failed to reach /api/upload',
      timestamp: new Date().toISOString(),
      details: {
        originalSizeMb,
        fileType: file.type,
        fileName: file.name,
      },
      suggestions: [
        'Check your internet connection',
        'Verify if the Vercel deployment URL is reachable',
        'Check if Vercel serverless function timed out',
      ],
    };
  }

  const durationMs = Date.now() - startTime;

  if (!res.ok) {
    let errorJson: any = {};
    try {
      errorJson = await res.json();
    } catch {
      errorJson = { error: await res.text() };
    }

    const suggestions: string[] = [];
    if (res.status === 413) {
      suggestions.push('File is too large for Vercel Serverless (Limit 4.5MB). Try a smaller image or compressed video.');
    } else if (res.status === 500) {
      suggestions.push('Check if BLOB_READ_WRITE_TOKEN is connected in Vercel Storage settings.');
      suggestions.push('Verify Vercel Serverless Function logs in Vercel Dashboard > Logs.');
    } else if (res.status === 404) {
      suggestions.push('API route /api/upload was not found. Ensure vercel.json rewrites are deployed.');
    }

    throw {
      endpoint: '/api/upload',
      httpStatus: res.status,
      message: errorJson.error || `Server responded with HTTP ${res.status}: ${res.statusText}`,
      timestamp: new Date().toISOString(),
      details: {
        httpStatus: res.status,
        durationMs,
        originalSizeMb,
        uploadedSizeMb,
        wasCompressed,
        serverError: errorJson,
      },
      suggestions,
    };
  }

  const data = await res.json();
  return {
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || data.url,
    downloadUrl: data.downloadUrl || data.url,
    mediaType: data.mediaType || (file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'photo'),
    pathname: data.pathname || file.name,
    storage: data.storage,
    originalSizeMb,
    uploadedSizeMb,
    wasCompressed,
    durationMs,
    httpStatus: res.status,
  };
}
