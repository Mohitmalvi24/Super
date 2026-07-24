import { Router, Request, Response } from 'express';
import yts from 'yt-search';

const router = Router();

interface ShortResult {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  author: string;
  url: string;
}

router.get('/shorts', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const searchQuery = `${query} tutorial shorts`;
    console.log(`[YouTube] Searching shorts for: ${searchQuery}`);

    const results = await yts(searchQuery);

    const shorts: ShortResult[] = results.videos
      .filter((v: any) => {
        const seconds = v.seconds || 0;
        return seconds > 0 && seconds <= 120;
      })
      .slice(0, 8)
      .map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
        duration: v.timestamp || '0:00',
        views: v.views || 0,
        author: v.author?.name || 'Unknown',
        url: v.url,
      }));

    console.log(`[YouTube] Found ${shorts.length} shorts for: ${query}`);
    res.json({ shorts, query });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[YouTube] Search failed: ${message}`);
    res.status(500).json({ error: 'Failed to fetch YouTube shorts', message });
  }
});

export default router;
