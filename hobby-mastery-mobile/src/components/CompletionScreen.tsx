import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CompletionScreenProps {
  technique: Technique;
  xpEarned: number;
  streakCount: number;
  progressBefore: number;
  progressNow: number;
  nextTechnique: Technique | null;
  onContinue: () => void;
  onBackToHome: () => void;
}

export const CompletionScreen = ({
  technique, xpEarned, streakCount,
  progressBefore, progressNow, nextTechnique,
  onContinue, onBackToHome,
}: CompletionScreenProps) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(progressBefore)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(progressAnim, {
        toValue: progressNow,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onBackToHome}>
          <Feather name="x" size={20} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Animated.View style={[styles.starContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.starEmoji}>🌟</Text>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>Well done!</Text>
          <Text style={styles.subtitle}>You've completed</Text>
          <Text style={styles.techniqueName}>{technique.name}</Text>
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💎</Text>
            <Text style={styles.statValue}>+{xpEarned} XP</Text>
            <Text style={styles.statLabel}>Experience earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streakCount} Days</Text>
            <Text style={styles.statLabel}>Streak updated</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.progressLabels}>
            <View>
              <Text style={styles.progressNum}>{progressBefore}%</Text>
              <Text style={styles.progressSub}>Before</Text>
            </View>
            <Feather name="chevrons-up" size={24} color={Theme.colors.success} />
            <View>
              <Text style={styles.progressNumSuccess}>{progressNow}%</Text>
              <Text style={styles.progressSub}>Now</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            <View style={styles.progressKnob} />
          </View>
        </View>

        {nextTechnique && (
          <View style={styles.nextSection}>
            <Text style={styles.nextTitle}>What's Next?</Text>
            <Text style={styles.nextSub}>Keep going! Your next lesson is ready.</Text>
            
            <View style={styles.nextCard}>
              <View style={styles.nextVisual}>
                <Text style={{ fontSize: 32 }}>{nextTechnique.emoji || '🎯'}</Text>
              </View>
              <View style={styles.nextInfo}>
                <View style={styles.nextTag}>
                  <Text style={styles.nextTagText}>Next Lesson</Text>
                </View>
                <Text style={styles.nextName}>{nextTechnique.name}</Text>
                <Text style={styles.nextDesc} numberOfLines={2}>
                  {nextTechnique.description}
                </Text>
                <View style={styles.nextMeta}>
                  <Feather name="clock" size={12} color={Theme.colors.text.muted} />
                  <Text style={styles.nextMetaText}>{nextTechnique.estimatedMinutes} min</Text>
                  <View style={styles.levelTag}>
                    <Text style={styles.levelTagText}>{nextTechnique.level}</Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={Theme.colors.text.muted} />
            </View>
          </View>
        )}
      </Animated.ScrollView>

      <View style={styles.footer}>
        {nextTechnique ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Continue Journey</Text>
            <Feather name="chevron-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={onBackToHome} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        )}
        
        {nextTechnique && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onBackToHome} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  starContainer: {
    marginBottom: 20,
  },
  starEmoji: {
    fontSize: 100,
  },
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  techniqueName: {
    ...Theme.typography.displaySm,
    color: Theme.colors.primary,
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  statValue: {
    ...Theme.typography.headingLg,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },

  progressCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
    marginBottom: 32,
  },
  progressTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 24,
  },
  progressNum: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  progressNumSuccess: {
    ...Theme.typography.headingLg,
    color: Theme.colors.success,
    textAlign: 'center',
  },
  progressSub: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: Theme.colors.palette.violet[100],
    borderRadius: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 12,
    backgroundColor: Theme.colors.primary,
    borderRadius: 6,
  },
  progressKnob: {
    position: 'absolute',
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: Theme.colors.primary,
  },

  nextSection: {
    alignItems: 'center',
  },
  nextTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  nextSub: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    marginBottom: 16,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.successLight,
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.successBorder,
  },
  nextVisual: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nextInfo: {
    flex: 1,
  },
  nextTag: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  nextTagText: {
    ...Theme.typography.caption,
    color: Theme.colors.successDark,
  },
  nextName: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  nextDesc: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    marginBottom: 8,
  },
  nextMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextMetaText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
    marginRight: 8,
  },
  levelTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelTagText: {
    fontSize: 10,
    color: Theme.colors.successDark,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FAFAFA',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: 12,
  },
  primaryBtnText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
    marginRight: 8,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    ...Theme.typography.headingSm,
    color: Theme.colors.primary,
  },
});
