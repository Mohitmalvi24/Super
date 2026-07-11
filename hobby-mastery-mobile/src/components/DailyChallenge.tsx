import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ActivityIndicator, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DailyChallenge as ChallengeType } from '../types';
import { ApiClient } from '../services/ApiClient';
import { VisualImageService } from '../services/VisualImageService';
import { Theme } from '../utils/theme';

interface DailyChallengeProps {
  hobby: string;
  completedChallenges: number;
  onChallengeComplete: (xp: number) => void;
}

const normalize = (value: string): string => value.trim().toLowerCase();

const getHobbyKind = (hobby: string): 'chess' | 'football' | 'generic' => {
  const normalized = normalize(hobby);
  if (normalized.includes('chess')) return 'chess';
  if (normalized.includes('football') || normalized.includes('soccer')) return 'football';
  return 'generic';
};

const ChessChallengeVisual = () => (
  <View style={styles.chessBoard}>
    {Array.from({ length: 64 }).map((_, cell) => {
      const row = Math.floor(cell / 8);
      const col = cell % 8;
      const piece = [
        { row: 0, col: 3, label: 'Q' },
        { row: 0, col: 6, label: 'K' },
        { row: 2, col: 5, label: 'P' },
        { row: 3, col: 0, label: 'B' },
        { row: 3, col: 3, label: 'N' },
        { row: 3, col: 5, label: 'B' },
      ].find(p => p.row === row && p.col === col);

      return (
        <View key={cell} style={[styles.chessSquare, (row + col) % 2 === 0 ? styles.chessLight : styles.chessDark]}>
          {piece && <Text style={styles.chessPiece}>{piece.label}</Text>}
        </View>
      );
    })}
  </View>
);

const FootballChallengeVisual = () => (
  <View style={styles.footballPitch}>
    <View style={styles.pitchBox} />
    <View style={styles.pitchCircle} />
    <View style={[styles.pitchDot, styles.pitchDotOne]} />
    <View style={[styles.pitchDot, styles.pitchDotTwo]} />
    <View style={[styles.pitchDot, styles.pitchDotThree]} />
    <View style={styles.pitchPassLine} />
  </View>
);

const ChallengeVisual = ({ hobby, imageUri }: { hobby: string; imageUri?: string }) => {
  const kind = getHobbyKind(hobby);
  if (kind === 'chess') return <ChessChallengeVisual />;
  if (kind === 'football') return <FootballChallengeVisual />;
  if (imageUri) return <Image source={{ uri: imageUri }} style={styles.challengeImage} resizeMode="cover" />;
  return <View style={styles.visualFallback}><Feather name="target" size={34} color={Theme.colors.primary} /></View>;
};

export const DailyChallenge = ({ hobby, completedChallenges, onChallengeComplete }: DailyChallengeProps) => {
  const [challenge, setChallenge] = useState<ChallengeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [challengeImage, setChallengeImage] = useState<string | undefined>();

  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchChallenge();
  }, [hobby]);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!challenge) return;
      const imageUri = await VisualImageService.getTechniqueImage(hobby, challenge.title);
      if (isMounted && imageUri) setChallengeImage(imageUri);
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [challenge?.title, hobby]);

  const fetchChallenge = async () => {
    setLoading(true);
    setCompleted(false);
    setChallengeImage(undefined);

    try {
      const data = await ApiClient.getDailyChallenge(hobby, 'beginner', completedChallenges);
      setChallenge(data);
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]).start();
    }
  };

  const completeChallenge = useCallback(() => {
    if (completed || !challenge) return;

    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(rewardAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    onChallengeComplete(challenge.xpReward);
  }, [completed, challenge, onChallengeComplete]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Theme.colors.text.muted} />
        <Text style={styles.loadingText}>Loading today's challenge...</Text>
      </View>
    );
  }

  if (!challenge) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.card}>
        <ChallengeVisual hobby={hobby} imageUri={challengeImage} />

        <View style={styles.challengeCopy}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription} numberOfLines={2}>{challenge.description}</Text>

          <View style={styles.rewardBlock}>
            <Text style={styles.rewardLabel}>Reward</Text>
            <View style={styles.rewardRow}>
              <View style={styles.rewardItem}>
                <Feather name="zap" size={14} color={Theme.colors.primary} />
                <Text style={styles.rewardText}>+{challenge.xpReward} XP</Text>
              </View>
              <View style={styles.rewardItem}>
                <Feather name="activity" size={14} color="#F97316" />
                <Text style={styles.rewardText}>+1 Streak</Text>
              </View>
            </View>
          </View>

          {!completed ? (
            <TouchableOpacity style={styles.primaryButton} onPress={completeChallenge} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>
                {getHobbyKind(hobby) === 'chess' ? 'Start Puzzle' : 'Start Drill'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Animated.View style={[styles.completedBanner, { opacity: rewardAnim }]}>
              <Feather name="award" size={18} color={Theme.colors.primary} />
              <Text style={styles.completedText}>Complete</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 22,
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
    minHeight: 170,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    ...Theme.shadow.md,
  },
  challengeCopy: {
    flex: 1,
    marginLeft: 16,
  },
  challengeTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  challengeDescription: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  rewardBlock: {
    marginBottom: 14,
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  primaryButton: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    ...Theme.shadow.sm,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  completedBanner: {
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primaryBg,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  challengeImage: {
    width: 118,
    height: 118,
    borderRadius: 10,
  },
  visualFallback: {
    width: 118,
    height: 118,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primaryBg,
  },
  chessBoard: {
    width: 118,
    height: 118,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.16)',
  },
  chessSquare: {
    width: '12.5%',
    height: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chessLight: {
    backgroundColor: '#F7F3FF',
  },
  chessDark: {
    backgroundColor: '#CBD6A3',
  },
  chessPiece: {
    fontSize: 10,
    fontWeight: '900',
    color: '#111827',
  },
  footballPitch: {
    width: 118,
    height: 118,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#27AE60',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.18)',
  },
  pitchBox: {
    position: 'absolute',
    left: 9,
    right: 9,
    top: 9,
    bottom: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 8,
  },
  pitchCircle: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    left: 36,
    top: 36,
  },
  pitchDot: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#14532D',
  },
  pitchDotOne: {
    left: 23,
    top: 29,
  },
  pitchDotTwo: {
    left: 54,
    top: 59,
  },
  pitchDotThree: {
    left: 82,
    top: 34,
  },
  pitchPassLine: {
    position: 'absolute',
    width: 70,
    height: 2,
    left: 28,
    top: 54,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    transform: [{ rotate: '22deg' }],
  },
});
