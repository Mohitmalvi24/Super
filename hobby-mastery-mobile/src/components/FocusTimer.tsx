import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

interface FocusTimerProps {
  initialMinutes: number;
  onComplete: () => void;
}

export const FocusTimer = ({ initialMinutes, onComplete }: FocusTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(seconds => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      if (isActive) {
        setIsActive(false);
        onComplete();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, onComplete]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: secondsLeft / (initialMinutes * 60),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [secondsLeft, initialMinutes]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(initialMinutes * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Animated.View style={[styles.progressRing, {
          transform: [{
            scale: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1.05]
            })
          }]
        }]} />

        <Text style={styles.timeText}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </Text>
        <Text style={styles.label}>FOCUS MODE</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
          <Feather name="rotate-ccw" size={24} color={Theme.colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, isActive && styles.pauseBtn]}
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          <Feather name={isActive ? "pause" : "play"} size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.palette.slate[900],
    borderRadius: Theme.borderRadius.xxl,
    padding: 32,
    alignItems: 'center',
    marginVertical: 16,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: Theme.colors.palette.slate[800],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Theme.colors.success,
    opacity: 0.2,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...Theme.typography.label,
    color: Theme.colors.success,
    letterSpacing: 2,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlBtn: {
    padding: 12,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.palette.slate[700],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pauseBtn: {
    backgroundColor: Theme.colors.warning,
    shadowColor: Theme.colors.warning,
  }
});
