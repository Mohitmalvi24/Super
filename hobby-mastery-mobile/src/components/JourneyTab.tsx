import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { Technique, LearningPlan } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JourneyTabProps {
  plan: LearningPlan;
  totalXp: number;
  onOpenLesson: (id: string) => void;
  onStatusChange: (id: string, status: any) => void;
}

export const JourneyTab = ({ plan, totalXp, onOpenLesson }: JourneyTabProps) => {
  const { techniques, hobby } = plan;
  
  const activeTechniques = techniques.filter(t => t.status !== 'skipped');
  const masteredCount = activeTechniques.filter(t => t.status === 'mastered').length;
  const progressPercent = activeTechniques.length > 0 ? Math.round((masteredCount / activeTechniques.length) * 100) : 0;
  
  const currentTech = activeTechniques.find(t => t.status !== 'mastered');
  
  // Fake stats for UI
  const discoveries = masteredCount;
  const learningTime = masteredCount * 15; // assuming 15 min per lesson
  const hours = Math.floor(learningTime / 60);
  const minutes = learningTime % 60;
  const level = Math.floor(totalXp / 500) + 1;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{hobby} Journey</Text>
          <Text style={styles.subtitle}>Level {level} • {progressPercent}% Complete</Text>
        </View>
      </View>

      {/* Current Goal Hero Card */}
      {currentTech && (
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Current Goal</Text>
            <Text style={styles.heroTitle}>{currentTech.name}</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => onOpenLesson(currentTech.id)} activeOpacity={0.8}>
              <Text style={styles.continueBtnText}>Continue Journey</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.progressRing}>
              {/* Simulated Progress Ring */}
              <View style={[styles.ringOuter, { borderColor: Theme.colors.primary }]} />
              <View style={styles.ringInner}>
                <Text style={styles.ringPercent}>{progressPercent}%</Text>
                <Text style={styles.ringComplete}>Complete</Text>
                <Text style={styles.ringXp}>{totalXp.toLocaleString()} XP 💎</Text>
              </View>
            </View>
            <View style={styles.heroVisual}>
              <Text style={styles.heroEmoji}>{currentTech.emoji}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Timeline List */}
      <View style={styles.timeline}>
        {activeTechniques.map((tech, i) => {
          const isMastered = tech.status === 'mastered';
          const isNext = !isMastered && (i === 0 || activeTechniques[i - 1]?.status === 'mastered');
          const isLocked = !isMastered && !isNext;

          return (
            <View key={tech.id} style={styles.nodeContainer}>
              {/* Line Connector */}
              {i < activeTechniques.length - 1 && (
                <View style={[
                  styles.line,
                  isMastered ? styles.lineDone : styles.lineLocked
                ]} />
              )}
              
              {/* Circle Icon */}
              <View style={styles.circleColumn}>
                <View style={[
                  styles.circle,
                  isMastered && styles.circleDone,
                  isNext && styles.circleCurrent,
                  isLocked && styles.circleLocked
                ]}>
                  {isMastered && <Feather name="check" size={14} color="#FFFFFF" />}
                  {isNext && <View style={styles.currentDot} />}
                  {isLocked && <Feather name="lock" size={12} color={Theme.colors.text.muted} />}
                </View>
              </View>

              {/* Lesson Card */}
              <TouchableOpacity 
                style={[
                  styles.card,
                  isNext && styles.cardCurrent,
                  isLocked && styles.cardLocked
                ]}
                activeOpacity={isLocked ? 1 : 0.7}
                onPress={() => !isLocked && onOpenLesson(tech.id)}
              >
                <View style={styles.cardVisual}>
                  <Text style={styles.cardEmoji}>{tech.emoji || '📖'}</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, isLocked && styles.cardTitleLocked]}>{tech.name}</Text>
                  
                  {isMastered && <Text style={styles.cardStatusSuccess}>Completed</Text>}
                  {isNext && <Text style={styles.cardStatusCurrent}>Current Lesson • {tech.estimatedMinutes} min remaining</Text>}
                  {isLocked && <Text style={styles.cardStatusLocked}>Locked</Text>}
                </View>
                
                <View style={styles.cardAction}>
                  {isMastered && (
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={12} color={Theme.colors.success} />
                    </View>
                  )}
                  {isNext && (
                    <View style={styles.resumeBtn}>
                      <Text style={styles.resumeBtnText}>Resume</Text>
                    </View>
                  )}
                  {isLocked && (
                    <Feather name="lock" size={16} color={Theme.colors.text.muted} />
                  )}
                  {/* Right chevron for navigation hint if not locked */}
                  {!isLocked && <Feather name="chevron-right" size={16} color={Theme.colors.text.muted} style={{marginLeft: 8}} />}
                  {isLocked && <Feather name="chevron-down" size={16} color={Theme.colors.border} style={{marginLeft: 8}} />}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Final Trophy Node */}
        <View style={styles.nodeContainer}>
           <View style={styles.circleColumn}>
             <View style={[styles.circle, styles.circleTrophy]}>
               <Text style={{fontSize: 16}}>🏆</Text>
             </View>
           </View>
           <View style={[styles.card, styles.cardLocked, { borderStyle: 'solid' }]}>
             <View style={styles.cardVisual}>
               <Text style={styles.cardEmoji}>👑</Text>
             </View>
             <View style={styles.cardContent}>
               <Text style={styles.cardTitleLocked}>{hobby} Master</Text>
               <Text style={styles.cardStatusLocked}>Final Goal</Text>
             </View>
             <View style={styles.cardAction}>
               <Feather name="lock" size={16} color={Theme.colors.warning} />
             </View>
           </View>
        </View>
      </View>

      {/* Achievements (Mock UI for design) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
        <View style={styles.achievementBadge}>
          <Text style={styles.achEmoji}>🏅</Text>
          <Text style={styles.achText}>First Step</Text>
        </View>
        <View style={styles.achievementBadge}>
          <Text style={styles.achEmoji}>🔥</Text>
          <Text style={styles.achText}>Streak Beginner</Text>
        </View>
        <View style={styles.achievementBadge}>
          <Text style={styles.achEmoji}>🎯</Text>
          <Text style={styles.achText}>Focus Master</Text>
        </View>
      </ScrollView>

      {/* Statistics */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Learning Statistics</Text>
      </View>
      <View style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statIcon}>📖</Text>
          <Text style={styles.statNum}>{discoveries}</Text>
          <Text style={styles.statDesc}>Discoveries{'\n'}Completed</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statIcon}>⚡</Text>
          <Text style={styles.statNum}>{masteredCount * 3}</Text>
          <Text style={styles.statDesc}>Practice{'\n'}Sessions</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statIcon}>🕒</Text>
          <Text style={styles.statNum}>{hours}h {minutes}m</Text>
          <Text style={styles.statDesc}>Learning{'\n'}Time</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statNum}>{plan.streakCount}</Text>
          <Text style={styles.statDesc}>Day{'\n'}Streak</Text>
        </View>
      </View>

      {/* Coach Banner */}
      <View style={styles.coachBanner}>
        <View style={styles.coachAvatar}>
          <Text style={{fontSize: 24}}>🤖</Text>
        </View>
        <View style={styles.coachContent}>
          <View style={styles.coachHeaderRow}>
            <Text style={styles.coachTitle}>✨ Coach</Text>
          </View>
          <Text style={styles.coachText}>
            {currentTech 
              ? `Keep going! Focus on ${currentTech.name} to improve your skills.` 
              : "You have mastered everything! Review your practice drills."}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 120,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center', // Centered as per screenshot
  },
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
  },

  heroCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  heroLeft: {
    flex: 1.2,
    justifyContent: 'center',
    paddingRight: 8,
  },
  heroLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  heroTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.lg,
    alignSelf: 'flex-start',
    gap: 6,
  },
  continueBtnText: {
    ...Theme.typography.bodySm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  progressRing: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringOuter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    borderLeftColor: Theme.colors.borderLight, // Fake ring progress
    transform: [{ rotate: '45deg' }]
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  ringComplete: {
    fontSize: 8,
    color: Theme.colors.text.muted,
  },
  ringXp: {
    fontSize: 9,
    color: Theme.colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  heroVisual: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Theme.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 32,
  },

  timeline: {
    marginTop: 8,
    marginBottom: 32,
  },
  nodeContainer: {
    flexDirection: 'row',
    marginBottom: 12, // Tighter spacing like in screenshot
    position: 'relative',
  },
  circleColumn: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  line: {
    position: 'absolute',
    left: 15,
    top: 24,
    bottom: -16, // Connect to next node
    width: 2,
    zIndex: 1,
  },
  lineDone: {
    backgroundColor: Theme.colors.success,
  },
  lineLocked: {
    backgroundColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 16,
  },
  circleDone: {
    backgroundColor: Theme.colors.success,
  },
  circleCurrent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  circleLocked: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  circleTrophy: {
    backgroundColor: Theme.colors.warningLight,
    borderWidth: 1,
    borderColor: Theme.colors.warning,
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: -4, // Adjust for larger size
  },

  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 8,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: 'transparent', // Default no border if completed
  },
  cardCurrent: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryBg,
  },
  cardLocked: {
    backgroundColor: 'transparent', // Blend with background
  },
  cardVisual: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  cardTitleLocked: {
    color: Theme.colors.text.primary,
  },
  cardStatusSuccess: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
  },
  cardStatusCurrent: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
  },
  cardStatusLocked: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resumeBtnText: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
  },
  
  achievementsRow: {
    gap: 12,
    paddingBottom: 24,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    gap: 8,
    ...Theme.shadow.sm,
  },
  achEmoji: {
    fontSize: 20,
  },
  achText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCol: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  statNum: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  statDesc: {
    fontSize: 10,
    color: Theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 12,
  },

  coachBanner: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primaryBg,
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.palette.violet[200],
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachContent: {
    flex: 1,
    justifyContent: 'center',
  },
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coachTitle: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  coachText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.primary,
    lineHeight: 18,
  },
});
