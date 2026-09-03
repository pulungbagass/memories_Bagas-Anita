export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawUrl = req.query.url || req.body?.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'URL parameter is required' });
  }

  const url = rawUrl.trim();

  try {
    // 1. YouTube & YouTube Music
    const ytMatch = url.match(/(?:watch\?v=|embed\/|shorts\/|youtu\.be\/|v=|\/live\/)([\w-]{11})/i);
    if (ytMatch) {
      const vid = ytMatch[1];
      const isYtMusic = url.includes('music.youtube.com');
      const thumbnailUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
      const embedUrl = `https://www.youtube.com/embed/${vid}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`;

      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          const rawTitle = data.title || '';
          const authorName = data.author_name || '';

          let cleaned = rawTitle
            .replace(/\s*[\(\[]\s*(Official\s*(Music\s*)?Video|Audio|Lyric\s*Video|Video\s*Clip|MV|HD|4K|Visualizer|Live|Remastered|Official)\s*[\)\]]/gi, '')
            .trim();

          let artist = authorName || 'YouTube Artist';
          let title = cleaned;

          const separatorMatch = cleaned.match(/\s*[-–—:]\s*/);
          if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index > 0) {
            const parts = cleaned.split(/\s*[-–—:]\s*/);
            if (parts.length >= 2) {
              artist = parts[0].trim();
              title = parts.slice(1).join(' - ').trim();
            }
          }

          return res.status(200).json({
            success: true,
            title,
            artist,
            thumbnailUrl: data.thumbnail_url || thumbnailUrl,
            embedUrl,
            platform: isYtMusic ? 'YouTube Music' : 'YouTube'
          });
        }
      } catch (err: any) {
        console.warn('YouTube oembed fetch error:', err.message);
      }

      return res.status(200).json({
        success: true,
        title: 'YouTube Track',
        artist: 'YouTube Artist',
        thumbnailUrl,
        embedUrl,
        platform: isYtMusic ? 'YouTube Music' : 'YouTube'
      });
    }

    // 2. Spotify
    const spMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (spMatch) {
      const type = spMatch[1];
      const id = spMatch[2];
      const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      let title = 'Spotify Track';
      let artist = 'Spotify Artist';
      let thumbnailUrl = '';

      // Try Spotify oEmbed
      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          if (data.title) title = data.title;
          if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
        }
      } catch {}

      // Try scraping Spotify HTML for exact artist from og:description
      try {
        const pageRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const descMatch = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i);
          if (descMatch && descMatch[1]) {
            const desc = descMatch[1];
            // Format: "Artist · Song · 2024" or "Artist, Artist2 · Album · 2023"
            const parts = desc.split('·');
            if (parts.length > 0 && parts[0].trim()) {
              artist = parts[0].trim();
            }
          }
          const titleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1];
          }
          const imageMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
          if (imageMatch && imageMatch[1] && !thumbnailUrl) {
            thumbnailUrl = imageMatch[1];
          }
        }
      } catch {}

      return res.status(200).json({
        success: true,
        title,
        artist,
        thumbnailUrl,
        embedUrl,
        platform: 'Spotify'
      });
    }

    // 3. SoundCloud
    if (url.includes('soundcloud.com')) {
      const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7&auto_play=false`;
      try {
        const scRes = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (scRes.ok) {
          const data = await scRes.json();
          let title = data.title || 'SoundCloud Track';
          let artist = data.author_name || 'SoundCloud Artist';

          const separatorMatch = title.match(/\s*[-–—:]\s*/);
          if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index > 0) {
            const parts = title.split(/\s*[-–—:]\s*/);
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          }

          return res.status(200).json({
            success: true,
            title,
            artist,
            thumbnailUrl: data.thumbnail_url || '',
            embedUrl,
            platform: 'SoundCloud'
          });
        }
      } catch {}

      return res.status(200).json({
        success: true,
        title: 'SoundCloud Track',
        artist: 'SoundCloud Artist',
        thumbnailUrl: '',
        embedUrl,
        platform: 'SoundCloud'
      });
    }

    // 4. TikTok
    if (url.includes('tiktok.com')) {
      try {
        const ttRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
        if (ttRes.ok) {
          const data = await ttRes.json();
          return res.status(200).json({
            success: true,
            title: data.title || 'TikTok Audio',
            artist: data.author_name || 'TikTok Creator',
            thumbnailUrl: data.thumbnail_url || '',
            platform: 'TikTok'
          });
        }
      } catch {}
    }

    // 5. Generic OpenGraph HTML Scraper fallback
    try {
      const siteRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (siteRes.ok) {
        const html = await siteRes.text();
        const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
          || html.match(/<title>([^<]+)<\/title>/i)?.[1]
          || 'Audio Track';
        const ogArtist = html.match(/<meta\s+(?:property|name)=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta\s+(?:property|name)=["']author["']\s+content=["']([^"']+)["']/i)?.[1]
          || 'Bagas & Anita';
        const ogImage = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';

        return res.status(200).json({
          success: true,
          title: ogTitle.trim(),
          artist: ogArtist.trim(),
          thumbnailUrl: ogImage,
          platform: 'Direct Audio'
        });
      }
    } catch {}

    return res.status(200).json({
      success: true,
      title: 'Lagu Baru',
      artist: 'Bagas & Anita',
      platform: 'Direct Audio'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
