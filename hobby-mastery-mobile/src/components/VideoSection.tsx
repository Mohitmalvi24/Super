import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../utils/theme';
import { Technique } from '../types';
import { useVideoGeneration } from '../hooks/useVideoGeneration';
import { VideoPlayer } from './VideoPlayer';
import { VideoGenerationButton } from './VideoGenerationButton';

interface VideoSectionProps {
  technique: Technique;
  hobby: string;
  autoGenerate?: boolean;
}

export const VideoSection = ({
  technique,
  hobby,
  autoGenerate = false,
}: VideoSectionProps) => {
  const [shouldShowError, setShouldShowError] = useState(true);

  const {
    video,
    isLoading,
    error,
    generateVideo,
    retry,
  } = useVideoGeneration({
    techniqueId: technique.id,
    technique,
    hobby,
    onSuccess: () => {
      setShouldShowError(true);
    },
    onError: (err) => {
      console.error('[VideoSection] Video generation error:', err);
      setShouldShowError(true);
    },
  });


  useEffect(() => {
    if (autoGenerate && !video && !isLoading && !error) {
      console.log('[VideoSection] Auto-generating video for technique:', technique.id);
      generateVideo().catch(err => {
        console.error('[VideoSection] Auto-generation failed:', err);
      });
    }
  }, [autoGenerate, video, isLoading, error, generateVideo, technique.id]);

  const handleErrorDismiss = () => {
    setShouldShowError(false);
  };

  return null;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 0,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
  fallbackTip: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.palette.amber[500],
    borderRadius: Theme.borderRadius.md,
  },
  fallbackTipText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.amber[700],
    lineHeight: 18,
  },
});
