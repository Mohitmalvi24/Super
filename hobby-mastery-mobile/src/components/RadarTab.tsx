import React from 'react';
import { View, Text, StyleSheet, ScrollView, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

interface SkillEntry {
  name: string;
  percentage: number;
  total: number;
  done: number;
}

interface RadarTabProps {
  weakestSkill: SkillEntry | null;
  strongestSkill: SkillEntry | null;
  savedTips: string[];
  skillRadar: SkillEntry[];
  categoryIcons: Record<string, string>;
  totalXp: number;
  challengesCompleted: number;
}

const SKILL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const RadarTab = ({
  weakestSkill,
  strongestSkill,
  savedTips,
  skillRadar,
  categoryIcons,
  totalXp,
  challengesCompleted,
}: RadarTabProps) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your learning progress at a glance</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[Theme.colors.palette.violet[50], Theme.colors.palette.violet[100]]}
            style={styles.statCardInner}
          >
            <Feather name="zap" size={20} color={Theme.colors.palette.violet[500]} />
            <Text style={styles.statValue}>{totalXp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </LinearGradient>
        </View>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[Theme.colors.palette.amber[50], Theme.colors.palette.amber[100]]}
            style={styles.statCardInner}
          >
            <Feather name="award" size={20} color={Theme.colors.palette.amber[500]} />
            <Text style={styles.statValue}>{challengesCompleted}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </LinearGradient>
        </View>
      </View>

      {weakestSkill && (
        <LinearGradient colors={[Theme.colors.dangerLight, Theme.colors.palette.red[100]]} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIconBg, { backgroundColor: Theme.colors.palette.red[400] }]}>
              <Feather name="target" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.insightTitle}>Recommended Focus</Text>
          </View>
          <Text style={styles.insightBody}>
            Your <Text style={styles.boldText}>{weakestSkill.name}</Text> skills
            are at {weakestSkill.percentage}%. Focus your next practice session here.
          </Text>
        </LinearGradient>
      )}

      {strongestSkill && (
        <LinearGradient colors={[Theme.colors.successLight, Theme.colors.palette.emerald[100]]} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIconBg, { backgroundColor: Theme.colors.palette.emerald[400] }]}>
              <Feather name="award" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.insightTitle}>Current Superpower</Text>
          </View>
          <Text style={styles.insightBody}>
            Dominating in <Text style={styles.boldText}>{strongestSkill.name}</Text> ({strongestSkill.percentage}% mastered). Keep it up!
          </Text>
        </LinearGradient>
      )}

      {savedTips.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>Saved Tips</Text>
          {savedTips.map((tip, idx) => (
            <View key={idx} style={styles.savedCard}>
              <View style={styles.savedIcon}>
                <Feather name="bookmark" size={14} color={Theme.colors.accent} />
              </View>
              <Text style={styles.savedText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.matrixCard}>
        <Text style={styles.sectionTitle}>Skill Matrix</Text>
        <View style={{ height: 16 }} />
        {skillRadar.map((skill, i) => {
          const iconName = categoryIcons[skill.name] || 'star';
          const barColor = SKILL_COLORS[i % SKILL_COLORS.length];
          const fillWidth = `${Math.max(skill.percentage, 4)}%` as DimensionValue;

          return (
            <View key={skill.name} style={styles.skillRow}>
              <View style={styles.skillIconBox}>
                <Feather name={iconName as any} size={14} color={Theme.colors.text.secondary} />
              </View>
              <View style={styles.skillDetails}>
                <View style={styles.skillLabelRow}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillPercent}>{skill.percentage}%</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View style={[styles.skillFill, { width: fillWidth, backgroundColor: barColor }]} />
                </View>
                <Text style={styles.skillMeta}>{skill.done} of {skill.total} techniques</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 20,
  },
  screenHeader: {
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

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  statCardInner: {
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  statLabel: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },

  insightCard: {
    marginHorizontal: 24,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
  },
  insightBody: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
  boldText: {
    fontWeight: '700',
  },

  savedSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 12,
  },
  savedCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  savedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedText: {
    flex: 1,
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },

  matrixCard: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skillIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillDetails: {
    flex: 1,
  },
  skillLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.primary,
  },
  skillPercent: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.primary,
    fontWeight: '800',
  },
  skillTrack: {
    height: 6,
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillMeta: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
    marginTop: 6,
  },
});
