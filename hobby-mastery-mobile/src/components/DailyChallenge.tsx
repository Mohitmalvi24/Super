import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DailyChallenge as ChallengeType, ChallengeType as ChallengeKind } from '../types';
import { ApiClient } from '../services/ApiClient';
import { Theme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DailyChallengeProps {
  hobby: string;
  completedChallenges: number;
  onChallengeComplete: (xp: number) => void;
}

const CHALLENGE_CONFIG: Record<ChallengeKind, { icon: string; gradient: readonly [string, string]; label: string }> = {
  'quiz': { icon: 'help-circle', gradient: ['#7C3AED', '#6D28D9'] as const, label: 'QUIZ' },
  'timed-drill': { icon: 'clock', gradient: ['#0EA5E9', '#0284C7'] as const, label: 'TIMED DRILL' },
  'creative-prompt': { icon: 'edit-3', gradient: ['#F59E0B', '#D97706'] as const, label: 'CREATIVE' },
  'reflection': { icon: 'message-circle', gradient: ['#10B981', '#059669'] as const, label: 'REFLECTION' },
};

export const DailyChallenge = ({ hobby, completedChallenges, onChallengeComplete }: DailyChallengeProps) => {
  const [challenge, setChallenge] = useState<ChallengeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [drillTimerActive, setDrillTimerActive] = useState(false);
  const [drillSecondsLeft, setDrillSecondsLeft] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchChallenge();
  }, [hobby]);

  const fetchChallenge = async () => {
    setLoading(true);
    setCompleted(false);
    setSelectedQuizOption(null);
    setQuizRevealed(false);
    setDrillTimerActive(false);
    try {
      const data = await ApiClient.getDailyChallenge(hobby, 'beginner', completedChallenges);
      setChallenge(data);
      if (data.type === 'timed-drill') {
        setDrillSecondsLeft(data.durationMinutes * 60);
      }
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  };

  useEffect(() => {
    if (!drillTimerActive || drillSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setDrillSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setDrillTimerActive(false);
          completeChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [drillTimerActive, drillSecondsLeft]);

  const completeChallenge = useCallback(() => {
    if (completed || !challenge) return;
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(rewardAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(200),
    ]).start();

    onChallengeComplete(challenge.xpReward);
  }, [completed, challenge, onChallengeComplete]);

  const handleQuizSelect = (index: number) => {
    if (quizRevealed) return;
    setSelectedQuizOption(index);
    setQuizRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isCorrect = challenge?.options?.[index]?.isCorrect;
    if (isCorrect) {
      setTimeout(completeChallenge, 600);
    }
  };

  const handleDrillStart = () => {
    setDrillTimerActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Theme.colors.text.muted} />
        <Text style={styles.loadingText}>Loading today's challenge...</Text>
      </View>
    );
  }

  if (!challenge) return null;

  const config = CHALLENGE_CONFIG[challenge.type];

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={config.gradient} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Feather name={config.icon as any} size={12} color="#FFFFFF" />
            <Text style={styles.typeBadgeText}>{config.label}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
          </View>
        </View>

        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{challenge.content}</Text>
        </View>

        {challenge.type === 'quiz' && challenge.options && (
          <View style={styles.optionsContainer}>
            {challenge.options.map((option, idx) => {
              const isSelected = selectedQuizOption === idx;
              const isCorrect = option.isCorrect;
              let optionStyle = styles.optionDefault;
              if (quizRevealed && isSelected && isCorrect) optionStyle = styles.optionCorrect;
              else if (quizRevealed && isSelected && !isCorrect) optionStyle = styles.optionWrong;
              else if (quizRevealed && isCorrect) optionStyle = styles.optionCorrect;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionButton, quizRevealed && optionStyle]}
                  onPress={() => handleQuizSelect(idx)}
                  disabled={quizRevealed}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIndex}>
                    <Text style={styles.optionIndexText}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                  {quizRevealed && isCorrect && (
                    <Feather name="check-circle" size={18} color="#10B981" />
                  )}
                  {quizRevealed && isSelected && !isCorrect && (
                    <Feather name="x-circle" size={18} color="#EF4444" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {challenge.type === 'timed-drill' && !completed && (
          <View style={styles.drillControls}>
            {drillTimerActive ? (
              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>{formatTime(drillSecondsLeft)}</Text>
                <Text style={styles.timerLabel}>remaining</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.drillStartBtn} onPress={handleDrillStart} activeOpacity={0.8}>
                <Feather name="play" size={18} color={config.gradient[0]} />
                <Text style={[styles.drillStartText, { color: config.gradient[0] }]}>Start Drill</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {(challenge.type === 'creative-prompt' || challenge.type === 'reflection') && !completed && (
          <TouchableOpacity style={styles.completeBtn} onPress={completeChallenge} activeOpacity={0.8}>
            <Text style={styles.completeBtnText}>Mark Complete</Text>
            <Feather name="check" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {completed && (
          <Animated.View style={[styles.completedBanner, { opacity: rewardAnim }]}>
            <Feather name="award" size={20} color="#FBBF24" />
            <Text style={styles.completedText}>Challenge Complete! +{challenge.xpReward} XP</Text>
          </Animated.View>
        )}

        {quizRevealed && !challenge.options?.[selectedQuizOption!]?.isCorrect && !completed && (
          <TouchableOpacity style={styles.tryAgainHint} onPress={completeChallenge} activeOpacity={0.7}>
            <Text style={styles.tryAgainText}>Not quite — but learning from mistakes counts! Tap to claim XP.</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },
  card: {
    borderRadius: Theme.borderRadius.xxl,
    padding: 24,
    ...Theme.shadow.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    ...Theme.typography.label,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    ...Theme.typography.headingSm,
    color: '#FFFFFF',
  },
  challengeTitle: {
    ...Theme.typography.displaySm,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  challengeDescription: {
    ...Theme.typography.bodyMd,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  contentBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
  },
  contentText: {
    ...Theme.typography.bodyLg,
    color: '#FFFFFF',
    lineHeight: 26,
  },

  optionsContainer: {
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionDefault: {},
  optionCorrect: {
    backgroundColor: 'rgba(16,185,129,0.25)',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderColor: '#EF4444',
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    ...Theme.typography.headingSm,
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: '#FFFFFF',
  },

  drillControls: {
    alignItems: 'center',
    marginTop: 8,
  },
  drillStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Theme.borderRadius.lg,
  },
  drillStartText: {
    fontSize: 16,
    fontWeight: '700',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...Theme.typography.bodySm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
  completeBtnText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },

  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.lg,
    marginTop: 8,
  },
  completedText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },

  tryAgainHint: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Theme.borderRadius.md,
  },
  tryAgainText: {
    ...Theme.typography.bodyMd,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});
