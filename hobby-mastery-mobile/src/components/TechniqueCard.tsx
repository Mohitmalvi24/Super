import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { Technique, TechniqueStatus } from '../types';
import { Feather } from '@expo/vector-icons';
import { FocusTimer } from './FocusTimer';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '../utils/theme';

interface TechniqueCardProps {
  technique: Technique;
  onStatusChange: (id: string, status: TechniqueStatus) => void;
  isHero?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const TechniqueCard = ({ technique, onStatusChange, isHero }: TechniqueCardProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rewardScaleAnim = useRef(new Animated.Value(1)).current;

  const totalSteps = technique.lesson?.steps.length || 1;
  const completedCount = completedSteps.size;
  const progressPercent = (completedCount / totalSteps) * 100;
  const isMastered = technique.status === 'mastered';
  const isSkipped = technique.status === 'skipped';

  useEffect(() => {
    if (modalVisible && completedSteps.size === 0 && !isMastered) {
      setTimeout(() => {
        setCompletedSteps(new Set([0]));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 600);
    }
  }, [modalVisible]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercent,
      useNativeDriver: false,
      friction: 8,
    }).start();

    if (completedCount === totalSteps && !isMastered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rewardScaleAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
          Animated.timing(rewardScaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      rewardScaleAnim.setValue(1);
    }
  }, [progressPercent]);

  const toggleStatus = useCallback((status: TechniqueStatus) => {
    if (status === 'mastered') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setModalVisible(false), 800);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onStatusChange(technique.id, status);
  }, [technique.id, onStatusChange]);

  const toggleStep = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }, []);

  const renderModal = () => {
    if (!technique.lesson) return null;

    return (
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="chevron-down" size={24} color={Theme.colors.text.secondary} />
                </TouchableOpacity>
                <View style={styles.progressPill}>
                  <Feather name="zap" size={14} color={Theme.colors.accentDark} />
                  <Text style={styles.progressPillText}>{completedCount} / {totalSteps} STEPS</Text>
                </View>
              </View>
              <Text style={styles.sheetTitle}>{technique.name}</Text>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.viewerContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.viewerOverview}>{technique.lesson.overview}</Text>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>LEARNING STEPS</Text>
                {technique.lesson.steps.map((step, index) => {
                  const isDone = completedSteps.has(index);
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      onPress={() => toggleStep(index)}
                      style={[styles.stepContainer, isDone && styles.stepContainerDone]}
                    >
                      <View style={[styles.stepNumberBadge, isDone && styles.stepNumberBadgeDone]}>
                        {isDone ? (
                          <Feather name="check" size={16} color="#FFFFFF" />
                        ) : (
                          <Text style={styles.stepNumber}>{step.order}</Text>
                        )}
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>{step.title}</Text>
                        <Text style={[styles.stepBody, isDone && styles.stepBodyDone]}>{step.body}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>PRACTICE DRILL</Text>
                <LinearGradient colors={[Theme.colors.infoLight, Theme.colors.palette.sky[100]]} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Feather name="target" size={18} color={Theme.colors.infoDark} style={{ marginRight: 8 }} />
                    <Text style={styles.exerciseTitle}>{technique.lesson.exercise.title}</Text>
                  </View>
                  <Text style={styles.exerciseInstruction}>{technique.lesson.exercise.instruction}</Text>
                  <View style={styles.exerciseMetaBox}>
                    <Text style={styles.exerciseGoalLabel}>GOAL:</Text>
                    <Text style={styles.exerciseGoal}>{technique.lesson.exercise.goal}</Text>
                  </View>
                </LinearGradient>

                <FocusTimer
                  initialMinutes={technique.lesson.exercise.durationMinutes || 10}
                  onComplete={() => toggleStatus('mastered')}
                />
              </View>

              {technique.lesson.proTips?.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeader}>PRO TIPS</Text>
                  <View style={styles.tipsBox}>
                    {technique.lesson.proTips.map((tip, idx) => (
                      <View key={idx} style={styles.tipRow}>
                        <View style={styles.tipIconBg}>
                          <Feather name="star" size={14} color={Theme.colors.accentDark} />
                        </View>
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={{ height: 120 }} />
            </ScrollView>

            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', '#FFFFFF']}
              style={styles.footerActions}
            >
              <TouchableOpacity style={styles.actionBtnOutline} onPress={() => toggleStatus('skipped')}>
                <Text style={styles.actionBtnTextOutline}>Skip</Text>
              </TouchableOpacity>

              <Animated.View style={[{ flex: 1 }, { transform: [{ scale: rewardScaleAnim }] }]}>
                <TouchableOpacity
                  style={[
                    styles.masterBtn,
                    isMastered && styles.masterBtnActive,
                    completedCount === totalSteps && !isMastered && styles.masterBtnReady,
                  ]}
                  onPress={() => toggleStatus(isMastered ? 'not-started' : 'mastered')}
                >
                  <LinearGradient
                    colors={
                      isMastered
                        ? [Theme.colors.success, Theme.colors.successDark]
                        : completedCount === totalSteps
                          ? [Theme.colors.palette.sky[500], Theme.colors.palette.sky[600]]
                          : [Theme.colors.palette.slate[200], Theme.colors.palette.slate[300]]
                    }
                    style={styles.masterBtnGradient}
                  >
                    <Text
                      style={[
                        styles.masterBtnText,
                        !(isMastered || completedCount === totalSteps) && { color: Theme.colors.text.secondary },
                      ]}
                    >
                      {isMastered
                        ? 'Mastery Claimed ✓'
                        : completedCount === totalSteps
                          ? 'Claim Mastery ✦'
                          : 'Complete Steps to Master'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  };

  if (isHero) {
    return (
      <View>
        <TouchableOpacity style={styles.heroStartBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.heroStartBtnText}>Start</Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </TouchableOpacity>
        {renderModal()}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[styles.card, isMastered && styles.cardMastered, isSkipped && styles.cardSkipped]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrapper, isMastered && styles.iconWrapperMastered]}>
            {isMastered ? (
              <Feather name="check" size={18} color="#FFFFFF" />
            ) : (
              <Feather name="book-open" size={16} color={Theme.colors.text.secondary} />
            )}
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.title, isSkipped && styles.textStrikethrough]} numberOfLines={1}>
              {technique.name}
            </Text>
            {isMastered ? (
              <Text style={styles.statusBadge}>Mastered</Text>
            ) : (
              <Text style={styles.timeBadge}>{technique.estimatedMinutes} mins</Text>
            )}
          </View>
          <Feather name="chevron-right" size={20} color={Theme.colors.palette.slate[300]} />
        </View>
      </TouchableOpacity>
      {renderModal()}
    </>
  );
};

const styles = StyleSheet.create({
  heroStartBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStartBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  cardMastered: {
    backgroundColor: Theme.colors.successLight,
    borderColor: Theme.colors.successBorder,
  },
  cardSkipped: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapperMastered: {
    backgroundColor: Theme.colors.success,
  },
  cardTitleContainer: {
    flex: 1,
  },
  title: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: Theme.colors.text.muted,
  },
  timeBadge: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
  },
  statusBadge: {
    ...Theme.typography.bodySm,
    color: Theme.colors.success,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  fullSheet: {
    height: SCREEN_HEIGHT * 0.92,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.palette.amber[100],
  },
  progressPillText: {
    ...Theme.typography.label,
    color: Theme.colors.accentDark,
    letterSpacing: 1,
  },
  sheetTitle: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.info,
    borderRadius: 3,
  },

  viewerContainer: {
    padding: 24,
  },
  viewerOverview: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.text.secondary,
    marginBottom: 32,
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionHeader: {
    ...Theme.typography.label,
    color: Theme.colors.text.muted,
    letterSpacing: 2,
    marginBottom: 16,
  },

  stepContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.sm,
  },
  stepContainerDone: {
    backgroundColor: Theme.colors.successLight,
    borderColor: Theme.colors.successBorder,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberBadgeDone: {
    backgroundColor: Theme.colors.success,
  },
  stepNumber: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.secondary,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 6,
  },
  stepTitleDone: {
    color: Theme.colors.successDark,
  },
  stepBody: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
  stepBodyDone: {
    color: Theme.colors.palette.emerald[800],
  },

  exerciseCard: {
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.infoBorder,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.infoDark,
  },
  exerciseInstruction: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.palette.sky[700],
    marginBottom: 16,
  },
  exerciseMetaBox: {
    backgroundColor: Theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exerciseGoalLabel: {
    ...Theme.typography.label,
    color: Theme.colors.infoDark,
    marginRight: 8,
    marginTop: 2,
  },
  exerciseGoal: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.palette.sky[700],
    fontWeight: '600',
  },

  tipsBox: {
    backgroundColor: Theme.colors.warningLight,
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.palette.amber[100],
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.palette.amber[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.palette.amber[800],
    marginTop: 4,
  },

  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 12,
  },
  actionBtnOutline: {
    width: 64,
    height: 56,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextOutline: {
    color: Theme.colors.text.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  masterBtn: {
    flex: 1,
    height: 56,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  masterBtnActive: {},
  masterBtnReady: {
    shadowColor: Theme.colors.palette.sky[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  masterBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
