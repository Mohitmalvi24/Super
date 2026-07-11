import { useState, useCallback, useRef } from 'react';
import { Technique } from '../types';
import { VideoService, VideoGenerationResult } from '../services/VideoService';



export interface UseVideoGenerationOptions {
  techniqueId: string;
  technique: Technique;
  hobby: string;
  onSuccess?: (video: VideoGenerationResult) => void;
  onError?: (error: Error) => void;
}

export interface UseVideoGenerationReturn {
  video: VideoGenerationResult | null;
  isLoading: boolean;
  error: Error | null;
  generateVideo: () => Promise<void>;
  cancel: () => void;
  retry: () => Promise<void>;
}



export function useVideoGeneration(options: UseVideoGenerationOptions): UseVideoGenerationReturn {
  const { techniqueId, technique, hobby, onSuccess, onError } = options;

  const [video, setVideo] = useState<VideoGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);


  const generateVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`[useVideoGeneration] Starting video generation for technique: ${techniqueId}`);

      const result = await VideoService.generateVideo(techniqueId, technique, hobby);

      setVideo(result);
      setError(null);

      if (onSuccess) {
        onSuccess(result);
      }

      console.log(`[useVideoGeneration] Video generation completed for technique: ${techniqueId}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');

      console.error(`[useVideoGeneration] Video generation failed: ${error.message}`);

      setError(error);
      setVideo(null);

      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [techniqueId, technique, hobby, onSuccess, onError]);

  const cancel = useCallback(() => {
    console.log(`[useVideoGeneration] Cancelling video generation for technique: ${techniqueId}`);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setError(null);
  }, [techniqueId]);


  const retry = useCallback(async () => {
    console.log(`[useVideoGeneration] Retrying video generation for technique: ${techniqueId}`);
    setError(null);
    await generateVideo();
  }, [techniqueId, generateVideo]);

  return {
    video,
    isLoading,
    error,
    generateVideo,
    cancel,
    retry,
  };
}
