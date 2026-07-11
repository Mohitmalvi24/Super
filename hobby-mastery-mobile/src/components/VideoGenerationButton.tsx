import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

interface VideoGenerationButtonProps {
  onPress: () => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  onErrorDismiss?: () => void;
  disabled?: boolean;
}

export const VideoGenerationButton = ({
  onPress,
  isLoading = false,
  error = null,
  onErrorDismiss,
  disabled = false,
}: VideoGenerationButtonProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePress = async () => {
    try {
      setIsPressed(true);
      await onPress();
    } finally {
      setIsPressed(false);
    }
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Theme.colors.palette.violet[500]} />
        <Text style={styles.loadingText}>Generating... {elapsedSeconds}s</Text>
      </View>
    );
  }


  if (error) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Feather name="alert-circle" size={16} color={Theme.colors.palette.rose[500]} />
          <Text style={styles.errorButtonText}>Retry</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>{error.message}</Text>
        {onErrorDismiss && (
          <TouchableOpacity onPress={onErrorDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }


  return (
    <TouchableOpacity
      style={[styles.button, isPressed && styles.buttonPressed, disabled && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Feather name="play-circle" size={18} color="#FFFFFF" />
      <Text style={styles.buttonText}>Generate Video</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Theme.colors.palette.violet[500],
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadow.sm,
  },
  buttonPressed: {
    backgroundColor: Theme.colors.palette.violet[600],
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...Theme.typography.bodySm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.palette.violet[300],
  },
  loadingText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.violet[600],
    fontWeight: '600',
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.palette.rose[400],
  },
  errorButtonText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.rose[500],
    fontWeight: '600',
  },
  errorText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  dismissText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.violet[500],
    textAlign: 'center',
    fontWeight: '600',
  },
});
