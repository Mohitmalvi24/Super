import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technique } from '../types';

const BACKEND_URL = 'https://super-rrfr.onrender.com';
const VIDEO_CACHE_KEY_PREFIX = 'video_cache_';
const VIDEO_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;


const DEMO_MODE = false;

export interface VideoGenerationResult {
  videoUrl: string;
  format: 'mp4' | 'webm';
  resolution: string;
  frameRate: number;
  duration: number;
  fileSize: number;
  generatedAt: number;
  techniqueId: string;
}

export interface CachedVideoData {
  result: VideoGenerationResult;
  cachedAt: number;
  expiresAt: number;
}



export const VideoService = {

  async generateVideo(
    techniqueId: string,
    technique: Technique,
    hobby: string
  ): Promise<VideoGenerationResult> {
    try {

      const cached = await this.getCachedVideo(techniqueId);
      if (cached) {
        console.log(`[VideoService] Using cached video for: ${technique.name}`);
        return cached.result;
      }


      if (DEMO_MODE) {
        console.log(`[VideoService] Demo mode - generating mock video for: ${technique.name}`);

        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResult: VideoGenerationResult = {
          videoUrl: `demo_video_${techniqueId}`,
          format: 'mp4',
          resolution: '1080p',
          frameRate: 30,
          duration: 90,
          fileSize: 15000000,
          generatedAt: Date.now(),
          techniqueId,
        };

        await this.cacheVideo(techniqueId, mockResult);
        console.log(`[VideoService] Demo video created for: ${technique.name}`);
        return mockResult;
      }


      console.log(`[VideoService] Fetching video from backend for: ${technique.name}`);

      const response = await fetch(`${BACKEND_URL}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId,
          technique,
          hobby,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Backend error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result: VideoGenerationResult = await response.json();
      await this.cacheVideo(techniqueId, result);

      console.log(`[VideoService] Video generated: ${technique.name}`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[VideoService] Failed to generate video for ${technique.name}: ${message}`);


      if (message.includes('Network') || message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to video server. Check your internet connection.');
      }

      throw new Error(message);
    }
  },


  async getCachedVideo(techniqueId: string): Promise<CachedVideoData | null> {
    try {
      const key = `${VIDEO_CACHE_KEY_PREFIX}${techniqueId}`;
      const cached = await AsyncStorage.getItem(key);

      if (!cached) {
        return null;
      }

      const data: CachedVideoData = JSON.parse(cached);


      if (Date.now() > data.expiresAt) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`[VideoService] Error reading cache: ${error}`);
      return null;
    }
  },

  async cacheVideo(techniqueId: string, result: VideoGenerationResult): Promise<void> {
    try {
      const key = `${VIDEO_CACHE_KEY_PREFIX}${techniqueId}`;
      const data: CachedVideoData = {
        result,
        cachedAt: Date.now(),
        expiresAt: Date.now() + VIDEO_CACHE_TTL_MS,
      };

      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`[VideoService] Cached video for technique: ${techniqueId}`);
    } catch (error) {

    }
  },

  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const videoCacheKeys = keys.filter(key => key.startsWith(VIDEO_CACHE_KEY_PREFIX));

      if (videoCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(videoCacheKeys);
        console.log(`[VideoService] Cleared ${videoCacheKeys.length} cached videos`);
      }
    } catch (error) {
      console.error(`[VideoService] Error clearing cache: ${error}`);
    }
  },


  async clearCachedVideo(techniqueId: string): Promise<void> {
    try {
      const key = `${VIDEO_CACHE_KEY_PREFIX}${techniqueId}`;
      await AsyncStorage.removeItem(key);
      console.log(`[VideoService] Cleared cache for technique: ${techniqueId}`);
    } catch (error) {
      console.error(`[VideoService] Error clearing specific cache: ${error}`);
    }
  },


  async getCacheInfo(): Promise<{ count: number; totalSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const videoCacheKeys = keys.filter(key => key.startsWith(VIDEO_CACHE_KEY_PREFIX));

      let totalSize = 0;
      for (const key of videoCacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }

      const units = ['B', 'KB', 'MB', 'GB'];
      let size = totalSize;
      let unitIndex = 0;
      while (size > 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return {
        count: videoCacheKeys.length,
        totalSize: `${size.toFixed(2)} ${units[unitIndex]}`,
      };
    } catch (error) {
      console.error(`[VideoService] Error getting cache info: ${error}`);
      return { count: 0, totalSize: '0 B' };
    }
  },
};
