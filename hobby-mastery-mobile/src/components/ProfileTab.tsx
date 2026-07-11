import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../utils/theme';
import { LearningPlan } from '../types';

interface ProfileTabProps {
  plan: LearningPlan;
  totalXp: number;
  challengesCompleted: number;
  onReset: () => void;
}

export const ProfileTab = ({ plan, totalXp, challengesCompleted, onReset }: ProfileTabProps) => {
  const currentLevel = Math.floor(totalXp / 500) + 1;
  const xpInCurrentLevel = totalXp % 500;
  const progressToNextLevel = (xpInCurrentLevel / 500) * 100;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <LinearGradient
        colors={[Theme.colors.palette.violet[600], Theme.colors.palette.violet[800]]}
        style={styles.profileCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileHeaderRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Hobbyist</Text>
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>{plan.targetLevel} {plan.hobby} Learner</Text>
            </View>
          </View>
        </View>

        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelText}>Level {currentLevel}</Text>
            <Text style={styles.xpText}>{xpInCurrentLevel} / 500 XP</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressToNextLevel}%` }]} />
          </View>
          <Text style={styles.levelHint}>{500 - xpInCurrentLevel} XP to Level {currentLevel + 1}</Text>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: Theme.colors.primaryBg }]}>
            <Feather name="award" size={20} color={Theme.colors.primary} />
          </View>
          <Text style={styles.statValue}>{totalXp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: Theme.colors.warningLight }]}>
            <Feather name="zap" size={20} color={Theme.colors.warning} />
          </View>
          <Text style={styles.statValue}>{plan.streakCount}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: Theme.colors.successLight }]}>
            <Feather name="target" size={20} color={Theme.colors.success} />
          </View>
          <Text style={styles.statValue}>{challengesCompleted}</Text>
          <Text style={styles.statLabel}>Challenges</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Danger Zone</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.dangerButton} onPress={onReset} activeOpacity={0.8}>
          <View style={styles.dangerIconBox}>
            <Feather name="trash-2" size={18} color={Theme.colors.danger} />
          </View>
          <View style={styles.dangerTextCol}>
            <Text style={styles.dangerButtonTitle}>Reset Learning Plan</Text>
            <Text style={styles.dangerButtonSub}>This will permanently delete your progress.</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
  },

  profileCard: {
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    marginBottom: 32,
    ...Theme.shadow.md,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...Theme.typography.headingLg,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  titleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  titleBadgeText: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  levelSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  levelText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },
  xpText: {
    ...Theme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  levelHint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },

  sectionTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },

  menuContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    overflow: 'hidden',
    marginBottom: 32,
    ...Theme.shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.primary,
    fontWeight: '500',
  },

  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dangerTextCol: {
    flex: 1,
  },
  dangerButtonTitle: {
    ...Theme.typography.headingSm,
    color: Theme.colors.danger,
    marginBottom: 2,
  },
  dangerButtonSub: {
    fontSize: 11,
    color: Theme.colors.text.muted,
  },
});
