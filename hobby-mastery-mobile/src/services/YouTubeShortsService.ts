import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'https://super-rrfr.onrender.com';
const SHORTS_CACHE_PREFIX = 'yt_shorts_';
const SHORTS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface YouTubeShort {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  author: string;
  url: string;
}

interface CachedShorts {
  shorts: YouTubeShort[];
  cachedAt: number;
}

export const YouTubeShortsService = {
  async fetchShorts(query: string): Promise<YouTubeShort[]> {
    try {
      const cacheKey = `${SHORTS_CACHE_PREFIX}${query.toLowerCase().replace(/\s+/g, '_')}`;

      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const data: CachedShorts = JSON.parse(cached);
        if (Date.now() - data.cachedAt < SHORTS_CACHE_TTL) {
          console.log(`[YouTubeShorts] Cache hit for: ${query}`);
          return data.shorts;
        }
      }

      console.log(`[YouTubeShorts] Fetching from backend for: ${query}`);
      const response = await fetch(
        `${BACKEND_URL}/api/youtube/shorts?q=${encodeURIComponent(query)}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      const shorts: YouTubeShort[] = data.shorts || [];

      await AsyncStorage.setItem(cacheKey, JSON.stringify({ shorts, cachedAt: Date.now() }));
      console.log(`[YouTubeShorts] Fetched ${shorts.length} shorts for: ${query}`);
      return shorts;
    } catch (error) {
      console.error(`[YouTubeShorts] Failed: ${error}`);
      return [];
    }
  },
};
