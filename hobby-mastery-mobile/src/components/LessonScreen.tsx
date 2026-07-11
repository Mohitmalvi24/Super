import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LessonScreenProps {
  technique: Technique;
  onBack: () => void;
  onComplete: () => void;
  totalXp: number;
}

export const LessonScreen = ({ technique, onBack, onComplete, totalXp }: LessonScreenProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalSteps = technique.lesson.steps.length;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{technique.name}</Text>
          <View style={styles.headerSubtitleRow}>
            <Feather name="book-open" size={12} color={Theme.colors.text.muted} />
            <Text style={styles.headerSubtitle}>Lesson</Text>
          </View>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeIcon}>💎</Text>
          <Text style={styles.xpBadgeText}>+{technique.status === 'mastered' ? 0 : 25} XP</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>Card {activeStep + 1} of {totalSteps}</Text>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.visualCard}>
          <Text style={styles.visualEmoji}>{technique.emoji}</Text>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <View style={styles.iconCircle}>
              <Feather name="zap" size={16} color={Theme.colors.accent} />
            </View>
            <Text style={styles.instructionTitle}>{technique.lesson.steps[activeStep].title}</Text>
          </View>

          <Text style={styles.instructionBody}>
            {technique.lesson.steps[activeStep].body}
          </Text>

          {activeStep === totalSteps - 1 && technique.lesson.proTips.length > 0 && (
            <View style={styles.proTipBox}>
              <Text style={styles.proTipTitle}>Pro Tip:</Text>
              <Text style={styles.proTipText}>{technique.lesson.proTips[0]}</Text>
            </View>
          )}

          {activeStep === totalSteps - 1 && (
            <View style={styles.goalBox}>
              <Feather name="target" size={16} color={Theme.colors.success} />
              <Text style={styles.goalText}>{technique.lesson.exercise.goal}</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Feather
            name={activeStep === totalSteps - 1 ? 'grid' : 'arrow-right'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {activeStep === totalSteps - 1 ? 'Try Yourself' : 'Next Step'}
          </Text>
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
    paddingHorizontal: 16,
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
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  xpBadgeIcon: {
    fontSize: 12,
  },
  xpBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Theme.colors.border,
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  visualCard: {
    backgroundColor: '#F3F4F6', // Soft slate-100 style
    borderRadius: Theme.borderRadius.xl,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    height: SCREEN_WIDTH * 0.7,
  },
  visualEmoji: {
    fontSize: 80,
  },

  instructionCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.palette.amber[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  instructionBody: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
  },

  proTipBox: {
    backgroundColor: Theme.colors.infoLight,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.info,
  },
  proTipTitle: {
    ...Theme.typography.headingSm,
    color: Theme.colors.infoDark,
    marginBottom: 4,
  },
  proTipText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },

  goalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.successLight,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    gap: 12,
  },
  goalText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.successDark,
    flex: 1,
    fontWeight: '500',
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.lg,
    gap: 8,
  },
  actionButtonText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },
});
