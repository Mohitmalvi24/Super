import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { VideoGenerationResult } from '../services/VideoService';
import { TechniqueVisual } from './TechniqueVisual';

interface VideoPlayerProps {
  video: VideoGenerationResult | null;
  isLoading?: boolean;
  error?: Error | null;
  fallbackEmoji?: string;
  fallbackHobby?: string;
  fallbackTechnique?: any;
  onRetry?: () => void;
}

export const VideoPlayer = ({
  video,
  isLoading = false,
  error = null,
  fallbackEmoji = '📹',
  fallbackHobby = 'generic',
  fallbackTechnique = { name: 'Technique' },
  onRetry,
}: VideoPlayerProps) => {

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.palette.violet[500]} />
          <Text style={styles.loadingText}>Generating instructional video...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={32} color={Theme.colors.palette.rose[500]} />
        <Text style={styles.errorTitle}>Unable to Generate Video</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }


  if (video) {
    return (
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderEmoji}>🎬</Text>
            <Text style={styles.videoPlaceholderText}>Video Ready!</Text>
            <Text style={styles.videoMetadata}>
              {video.format.toUpperCase()} • {video.resolution} • {video.frameRate}fps
            </Text>
          </View>
        </View>
        <View style={styles.videoMetadataContainer}>
          <View style={styles.metadataRow}>
            <Feather name="film" size={14} color={Theme.colors.text.secondary} />
            <Text style={styles.metadataText}>{video.format.toUpperCase()}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Feather name="maximize-2" size={14} color={Theme.colors.text.secondary} />
            <Text style={styles.metadataText}>{video.resolution}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Feather name="zap" size={14} color={Theme.colors.text.secondary} />
            <Text style={styles.metadataText}>{video.frameRate}fps</Text>
          </View>
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <View style={styles.fallbackContainer}>
        <TechniqueVisual
          hobby={fallbackHobby}
          index={0}
          compact={false}
          fallback={fallbackEmoji}
        />
      </View>
      <Text style={styles.fallbackText}>Video visualization</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 300,
    marginVertical: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: Theme.borderRadius.lg,
  },
  loadingText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  errorTitle: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.palette.rose[500],
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  errorMessage: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Theme.colors.palette.violet[500],
    borderRadius: Theme.borderRadius.md,
  },
  retryButtonText: {
    ...Theme.typography.bodySm,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  videoContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#000000',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors.palette.violet[300],
  },
  videoPlaceholderEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoPlaceholderText: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  videoMetadata: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
  },
  videoMetadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.03)',
    borderBottomLeftRadius: Theme.borderRadius.lg,
    borderBottomRightRadius: Theme.borderRadius.lg,
    marginTop: -4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },

  fallbackContainer: {
    width: '100%',
    height: 240,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(124, 58, 237, 0.03)',
  },
  fallbackText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
