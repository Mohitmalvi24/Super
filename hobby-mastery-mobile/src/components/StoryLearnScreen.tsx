import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Theme } from '../utils/theme';
import { Technique } from '../types';
import { YouTubeShortsService, YouTubeShort } from '../services/YouTubeShortsService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000;

interface StoryLearnScreenProps {
  technique: Technique;
  onClose: () => void;
  onComplete: () => void;
}

export const StoryLearnScreen = ({ technique, onClose, onComplete }: StoryLearnScreenProps) => {
  const slides = [
    { type: 'overview', title: 'Introduction', content: technique.lesson.overview },
    ...technique.lesson.steps.map(s => ({ type: 'step', title: s.title, content: s.body })),
    { type: 'quiz', title: 'Quick Question' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loadingShorts, setLoadingShorts] = useState(true);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const quiz = (technique.lesson as any).quickQuestion || {
    question: `What is the primary focus of ${technique.name}?`,
    options: [
      { id: 'a', text: technique.name, isCorrect: true, emoji: technique.emoji },
      { id: 'b', text: "Rhythm & Timing", isCorrect: false, emoji: '⏱️' },
      { id: 'c', text: "Advanced Theory", isCorrect: false, emoji: '📚' },
    ]
  };

  useEffect(() => {
    const fetchShorts = async () => {
      const results = await YouTubeShortsService.fetchShorts(technique.name);
      setShorts(results);
      setLoadingShorts(false);
    };
    fetchShorts();
  }, [technique.name]);

  useEffect(() => {
    progressAnim.setValue(0);
    
    if (slides[currentIndex].type === 'quiz') {
      return;
    }

    // If we have a video for this slide, don't use the timer.
    // The video ending will trigger the next slide.
    if (shorts[currentIndex]) {
      return;
    }

    if (!isPaused && !loadingShorts) {
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
  }, [currentIndex, isPaused, shorts, loadingShorts]);

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
    if (slides[currentIndex].type === 'quiz') return;

    const x = evt.nativeEvent.locationX;
    if (x < SCREEN_WIDTH / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  

  const handleQuizSelect = (isCorrect: boolean) => {
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    setQuizAnswered(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const currentSlide = slides[currentIndex];
  const currentShort = shorts[currentIndex];

  const onStateChange = (state: string) => {
    if (state === 'ended') {
      handleNext();
    }
  };

  return (
    <View style={styles.container}>
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
        <View style={styles.progressContainer}>
          {slides.map((_, i) => (
            <View key={i} style={styles.progressBarBg}>
              {i === currentIndex && !currentShort && !loadingShorts && (
                <Animated.View style={[
                  styles.progressBarFill, 
                  { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                ]} />
              )}
               {i === currentIndex && currentShort && (
                <View style={[styles.progressBarFill, { width: '50%', backgroundColor: Theme.colors.primary }]} />
              )}
              {i < currentIndex && <View style={[styles.progressBarFill, { width: '100%' }]} />}
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.headerCount}>{currentIndex + 1} / {slides.length}</Text>
          <Text style={styles.headerTitle}>{technique.name}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {currentSlide.type !== 'quiz' ? (
          <TouchableWithoutFeedback 
            onPress={handlePress}
          >
            <View style={styles.contentArea}>
              {loadingShorts && !currentShort && (
                <View style={styles.loadingContainer}>
                   <ActivityIndicator size="small" color={Theme.colors.primary} />
                   <Text style={styles.loadingText}>Loading video...</Text>
                </View>
              )}

              {currentShort && (
                 <TouchableWithoutFeedback onPress={() => setIsPaused(!isPaused)}>
                     <View style={[styles.videoContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                        <View style={{ width: ((SCREEN_WIDTH * 0.7) * (16/9)) * (16/9), height: (SCREEN_WIDTH * 0.7) * (16/9), alignItems: 'center' }}>
                          <YoutubePlayer
                            height={(SCREEN_WIDTH * 0.7) * (16/9)}
                            width={((SCREEN_WIDTH * 0.7) * (16/9)) * (16/9)}
                            play={isVideoReady && !isPaused}
                            videoId={currentShort.videoId}
                            onChangeState={onStateChange}
                            onReady={() => setIsVideoReady(true)}
                            initialPlayerParams={{
                              controls: false,
                              modestbranding: true,
                              rel: false,
                            }}
                          />
                        </View>
                        {!isVideoReady && (
                          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }]}>
                            <ActivityIndicator size="large" color={Theme.colors.primary} />
                            <Text style={{color: 'rgba(255,255,255,0.7)', marginTop: 10, fontSize: 12}}>Loading video...</Text>
                          </View>
                        )}
                        {isVideoReady && isPaused && (
                          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }]}>
                            <Feather name="play-circle" size={64} color="rgba(255,255,255,0.9)" />
                          </View>
                        )}
                     </View>
                  </TouchableWithoutFeedback>
              )}

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
              <Text style={styles.quizSubtitle}>Choose the best answer</Text>

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
    justifyContent: 'flex-end',
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
    paddingBottom: 30,
  },
  
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#000',
    width: SCREEN_WIDTH * 0.7,
    height: (SCREEN_WIDTH * 0.7) * (16/9),
    marginBottom: 24,
  },
  loadingContainer: {
    height: (SCREEN_WIDTH * 0.7) * (16/9),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
    fontSize: 14,
  },
  
  slideCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: 16,
  },
  slideTitle: {
    ...Theme.typography.headingLg,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  slideBody: {
    ...Theme.typography.bodyLg,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },

  quizArea: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  quizCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
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
