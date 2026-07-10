import React, { useContext, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, ImageBackground, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LearningContext } from '../store/LearningContext';
import { TechniqueCard } from '../components/TechniqueCard';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const getFormattedDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', month: 'long', day: 'numeric'
  };
  return now.toLocaleDateString('en-US', options).toUpperCase();
};

export const DashboardScreen = () => {
  const { plan, updateTechniqueStatus, clearPlan, isRegenerating } = useContext(LearningContext) || {};
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { total, mastered, progress, nextTechnique, remainingTechniques, skillRadar } = useMemo(() => {
    if (!plan?.techniques) return {
      total: 0, mastered: 0, progress: 0,
      nextTechnique: null, remainingTechniques: [], skillRadar: []
    };

    const validTechniques = plan.techniques.filter(tech => tech.status !== 'skipped');
    const t = validTechniques.length;
    const m = validTechniques.filter(tech => tech.status === 'mastered').length;
    const next = validTechniques.find(tech => tech.status !== 'mastered') || null;
    const remaining = validTechniques.filter(tech => tech.id !== next?.id);

    const categoryMap = new Map<string, { total: number; mastered: number }>();
    validTechniques.forEach(tech => {
      const cat = tech.category || 'General';
      const existing = categoryMap.get(cat) || { total: 0, mastered: 0 };
      existing.total++;
      if (tech.status === 'mastered') existing.mastered++;
      categoryMap.set(cat, existing);
    });

    const radar = Array.from(categoryMap.entries()).map(([name, stats]) => ({
      name,
      percentage: stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0,
    }));

    return {
      total: t, mastered: m,
      progress: t > 0 ? (m / t) * 100 : 0,
      nextTechnique: next,
      remainingTechniques: remaining,
      skillRadar: radar,
    };
  }, [plan?.techniques]);

  if (!plan) return null;

  if (isRegenerating) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Feather name="cpu" size={48} color="#43503F" style={{ marginBottom: 24 }} />
        <Text style={styles.regeneratingTitle}>Adapting Plan...</Text>
        <Text style={styles.regeneratingText}>
          Analyzing your feedback to suggest better techniques.
        </Text>
      </SafeAreaView>
    );
  }

  const handleReset = () => {
    Alert.alert(
      "Reset Learning Plan?",
      "Are you sure you want to start over? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => clearPlan?.() }
      ]
    );
  };

  const streakCount = plan.streakCount || 12;
  const todayIndex = new Date().getDay();
  const todayMondayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  const levelLabel = plan.targetLevel
    ? plan.targetLevel.charAt(0).toUpperCase() + plan.targetLevel.slice(1)
    : 'Beginner';

  // Make the hero image dynamic instead of hardcoded
  const dynamicHeroImage = { uri: `https://loremflickr.com/800/600/${encodeURIComponent(plan.hobby)}` };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <View>
            <Text style={styles.dateLabel}>{getFormattedDate()}</Text>
            <Text style={styles.greeting}>Welcome back</Text>
          </View>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <View style={styles.avatarCircle}>
              <Feather name="rotate-cw" size={18} color="#44483D" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Current Focus</Text>
        </View>

        <View style={styles.heroCardWrapper}>
          <ImageBackground
            source={dynamicHeroImage}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroTrackBadge}>
                <Text style={styles.heroTrackText}>
                  {levelLabel.toUpperCase()} TRACK
                </Text>
              </View>
              <Text style={styles.heroHobbyTitle}>{plan.hobby} Mastery</Text>
            </View>
          </ImageBackground>

          {nextTechnique && (
            <View style={styles.heroFooter}>
              <View style={styles.heroDots}>
                {plan.techniques.slice(0, 5).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === 0 && styles.dotActive]}
                  />
                ))}
              </View>

              <View style={styles.heroNextRow}>
                <Text style={styles.heroNextLabel}>
                  Next: {nextTechnique.name}
                </Text>
              </View>

              <TechniqueCard
                technique={nextTechnique}
                onStatusChange={updateTechniqueStatus!}
                isHero
              />
            </View>
          )}
        </View>

        <View style={styles.momentumCard}>
          <View style={styles.momentumHeader}>
            <View>
              <Text style={styles.momentumTitle}>Mastery Momentum</Text>
              <Text style={styles.momentumSubtitle}>
                {streakCount} Day Streak · Keep it up!
              </Text>
            </View>
            <Feather name="award" size={24} color="#F57F17" />
          </View>

          <View style={styles.weekRow}>
            {DAYS_OF_WEEK.map((day, index) => {
              const isCompleted = index <= todayMondayIndex;
              const isToday = index === todayMondayIndex;
              return (
                <View key={index} style={styles.dayColumn}>
                  <Text style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelActive
                  ]}>
                    {day}
                  </Text>
                  <View style={[
                    styles.dayDot,
                    isCompleted && styles.dayDotCompleted,
                    isToday && styles.dayDotToday,
                  ]}>
                    {isCompleted && (
                      <Feather name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.radarSection}>
          <View style={styles.radarHeader}>
            <Text style={styles.radarTitle}>Radar Preview</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.radarLink}>Detailed Radar →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.radarCategoryLabel}>SKILLS IN FOCUS</Text>

          {skillRadar.length > 0 ? (
            skillRadar.map((skill, index) => (
              <View key={index} style={styles.skillRow}>
                <View style={styles.skillNameRow}>
                  <Text style={[
                    styles.skillName,
                    { color: SKILL_COLORS[index % SKILL_COLORS.length] }
                  ]}>
                    {skill.name}
                  </Text>
                  <Text style={styles.skillPercent}>{skill.percentage}%</Text>
                </View>
                <View style={styles.skillBarTrack}>
                  <View
                    style={[
                      styles.skillBarFill,
                      {
                        width: `${skill.percentage}%`,
                        backgroundColor: SKILL_COLORS[index % SKILL_COLORS.length]
                      }
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.radarEmptyText}>
              Complete lessons to see your skill radar here.
            </Text>
          )}
        </View>

        {remainingTechniques.length > 0 && (
          <View style={styles.planSection}>
            <Text style={styles.planSectionTitle}>Learning Path</Text>
            <Text style={styles.planSectionSubtitle}>
              {mastered} of {total} techniques mastered
            </Text>

            {remainingTechniques.map(item => (
              <TechniqueCard
                key={item.id}
                technique={item}
                onStatusChange={updateTechniqueStatus!}
              />
            ))}
          </View>
        )}

        {progress === 100 && total > 0 && (
          <Animated.View style={[styles.achievementBanner, { transform: [{ scale: scaleAnim }] }]}>
            <Feather name="star" size={28} color="#F57F17" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.achievementTitle}>Mastery Achieved!</Text>
              <Text style={styles.achievementDesc}>
                You've mastered all core techniques.
              </Text>
            </View>
          </Animated.View>
        )}

      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <View style={styles.tabItemActive}>
            <Feather name="grid" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.tabLabelActive}>Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Feather name="book-open" size={22} color="#8A8F85" style={{ marginBottom: 4 }} />
          <Text style={styles.tabLabel}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Feather name="pie-chart" size={22} color="#8A8F85" style={{ marginBottom: 4 }} />
          <Text style={styles.tabLabel}>Radar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const SKILL_COLORS = ['#C45B28', '#2E7D32', '#1565C0', '#7B1FA2', '#C62828'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F4',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8F85',
    letterSpacing: 1,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C18',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6E9E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#44483D',
  },

  // ─── Section Labels ───
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#43503F',
  },

  // ─── Hero Card ───
  heroCardWrapper: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heroOverlay: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroTrackBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  heroTrackText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroHobbyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroFooter: {
    padding: 16,
  },
  heroDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D6CD',
  },
  dotActive: {
    backgroundColor: '#43503F',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  heroNextRow: {
    marginBottom: 14,
  },
  heroNextLabel: {
    fontSize: 14,
    color: '#60645C',
    fontWeight: '500',
  },

  // ─── Momentum Card ───
  momentumCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  momentumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  momentumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C18',
    marginBottom: 4,
  },
  momentumSubtitle: {
    fontSize: 13,
    color: '#8A8F85',
    fontWeight: '500',
  },
  momentumFireIcon: {
    fontSize: 24,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8F85',
  },
  dayLabelActive: {
    color: '#43503F',
    fontWeight: '800',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotCompleted: {
    backgroundColor: '#43503F',
  },
  dayDotToday: {
    backgroundColor: '#43503F',
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },
  dayCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Radar ───
  radarSection: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  radarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C18',
  },
  radarLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8F85',
  },
  radarCategoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8F85',
    letterSpacing: 1,
    marginBottom: 16,
  },
  skillRow: {
    marginBottom: 18,
  },
  skillNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '700',
  },
  skillPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#60645C',
  },
  skillBarTrack: {
    height: 6,
    backgroundColor: '#F0F1EC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  radarEmptyText: {
    fontSize: 14,
    color: '#8A8F85',
    textAlign: 'center',
    paddingVertical: 12,
  },

  // ─── Learning Path ───
  planSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C18',
    marginBottom: 4,
  },
  planSectionSubtitle: {
    fontSize: 13,
    color: '#8A8F85',
    fontWeight: '500',
    marginBottom: 16,
  },

  // ─── Achievement ───
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F57F17',
  },
  achievementDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F9A825',
  },

  // ─── Bottom Tab Bar ───
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F1EC',
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabItemActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#43503F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabIconActive: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8A8F85',
  },
  tabLabelActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#43503F',
  },

  // ─── Regeneration State ───
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  regeneratingEmoji: {
    fontSize: 48,
    marginBottom: 24,
  },
  regeneratingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1C18',
    marginBottom: 8,
  },
  regeneratingText: {
    fontSize: 16,
    color: '#60645C',
    textAlign: 'center',
    lineHeight: 24,
  },
});
