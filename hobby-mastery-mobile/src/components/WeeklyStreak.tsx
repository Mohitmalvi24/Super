import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

interface WeeklyStreakProps {
  streakCount: number;
  lastPracticeDate?: string;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const WeeklyStreak = ({ streakCount, lastPracticeDate }: WeeklyStreakProps) => {
  const flameAnim = useRef(new Animated.Value(1)).current;

  const todayIdx = new Date().getDay();
  const todayMon = todayIdx === 0 ? 6 : todayIdx - 1;

  const today = new Date().toISOString().split('T')[0];
  const practicedToday = lastPracticeDate === today;

  useEffect(() => {
    if (streakCount >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [streakCount]);

  const getStreakMessage = (): string => {
    if (streakCount === 0) return 'Start your streak today!';
    if (streakCount < 3) return 'Building momentum...';
    if (streakCount < 7) return 'On fire! Keep going!';
    if (streakCount < 14) return 'Incredible consistency!';
    return 'Unstoppable learner!';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.flameBadge, { transform: [{ scale: flameAnim }] }]}>
            <Text style={styles.flameEmoji}>🔥</Text>
          </Animated.View>
          <View>
            <Text style={styles.streakNumber}>{streakCount}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
        <Text style={styles.message}>{getStreakMessage()}</Text>
      </View>

      <View style={styles.weekRow}>
        {DAYS.map((day, i) => {
          const isPast = i < todayMon;
          const isToday = i === todayMon;
          const isFuture = i > todayMon;
          const isDone = isPast || (isToday && practicedToday);

          return (
            <View key={`${day}-${i}`} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{day}</Text>
              <View
                style={[
                  styles.dayCircle,
                  isDone && styles.dayCircleDone,
                  isToday && !practicedToday && styles.dayCircleToday,
                  isFuture && styles.dayCircleFuture,
                ]}
              >
                {isDone ? (
                  <Feather name="check" size={14} color="#FFFFFF" />
                ) : isToday ? (
                  <View style={styles.todayDot} />
                ) : (
                  <View style={styles.futureDot} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameEmoji: {
    fontSize: 22,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    lineHeight: 28,
  },
  streakLabel: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },
  message: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.amber[600],
    fontWeight: '600',
    maxWidth: 120,
    textAlign: 'right',
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },
  dayLabelActive: {
    color: Theme.colors.text.primary,
    fontWeight: '800',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleDone: {
    backgroundColor: Theme.colors.success,
  },
  dayCircleToday: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.success,
  },
  dayCircleFuture: {
    backgroundColor: Theme.colors.surfaceElevated,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.success,
  },
  futureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.border,
  },
});
