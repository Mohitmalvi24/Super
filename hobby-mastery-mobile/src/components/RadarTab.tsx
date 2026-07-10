import React from 'react';
import { View, Text, StyleSheet, ScrollView, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';


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
  CATEGORY_ICONS: Record<string, string>;
}


const SKILL_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
] as const;


interface InsightCardProps {
  gradientColors: readonly [string, string];
  iconBgColor: string;
  iconName: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

const InsightCard = ({ gradientColors, iconBgColor, iconName, iconColor, title, children }: InsightCardProps) => (
  <LinearGradient colors={gradientColors} style={styles.insightCard}>
    <View style={styles.insightHeader}>
      <View style={[styles.insightIconBg, { backgroundColor: iconBgColor }]}>
        <Feather name={iconName as any} size={20} color={iconColor} />
      </View>
      <Text style={styles.insightTitle}>{title}</Text>
    </View>
    <Text style={styles.insightBody}>{children}</Text>
  </LinearGradient>
);


export const RadarTab = ({
  weakestSkill,
  strongestSkill,
  savedTips,
  skillRadar,
  CATEGORY_ICONS,
}: RadarTabProps) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>Deep Analytics</Text>
        <Text style={styles.headerSubtitle}>Skill matrix and progression predictions</Text>
      </View>

      {weakestSkill && (
        <InsightCard
          gradientColors={['#FEF2F2', '#FEE2E2']}
          iconBgColor="#FCA5A5"
          iconName="target"
          iconColor="#991B1B"
          title="Recommended Focus"
        >
          Your <Text style={styles.boldText}>{weakestSkill.name}</Text> skills
          are currently at {weakestSkill.percentage}%. Dedicate your next
          practice session here.
        </InsightCard>
      )}

      {strongestSkill && (
        <InsightCard
          gradientColors={['#F0FDF4', '#DCFCE7']}
          iconBgColor="#86EFAC"
          iconName="award"
          iconColor="#166534"
          title="Current Superpower"
        >
          You are dominating in{' '}
          <Text style={styles.boldText}>{strongestSkill.name}</Text> (
          {strongestSkill.percentage}% mastered). Keep up the momentum!
        </InsightCard>
      )}

      {savedTips.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.savedSectionTitle}>Saved Insights</Text>
          {savedTips.map((tip, idx) => (
            <View key={idx} style={styles.savedCard}>
              <View style={styles.savedIcon}>
                <Feather name="bookmark" size={16} color="#FBBF24" />
              </View>
              <Text style={styles.savedText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.matrixCard}>
        <Text style={styles.matrixTitle}>Skill Matrix</Text>
        <View style={styles.matrixSpacer} />
        {skillRadar.map((skill, i) => {
          const iconName = CATEGORY_ICONS[skill.name] || 'star';
          const barColor = SKILL_COLORS[i % SKILL_COLORS.length];
          const fillWidth = `${Math.max(skill.percentage, 4)}%` as DimensionValue;

          return (
            <View key={skill.name} style={styles.skillRow}>
              <View style={styles.skillIconBox}>
                <Feather name={iconName as any} size={14} color="#64748B" />
              </View>
              <View style={styles.skillDetails}>
                <View style={styles.skillLabelRow}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillPercent}>{skill.percentage}%</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View
                    style={[
                      styles.skillFill,
                      { width: fillWidth, backgroundColor: barColor },
                    ]}
                  />
                </View>
                <Text style={styles.skillMeta}>
                  {skill.done} of {skill.total} techniques
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
  },
  screenHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 24,
  },

  insightCard: {
    marginHorizontal: 24,
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  insightBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
  },


  savedSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  savedSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  savedCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },


  matrixCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  matrixTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  matrixSpacer: {
    height: 16,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skillIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  skillPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  skillTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillMeta: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 6,
  },
});
