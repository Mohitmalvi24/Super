import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../utils/theme';

export const ProgressBar = ({ progress }: { progress: number }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: Theme.colors.success,
    borderRadius: 4,
  }
});
