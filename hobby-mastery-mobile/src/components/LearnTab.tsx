import React, { useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { LearningContext } from '../store/LearningContext';
import { Theme } from '../utils/theme';

interface LearnTabProps {
  proTips: string[];
  savedTips: string[];
  setSavedTips: React.Dispatch<React.SetStateAction<string[]>>;
}

export const LearnTab = ({ proTips, savedTips, setSavedTips }: LearnTabProps) => {
  const ctx = useContext(LearningContext);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const techniques = ctx?.plan?.techniques || [];
  const masteredCount = techniques.filter(t => t.status === 'mastered').length;
  const totalCount = techniques.length;

  const toggleSave = useCallback((tip: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSavedTips(prev => prev.includes(tip) ? prev.filter(t => t !== tip) : [...prev, tip]);
  }, [setSavedTips]);

  const handleShare = useCallback(async (tip: string) => {
    try {
      await Share.share({ message: `Pro tip from Hobby Mastery:\n\n"${tip}"` });
    } catch { /* user cancelled */ }
  }, []);

  if (techniques.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.emptyIcon}>
          <Feather name="book-open" size={32} color={Theme.colors.text.muted} />
        </View>
        <Text style={styles.emptyTitle}>No Lessons Yet</Text>
        <Text style={styles.emptyText}>Complete your first technique to unlock the learning library.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Library</Text>
        <Text style={styles.headerSubtitle}>
          {masteredCount} of {totalCount} lessons completed
        </Text>
      </View>

      <LinearGradient
        colors={[Theme.colors.palette.slate[900], Theme.colors.palette.slate[800]]}
        style={styles.progressCard}
      >
        <View style={styles.progressRow}>
          <View style={styles.progressTextBlock}>
            <Text style={styles.progressPercent}>
              {totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0}%
            </Text>
            <Text style={styles.progressLabel}>Knowledge Unlocked</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%` },
                ]}
              />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.progressMetaText}>{masteredCount} mastered</Text>
              <Text style={styles.progressMetaText}>{totalCount - masteredCount} remaining</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>All Lessons</Text>

      {techniques.map(technique => {
        const isExpanded = expandedLesson === technique.id;
        const isMastered = technique.status === 'mastered';
        const lesson = technique.lesson;

        return (
          <View key={technique.id} style={styles.lessonCard}>
            <TouchableOpacity
              style={styles.lessonHeader}
              onPress={() => setExpandedLesson(isExpanded ? null : technique.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.lessonIcon, isMastered && styles.lessonIconMastered]}>
                {isMastered ? (
                  <Feather name="check" size={16} color="#FFFFFF" />
                ) : (
                  <Text style={styles.lessonNumber}>
                    {techniques.indexOf(technique) + 1}
                  </Text>
                )}
              </View>
              <View style={styles.lessonTitleBlock}>
                <Text style={styles.lessonTitle}>{technique.name}</Text>
                <Text style={styles.lessonMeta}>
                  {technique.category} · {technique.estimatedMinutes} min
                </Text>
              </View>
              <Feather
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Theme.colors.text.muted}
              />
            </TouchableOpacity>

            {isExpanded && lesson && (
              <View style={styles.lessonBody}>
                <Text style={styles.overviewText}>{lesson.overview}</Text>

                <Text style={styles.subSectionTitle}>Steps</Text>
                {lesson.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{step.order}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepBody}>{step.body}</Text>
                    </View>
                  </View>
                ))}

                {lesson.exercise && (
                  <>
                    <Text style={styles.subSectionTitle}>Practice Drill</Text>
                    <LinearGradient
                      colors={[Theme.colors.infoLight, Theme.colors.palette.sky[100]]}
                      style={styles.exerciseBox}
                    >
                      <View style={styles.exerciseHeader}>
                        <Feather name="target" size={16} color={Theme.colors.infoDark} />
                        <Text style={styles.exerciseTitle}>{lesson.exercise.title}</Text>
                      </View>
                      <Text style={styles.exerciseInstruction}>{lesson.exercise.instruction}</Text>
                      <View style={styles.goalRow}>
                        <Text style={styles.goalLabel}>GOAL</Text>
                        <Text style={styles.goalText}>{lesson.exercise.goal}</Text>
                      </View>
                    </LinearGradient>
                  </>
                )}

                {lesson.proTips.length > 0 && (
                  <>
                    <Text style={styles.subSectionTitle}>Pro Tips</Text>
                    <View style={styles.tipsContainer}>
                      {lesson.proTips.map((tip, idx) => {
                        const isSaved = savedTips.includes(tip);
                        return (
                          <View key={idx} style={styles.tipCard}>
                            <View style={styles.tipIconCircle}>
                              <Feather name="star" size={12} color={Theme.colors.accentDark} />
                            </View>
                            <Text style={styles.tipText}>{tip}</Text>
                            <View style={styles.tipActions}>
                              <TouchableOpacity
                                onPress={() => toggleSave(tip)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Feather
                                  name="bookmark"
                                  size={16}
                                  color={isSaved ? Theme.colors.accent : Theme.colors.text.muted}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleShare(tip)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Feather name="share-2" size={16} color={Theme.colors.text.muted} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.muted,
    textAlign: 'center',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },

  progressCard: {
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressTextBlock: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.palette.slate[400],
    marginTop: 2,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.success,
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMetaText: {
    ...Theme.typography.caption,
    color: Theme.colors.palette.slate[400],
  },

  sectionTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    paddingHorizontal: 24,
    marginBottom: 12,
  },

  lessonCard: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    overflow: 'hidden',
    ...Theme.shadow.sm,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  lessonIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lessonIconMastered: {
    backgroundColor: Theme.colors.success,
  },
  lessonNumber: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.secondary,
  },
  lessonTitleBlock: {
    flex: 1,
  },
  lessonTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  lessonMeta: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },

  lessonBody: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
    paddingTop: 16,
  },
  overviewText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.text.secondary,
    marginBottom: 20,
  },

  subSectionTitle: {
    ...Theme.typography.label,
    color: Theme.colors.text.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },

  stepItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepBadgeText: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.secondary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  stepBody: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },

  exerciseBox: {
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.infoBorder,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  exerciseTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.infoDark,
  },
  exerciseInstruction: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.palette.sky[700],
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
  },
  goalLabel: {
    ...Theme.typography.label,
    color: Theme.colors.infoDark,
    marginRight: 8,
    marginTop: 2,
  },
  goalText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.palette.sky[700],
    fontWeight: '600',
  },

  tipsContainer: {
    gap: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.warningLight,
    borderRadius: Theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.palette.amber[100],
  },
  tipIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.palette.amber[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.palette.amber[800],
  },
  tipActions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 8,
    marginTop: 2,
  },
});
