/**
 * Audio helper utilities for extracting video IDs, platform detection, and formatting time
 */

export function extractYouTubeId(url: string = ''): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : null;
}

export function extractSpotifyInfo(url: string = ''): { type: string; id: string } | null {
  if (!url) return null;
  const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (match && match[1] && match[2]) {
    return { type: match[1], id: match[2] };
  }
  return null;
}

export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function parseAudioDuration(durationStr?: string): number {
  if (!durationStr) return 180;
  if (/^\d+$/.test(durationStr.trim())) {
    const s = parseInt(durationStr.trim(), 10);
    return s > 0 ? s : 180;
  }
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (!isNaN(mins) && !isNaN(secs)) {
      return Math.max(10, mins * 60 + secs);
    }
  } else if (parts.length === 3) {
    const hrs = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const secs = parseInt(parts[2], 10);
    if (!isNaN(hrs) && !isNaN(mins) && !isNaN(secs)) {
      return Math.max(10, hrs * 3600 + mins * 60 + secs);
    }
  }
  return 180;
}

export function parseTitleAndArtist(rawTitle: string, authorName?: string): { title: string; artist: string } {
  let cleaned = (rawTitle || '')
    .replace(/\s*[\(\[]\s*(Official\s*(Music\s*)?Video|Audio|Lyric\s*Video|Video\s*Clip|MV|HD|4K|Visualizer|Live|Remastered|Official)\s*[\)\]]/gi, '')
    .trim();

  // Check for common artist/title separators like " - ", " – ", " — ", " : "
  const separatorMatch = cleaned.match(/\s*[-–—:]\s*/);
  if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index > 0) {
    const parts = cleaned.split(/\s*[-–—:]\s*/);
    if (parts.length >= 2) {
      const part1 = parts[0].trim();
      const part2 = parts.slice(1).join(' - ').trim();
      if (part1 && part2) {
        return {
          artist: part1,
          title: part2
        };
      }
    }
  }

  return {
    title: cleaned || rawTitle || 'Untitled Audio',
    artist: authorName || 'Bagas & Anita'
  };
}

export interface ClientMediaMetadata {
  title?: string;
  artist?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  platform?: string;
}

export async function fetchMediaMetadataClientSide(url: string): Promise<ClientMediaMetadata | null> {
  const trimmed = (url || '').trim();
  if (!trimmed || !trimmed.startsWith('http')) return null;

  // 1. YouTube & YouTube Music
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    const isYtMusic = trimmed.includes('music.youtube.com');
    const embedUrl = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`;
    const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parsed = parseTitleAndArtist(data.title, data.author_name);
        return {
          title: parsed.title,
          artist: parsed.artist,
          thumbnailUrl: data.thumbnail_url || thumbnailUrl,
          embedUrl,
          platform: isYtMusic ? 'YouTube Music' : 'YouTube'
        };
      }
    } catch {
      // Return basic metadata even if oembed is blocked
    }

    return {
      title: 'YouTube Track',
      artist: 'YouTube',
      thumbnailUrl,
      embedUrl,
      platform: isYtMusic ? 'YouTube Music' : 'YouTube'
    };
  }

  // 2. Spotify
  const spInfo = extractSpotifyInfo(trimmed);
  if (spInfo) {
    const embedUrl = `https://open.spotify.com/embed/${spInfo.type}/${spInfo.id}?utm_source=generator&theme=0`;
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trimmed)}`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parsed = parseTitleAndArtist(data.title);
        return {
          title: parsed.title,
          artist: parsed.artist !== 'Bagas & Anita' ? parsed.artist : 'Spotify Artist',
          thumbnailUrl: data.thumbnail_url || '',
          embedUrl,
          platform: 'Spotify'
        };
      }
    } catch {}

    return {
      title: 'Spotify Track',
      artist: 'Spotify Artist',
      embedUrl,
      platform: 'Spotify'
    };
  }

  // 3. SoundCloud
  if (trimmed.includes('soundcloud.com')) {
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trimmed)}&color=%23a855f7&auto_play=false`;
    try {
      const oembedRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const parsed = parseTitleAndArtist(data.title, data.author_name);
        return {
          title: parsed.title,
          artist: parsed.artist,
          thumbnailUrl: data.thumbnail_url || '',
          embedUrl,
          platform: 'SoundCloud'
        };
      }
    } catch {}

    return {
      title: 'SoundCloud Track',
      artist: 'SoundCloud Artist',
      embedUrl,
      platform: 'SoundCloud'
    };
  }

  return null;
}
