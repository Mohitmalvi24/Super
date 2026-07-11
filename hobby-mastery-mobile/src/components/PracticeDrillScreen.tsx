import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PracticeDrillScreenProps {
  technique: Technique;
  onBack: () => void;
  onComplete: () => void;
}

export const PracticeDrillScreen = ({ technique, onBack, onComplete }: PracticeDrillScreenProps) => {
  const [timeLeft, setTimeLeft] = useState(technique.lesson.exercise.durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [confidence, setConfidence] = useState(2); // 0-4 scale for low to high

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ]).start();
      
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{technique.name} Practice</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeIcon}>💎</Text>
          <Text style={styles.xpBadgeText}>25 XP</Text>
        </View>
      </View>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{technique.lesson.exercise.title}</Text>
        <Text style={styles.pageSub}>{technique.lesson.exercise.goal}</Text>

        <View style={styles.visualContainer}>
          <View style={styles.visualOverlay}>
            <Feather name="eye" size={16} color="#FFFFFF" style={{marginRight: 6}} />
            <Text style={styles.visualOverlayText}>Reference</Text>
          </View>
          <Text style={styles.visualEmoji}>{technique.emoji}</Text>
        </View>

        <View style={styles.hintCard}>
          <View style={styles.hintIconBox}>
            <Feather name="zap" size={20} color={Theme.colors.primary} />
          </View>
          <View style={styles.hintTextContent}>
            <Text style={styles.hintTitle}>Experiment and learn!</Text>
            <Text style={styles.hintBody}>{technique.lesson.exercise.instruction}</Text>
          </View>
          <View style={styles.hintBadge}>
            <Feather name="zap" size={12} color={Theme.colors.text.primary} style={{marginRight: 4}} />
            <Text style={styles.hintBadgeText}>Hint</Text>
          </View>
        </View>

        <View style={styles.confidenceSection}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceTitle}>Confidence <Feather name="info" size={14} color={Theme.colors.text.muted}/></Text>
            <Text style={styles.confidenceSub}>How comfortable do you feel?</Text>
          </View>
          <View style={styles.confidenceMeter}>
            {[0, 1, 2, 3, 4].map(level => (
              <TouchableOpacity 
                key={level}
                onPress={() => setConfidence(level)}
                style={[
                  styles.confidenceBar,
                  confidence >= level ? styles.confidenceBarActive : styles.confidenceBarInactive
                ]}
              />
            ))}
          </View>
          <View style={styles.confidenceLabels}>
            <Text style={styles.confidenceLabelText}>Low</Text>
            <Text style={styles.confidenceLabelText}>High</Text>
          </View>
        </View>

      </Animated.ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.timerControl} onPress={toggleTimer}>
          <Feather name={isActive ? "pause-circle" : "play-circle"} size={28} color={Theme.colors.success} />
          <View style={styles.timerTextCol}>
            <Animated.Text style={[styles.timerTime, { transform: [{ scale: isActive ? pulseAnim : 1 }] }]}>
              {formatTime(timeLeft)}
            </Animated.Text>
            <Text style={styles.timerLabel}>Time Left</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.completeBtn} onPress={onComplete} activeOpacity={0.8}>
          <Text style={styles.completeBtnText}>Complete Drill</Text>
          <Feather name="activity" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
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
  headerTitle: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.secondary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  xpBadgeIcon: { fontSize: 12 },
  xpBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    ...Theme.typography.displaySm,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  pageSub: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    marginBottom: 24,
  },

  visualContainer: {
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#F3F4F6',
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    position: 'relative',
    overflow: 'hidden',
  },
  visualOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  visualOverlayText: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
  },
  visualEmoji: {
    fontSize: 80,
  },

  hintCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    padding: 20,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: 32,
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  hintIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  hintTextContent: {
    flex: 1,
  },
  hintTitle: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  hintBody: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 28,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  hintBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.primary,
  },

  confidenceSection: {
    backgroundColor: Theme.colors.surface,
    padding: 24,
    borderRadius: Theme.borderRadius.xl,
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  confidenceHeader: {
    marginBottom: 16,
  },
  confidenceTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  confidenceSub: {
    ...Theme.typography.caption,
    color: Theme.colors.text.secondary,
  },
  confidenceMeter: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  confidenceBarActive: {
    backgroundColor: Theme.colors.success,
  },
  confidenceBarInactive: {
    backgroundColor: Theme.colors.border,
  },
  confidenceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceLabelText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
    gap: 16,
  },
  timerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerTextCol: {
    justifyContent: 'center',
  },
  timerTime: {
    ...Theme.typography.headingLg,
    color: Theme.colors.successDark,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 10,
    color: Theme.colors.text.muted,
    fontWeight: '600',
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.success,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.xl,
    gap: 8,
  },
  completeBtnText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },
});
