import { Router, Request, Response } from 'express';
import { textToVideoService, VideoGenerationResult } from '../services/textToVideo.service';
import { Technique } from '../types';

const router = Router();

/**
 * POST /api/video/generate
 * Generate a video from a technique description
 * 
 * Request body:
 * {
 *   techniqueId: string;
 *   technique: Technique;
 *   hobby: string;
 * }
 * 
 * Response:
 * {
 *   videoUrl: string;
 *   format: 'mp4' | 'webm';
 *   resolution: string;
 *   frameRate: number;
 *   duration: number;
 *   fileSize: number;
 *   generatedAt: number;
 *   techniqueId: string;
 * }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { techniqueId, technique, hobby } = req.body;


    if (!techniqueId || !technique || !hobby) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Missing required fields: techniqueId, technique, hobby',
      });
    }


    if (!technique.name || !technique.description) {
      return res.status(400).json({
        error: 'INVALID_TECHNIQUE',
        message: 'Technique must have name and description',
      });
    }

    console.log(`[VideoRoutes] Received video generation request for technique: ${techniqueId}`);

    const result: VideoGenerationResult = await textToVideoService.generateVideo(
      techniqueId,
      technique as Technique,
      hobby
    );


    console.log(`[VideoRoutes] Video generation completed for technique: ${techniqueId}`);

    return res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[VideoRoutes] Error in video generation: ${errorMessage}`);


    if (errorMessage.includes('RATE_LIMIT')) {
      return res.status(429).json({
        error: 'RATE_LIMIT',
        message: 'Video generation is temporarily unavailable due to rate limiting. Please try again in a few minutes.',
        retryAfter: 300,
      });
    }

    if (errorMessage.includes('TIMEOUT')) {
      return res.status(408).json({
        error: 'TIMEOUT',
        message: 'Video generation timed out. Please try again.',
      });
    }

    if (errorMessage.includes('UNAVAILABLE')) {
      return res.status(503).json({
        error: 'API_UNAVAILABLE',
        message: 'Video generation service is temporarily unavailable. Lesson content is still available.',
      });
    }

    if (errorMessage.includes('not properly configured')) {
      return res.status(500).json({
        error: 'SERVICE_MISCONFIGURED',
        message: 'Video generation is not properly configured. Please contact support.',
      });
    }

    return res.status(500).json({
      error: 'GENERATION_FAILED',
      message: 'Video generation failed. Please try again later.',
    });
  }
});


router.get('/stats', (_req: Request, res: Response) => {
  const stats = textToVideoService.getCacheStats();
  res.json(stats);
});


router.post('/cache/clear', (_req: Request, res: Response) => {
  textToVideoService.clearAllCache();
  res.json({ success: true, message: 'Cache cleared' });
});

export default router;
