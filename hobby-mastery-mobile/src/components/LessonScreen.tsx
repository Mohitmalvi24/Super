import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Image,
  ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { Technique } from '../types';
import { VisualImageService } from '../services/VisualImageService';
import { LearningContext } from '../store/LearningContext';
import { useContext } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LessonScreenProps {
  technique: Technique;
  onBack: () => void;
  onComplete: () => void;
  totalXp: number;
  hobby?: string;
}

export const LessonScreen = ({ technique, onBack, onComplete, totalXp, hobby }: LessonScreenProps) => {
  const ctx = useContext(LearningContext);
  const plan = ctx?.plan;
  const [activeStep, setActiveStep] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const totalSteps = technique.lesson.steps.length;
  const progress = ((activeStep + 1) / totalSteps) * 100;
  const currentStep = technique.lesson.steps[activeStep];
  const lessonHobby = hobby || plan?.hobby || 'generic';
  const imageUri = VisualImageService.getTechniqueImageUrl(lessonHobby, technique.name, 280, 200);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="chevron-left" size={22} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{technique.name}</Text>
          <View style={styles.headerMeta}>
            <Feather name="book-open" size={11} color={Theme.colors.text.muted} />
            <Text style={styles.headerMetaText}>Lesson</Text>
          </View>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpIcon}>💎</Text>
          <Text style={styles.xpText}>+25 XP</Text>
        </View>
      </View>

      {/* Progress Segments */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          {technique.lesson.steps.map((_, i) => (
            <View key={i} style={[
              styles.progressSegment,
              i <= activeStep ? styles.progressSegmentActive : styles.progressSegmentInactive
            ]} />
          ))}
        </View>
        <Text style={styles.cardCount}>Card {activeStep + 1} of {totalSteps}</Text>
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={[styles.scrollArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Visual Block (White Card style from Chess target) */}
        <View style={styles.visualBlock}>
          {!imageFailed ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.visualImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Text style={styles.visualEmoji}>{technique.emoji}</Text>
          )}
        </View>

        {/* Explanation Card */}
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <View style={styles.explanationIcon}>
              <Feather name="zap" size={16} color="#D97706" />
            </View>
            <Text style={styles.explanationTitle}>{currentStep.title}</Text>
          </View>
          <Text style={styles.explanationBody}>{currentStep.body}</Text>
        </View>

      </Animated.ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          {activeStep === totalSteps - 1 && (
            <Feather name="grid" size={18} color="#FFFFFF" />
          )}
          <Text style={styles.primaryBtnText}>
            {activeStep === totalSteps - 1 ? 'Try Yourself' : 'Try Yourself'}
          </Text>
          <Feather name="chevron-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerMetaText: {
    fontSize: 12,
    color: Theme.colors.text.muted,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.palette.violet[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  xpIcon: { fontSize: 12 },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  progressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: Theme.colors.primary,
  },
  progressSegmentInactive: {
    backgroundColor: Theme.colors.border,
  },
  cardCount: {
    fontSize: 12,
    color: Theme.colors.text.muted,
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  visualBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 12,
    marginBottom: 14,
    height: SCREEN_WIDTH * 0.62,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Theme.shadow.sm,
  },
  visualImage: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.xl - 10,
  },
  visualEmoji: {
    fontSize: 64,
    alignSelf: 'center',
    marginTop: 28,
  },

  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Theme.shadow.sm,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  explanationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7', // light amber
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  explanationBody: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },

  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.successLight,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    marginTop: 20,
    gap: 10,
  },
  goalIcon: {
  },
  goalText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.successDark,
    fontWeight: '500',
  },

  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  swipeHintCenter: {
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.palette.violet[400],
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.xl,
    gap: 8,
  },
  primaryBtnText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },
});
