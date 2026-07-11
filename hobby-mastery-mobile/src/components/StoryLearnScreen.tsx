import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per slide

interface StoryLearnScreenProps {
  technique: Technique;
  onClose: () => void;
  onComplete: () => void;
}

export const StoryLearnScreen = ({ technique, onClose, onComplete }: StoryLearnScreenProps) => {
  // Slides: 1 Overview, N Steps, 1 Quick Question
  const slides = [
    { type: 'overview', title: 'Introduction', content: technique.lesson.overview },
    ...technique.lesson.steps.map(s => ({ type: 'step', title: s.title, content: s.body })),
    { type: 'quiz', title: 'Quick Question' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  
  // Fake quiz for now if backend doesn't have it (handles backward compatibility)
  const quiz = (technique.lesson as any).quickQuestion || {
    question: `What is the primary focus of ${technique.name}?`,
    options: [
      { id: 'a', text: technique.name, isCorrect: true, emoji: technique.emoji },
      { id: 'b', text: "Rhythm & Timing", isCorrect: false, emoji: '⏱️' },
      { id: 'c', text: "Advanced Theory", isCorrect: false, emoji: '📚' },
    ]
  };

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Handle auto-advance
  useEffect(() => {
    progressAnim.setValue(0);
    
    if (slides[currentIndex].type === 'quiz') {
      // Don't auto-advance on quiz
      return;
    }

    if (!isPaused) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: STORY_DURATION,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });
    } else {
      progressAnim.stopAnimation();
    }
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (slides[currentIndex].type === 'quiz' && quizAnswered) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handlePress = (evt: any) => {
    // If on quiz, tapping screen shouldn't advance unless they answered
    if (slides[currentIndex].type === 'quiz') return;

    const x = evt.nativeEvent.locationX;
    if (x < SCREEN_WIDTH / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleHoldIn = () => setIsPaused(true);
  const handleHoldOut = () => setIsPaused(false);

  const handleQuizSelect = (isCorrect: boolean) => {
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    setQuizAnswered(true);
    // Auto advance after 1.5 seconds if correct
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      {/* Background visual representation */}
      <LinearGradient
        colors={[Theme.colors.palette.slate[900], Theme.colors.palette.slate[800]]}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.backgroundEmojiContainer}>
          <Text style={styles.backgroundEmoji}>{technique.emoji}</Text>
        </View>
        <LinearGradient
          colors={['rgba(15,23,42,0.3)', 'rgba(15,23,42,0.95)']}
          style={StyleSheet.absoluteFill}
        />
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {slides.map((_, i) => (
            <View key={i} style={styles.progressBarBg}>
              {i === currentIndex && (
                <Animated.View style={[
                  styles.progressBarFill, 
                  { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                ]} />
              )}
              {i < currentIndex && <View style={[styles.progressBarFill, { width: '100%' }]} />}
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerCount}>{currentIndex + 1} / {slides.length}</Text>
          <Text style={styles.headerTitle}>{technique.name}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Story Content Area */}
        {currentSlide.type !== 'quiz' ? (
          <TouchableWithoutFeedback 
            onPress={handlePress}
            onPressIn={handleHoldIn}
            onPressOut={handleHoldOut}
          >
            <View style={styles.contentArea}>
              <View style={styles.slideCard}>
                <Text style={styles.slideTitle}>{currentSlide.title}</Text>
                <Text style={styles.slideBody}>{currentSlide.content}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.quizArea}>
            <View style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Feather name="help-circle" size={16} color={Theme.colors.text.secondary} />
                <Text style={styles.quizHeaderTitle}>Quick Question</Text>
              </View>
              <Text style={styles.quizQuestion}>{quiz.question}</Text>
              <Text style={styles.quizSubtitle}>Select the correct reason</Text>

              <View style={styles.optionsContainer}>
                {quiz.options.map((opt: any, i: number) => {
                  const isSelected = quizAnswered;
                  const showCorrect = isSelected && opt.isCorrect;
                  const showWrong = isSelected && !opt.isCorrect;
                  
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.optionBtn,
                        showCorrect && styles.optionCorrect,
                        showWrong && styles.optionWrong
                      ]}
                      onPress={() => !quizAnswered && handleQuizSelect(opt.isCorrect)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.optionIconContainer, showCorrect && styles.optionIconCorrect, showWrong && styles.optionIconWrong]}>
                        <Text style={{fontSize: 16}}>{opt.emoji || technique.emoji}</Text>
                      </View>
                      <Text style={[styles.optionText, (showCorrect || showWrong) && styles.optionTextWhite]}>
                        {opt.text}
                      </Text>
                      <Feather 
                        name={showCorrect ? "check" : "chevron-right"} 
                        size={20} 
                        color={showCorrect ? "#FFFFFF" : Theme.colors.text.muted} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.tapHint}>
                <Feather name="mouse-pointer" size={14} color={Theme.colors.text.muted} style={{marginRight: 8}} />
                <Text style={styles.tapHintText}>Tap to choose</Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundEmojiContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.15,
  },
  backgroundEmoji: {
    fontSize: 200,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerCount: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    width: 40,
  },
  headerTitle: {
    ...Theme.typography.headingSm,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 60,
  },
  slideCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 24,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  slideTitle: {
    ...Theme.typography.headingLg,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  slideBody: {
    ...Theme.typography.bodyLg,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 26,
  },

  quizArea: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  quizCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)', // Glassmorphism dark slate
    padding: 24,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Theme.shadow.md,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quizHeaderTitle: {
    ...Theme.typography.caption,
    color: Theme.colors.text.secondary,
  },
  quizQuestion: {
    ...Theme.typography.headingLg,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quizSubtitle: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionCorrect: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.successDark,
  },
  optionWrong: {
    opacity: 0.5,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconCorrect: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  optionIconWrong: {
    backgroundColor: 'transparent',
  },
  optionText: {
    flex: 1,
    ...Theme.typography.bodyLg,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  optionTextWhite: {
    color: '#FFFFFF',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  tapHintText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
});
