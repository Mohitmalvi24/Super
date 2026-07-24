import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideUpAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(progressAnim, {
        toValue: progressNow,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.palette.blue[900], Theme.colors.palette.blue[700], Theme.colors.palette.blue[500]]}
        style={styles.headerBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <TouchableOpacity style={styles.closeBtn} onPress={onBackToHome}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Animated.View style={[styles.badgeContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['#FCD34D', '#F59E0B', '#D97706']}
              style={styles.badgeGradient}
            >
              <Feather name="award" size={48} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.badgeGlow} />
          </Animated.View>
          
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <Text style={styles.title}>Lesson Complete!</Text>
            <View style={styles.techniquePill}>
              <Text style={styles.techniqueName}>{technique.name}</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: Theme.colors.palette.blue[50] }]}>
              <Feather name="zap" size={24} color={Theme.colors.palette.blue[600]} />
            </View>
            <View>
              <Text style={styles.statValue}>+{xpEarned} XP</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: Theme.colors.palette.amber[50] }]}>
              <Feather name="trending-up" size={24} color={Theme.colors.palette.amber[500]} />
            </View>
            <View>
              <Text style={styles.statValue}>{streakCount} Days</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Mastery Progress</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            <Animated.View style={[styles.progressKnob, { left: progressWidth }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressSub}>{progressBefore}% Before</Text>
            <Text style={styles.progressNumSuccess}>{progressNow}% Now</Text>
          </View>
        </View>

        {nextTechnique && (
          <View style={styles.nextSection}>
            <Text style={styles.nextSectionTitle}>Up Next</Text>
            <TouchableOpacity style={styles.nextCard} activeOpacity={0.9} onPress={onContinue}>
              <View style={styles.nextVisual}>
                <Feather name="play-circle" size={28} color={Theme.colors.primary} />
              </View>
              <View style={styles.nextInfo}>
                <Text style={styles.nextName}>{nextTechnique.name}</Text>
                <Text style={styles.nextDesc} numberOfLines={1}>
                  {nextTechnique.description}
                </Text>
                <View style={styles.nextMeta}>
                  <Feather name="clock" size={14} color={Theme.colors.text.muted} />
                  <Text style={styles.nextMetaText}>{nextTechnique.estimatedMinutes} min</Text>
                  <View style={styles.levelTag}>
                    <Text style={styles.levelTagText}>{nextTechnique.level.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {nextTechnique ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.85}>
            <LinearGradient
              colors={[Theme.colors.primary, Theme.colors.palette.blue[700]]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Continue Journey</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={onBackToHome} activeOpacity={0.85}>
            <LinearGradient
              colors={[Theme.colors.primary, Theme.colors.palette.blue[700]]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {nextTechnique && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onBackToHome} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerBackground: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Theme.shadow.lg,
  },
  headerSafeArea: {
    alignItems: 'center',
    position: 'relative',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 24 : 16,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeContainer: {
    marginTop: 20,
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Theme.shadow.md,
  },
  badgeGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FCD34D',
    opacity: 0.3,
    zIndex: 1,
  },
  title: {
    ...Theme.typography.displayMd,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 12,
  },
  techniquePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
  },
  techniqueName: {
    ...Theme.typography.headingSm,
    color: '#FFFFFF',
  },

  content: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    ...Theme.shadow.sm,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },

  progressCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    ...Theme.shadow.sm,
    marginBottom: 32,
  },
  progressTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressNumSuccess: {
    ...Theme.typography.bodyMd,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  progressSub: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },
  progressBarContainer: {
    width: '100%',
    height: 14,
    backgroundColor: Theme.colors.palette.slate[100],
    borderRadius: 7,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 14,
    backgroundColor: Theme.colors.primary,
    borderRadius: 7,
  },
  progressKnob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    top: -5,
    marginLeft: -12,
    ...Theme.shadow.sm,
  },

  nextSection: {
    marginTop: 8,
  },
  nextSectionTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  nextVisual: {
    width: 60,
    height: 60,
    backgroundColor: Theme.colors.palette.blue[50],
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nextInfo: {
    flex: 1,
  },
  nextName: {
    ...Theme.typography.headingSm,
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
    marginRight: 12,
  },
  levelTag: {
    backgroundColor: Theme.colors.palette.slate[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  primaryBtn: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    ...Theme.shadow.md,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  primaryBtnText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
    marginRight: 8,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryBtnText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },
});

