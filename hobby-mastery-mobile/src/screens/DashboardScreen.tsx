import React, { useContext, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LearningContext } from '../store/LearningContext';
import { TechniqueCard } from '../components/TechniqueCard';
import { LearnTab } from '../components/LearnTab';
import { RadarTab } from '../components/RadarTab';
import { DailyChallenge } from '../components/DailyChallenge';
import { WeeklyStreak } from '../components/WeeklyStreak';
import { Theme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, string> = {
  Basics: 'box',
  Technique: 'layers',
  Theory: 'book',
  Practice: 'target',
  Rhythm: 'activity',
  Gear: 'tool',
  General: 'star',
  Fundamentals: 'grid',
};

type TabId = 'hub' | 'learn' | 'radar';

interface TabConfig {
  id: TabId;
  icon: string;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'hub', icon: 'grid', label: 'Hub' },
  { id: 'learn', icon: 'book-open', label: 'Learn' },
  { id: 'radar', icon: 'pie-chart', label: 'Radar' },
];

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  }).toUpperCase();
};

export const DashboardScreen = () => {
  const ctx = useContext(LearningContext);
  if (!ctx) return null;

  const {
    plan, updateTechniqueStatus, clearPlan, isRegenerating,
    totalXp, challengesCompleted, addXp, incrementChallenges,
  } = ctx;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [activeTab, setActiveTab] = useState<TabId>('hub');
  const [savedTips, setSavedTips] = useState<string[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [activeTab]);

  const metrics = useMemo(() => {
    if (!plan?.techniques) return null;

    const active = plan.techniques.filter(t => t.status !== 'skipped');
    const mastered = active.filter(t => t.status === 'mastered').length;
    const next = active.find(t => t.status !== 'mastered') || null;
    const remaining = active.filter(t => t.id !== next?.id);

    const cats = new Map<string, { total: number; done: number }>();
    const allProTips: string[] = [];

    active.forEach(t => {
      const c = t.category || 'General';
      const entry = cats.get(c) || { total: 0, done: 0 };
      entry.total++;
      if (t.status === 'mastered') entry.done++;
      cats.set(c, entry);
      if (t.lesson?.proTips) allProTips.push(...t.lesson.proTips);
    });

    const radar = Array.from(cats.entries())
      .map(([name, s]) => ({
        name,
        percentage: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
        total: s.total,
        done: s.done,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      total: active.length,
      mastered,
      progress: active.length > 0 ? Math.round((mastered / active.length) * 100) : 0,
      nextTechnique: next,
      remainingTechniques: remaining,
      skillRadar: radar,
      proTips: allProTips,
      weakestSkill: radar.length > 0 ? radar[radar.length - 1] : null,
      strongestSkill: radar.length > 0 ? radar[0] : null,
    };
  }, [plan?.techniques]);

  if (!plan || !metrics) return null;

  if (isRegenerating) {
    return (
      <SafeAreaView style={[styles.root, styles.centerContent]}>
        <View style={styles.regenIcon}>
          <Feather name="cpu" size={32} color={Theme.colors.text.secondary} />
        </View>
        <Text style={styles.regenTitle}>Adapting Plan...</Text>
        <Text style={styles.regenText}>Analyzing your feedback to suggest better techniques.</Text>
      </SafeAreaView>
    );
  }

  const level = plan.targetLevel
    ? plan.targetLevel.charAt(0).toUpperCase() + plan.targetLevel.slice(1)
    : 'Beginner';

  const handleReset = () => {
    Alert.alert('Reset Plan?', 'Start fresh with a new hobby?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => clearPlan?.() },
    ]);
  };

  const handleChallengeComplete = useCallback((xp: number) => {
    addXp(xp);
    incrementChallenges();
  }, [addXp, incrementChallenges]);

  const {
    nextTechnique, remainingTechniques, skillRadar, proTips,
    weakestSkill, strongestSkill, mastered, total, progress,
  } = metrics;

  const renderHub = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLabel}>{getFormattedDate()}</Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
        </View>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7} style={styles.resetBtn}>
          <Feather name="refresh-cw" size={16} color={Theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={[Theme.colors.palette.slate[900], Theme.colors.palette.slate[800], Theme.colors.palette.slate[700]]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={styles.heroContent}>
          <View style={styles.progressRingOuter}>
            <View style={styles.progressRingInner}>
              <Text style={styles.progressNumber}>{progress}</Text>
              <Text style={styles.progressPercent}>%</Text>
            </View>
          </View>
          <View style={styles.heroText}>
            <View style={styles.trackPill}>
              <Feather name="trending-up" size={10} color={Theme.colors.palette.slate[400]} />
              <Text style={styles.trackPillText}>{level.toUpperCase()} TRACK</Text>
            </View>
            <Text style={styles.heroTitle}>{plan.hobby}</Text>
            <Text style={styles.heroSub}>{mastered} of {total} techniques mastered</Text>
          </View>
        </View>

        {nextTechnique && (
          <View style={styles.heroCta}>
            <View style={styles.heroCtaLeft}>
              <Feather name="zap" size={14} color={Theme.colors.accent} />
              <Text style={styles.heroCtaText} numberOfLines={1}>Up next: {nextTechnique.name}</Text>
            </View>
            <TechniqueCard technique={nextTechnique} onStatusChange={updateTechniqueStatus} isHero />
          </View>
        )}
      </LinearGradient>

      <DailyChallenge
        hobby={plan.hobby}
        completedChallenges={challengesCompleted}
        onChallengeComplete={handleChallengeComplete}
      />

      <WeeklyStreak
        streakCount={plan.streakCount || 0}
        lastPracticeDate={plan.lastPracticeDate}
      />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[Theme.colors.successLight, Theme.colors.palette.emerald[100]]}
            style={styles.statCardGrad}
          >
            <Feather name="clock" size={20} color={Theme.colors.success} />
            <Text style={styles.statValue}>
              {plan.techniques.reduce((sum, t) => sum + t.estimatedMinutes, 0)}
            </Text>
            <Text style={styles.statLabel}>Min Total</Text>
          </LinearGradient>
        </View>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[Theme.colors.infoLight, Theme.colors.palette.sky[100]]}
            style={styles.statCardGrad}
          >
            <Feather name="target" size={20} color={Theme.colors.palette.sky[500]} />
            <Text style={styles.statValue}>{mastered}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </LinearGradient>
        </View>
      </View>

      {remainingTechniques.length > 0 && (
        <View style={styles.journeySection}>
          <Text style={styles.journeyTitle}>The Journey</Text>
          <Text style={styles.journeySub}>{remainingTechniques.length} milestones remaining</Text>
          {remainingTechniques.map((tech, i) => (
            <View key={tech.id}>
              {i < remainingTechniques.length - 1 && <View style={styles.journeyLine} />}
              <View style={styles.journeyNode}>
                <View style={[styles.journeyCircle, tech.status === 'mastered' && styles.journeyCircleDone]}>
                  <Feather
                    name={tech.status === 'mastered' ? 'check' : (CATEGORY_ICONS[tech.category] as any || 'circle')}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.journeyInfo}>
                  <Text style={styles.journeyNodeTitle}>{tech.name}</Text>
                  <Text style={styles.journeyNodeMeta}>{tech.category} · {tech.estimatedMinutes} min</Text>
                </View>
                <TechniqueCard technique={tech} onStatusChange={updateTechniqueStatus} isHero />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.root}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {activeTab === 'hub' && renderHub()}
        {activeTab === 'learn' && (
          <LearnTab proTips={proTips} savedTips={savedTips} setSavedTips={setSavedTips} />
        )}
        {activeTab === 'radar' && (
          <RadarTab
            weakestSkill={weakestSkill}
            strongestSkill={strongestSkill}
            savedTips={savedTips}
            skillRadar={skillRadar}
            categoryIcons={CATEGORY_ICONS}
            totalXp={totalXp}
            challengesCompleted={challengesCompleted}
          />
        )}
      </Animated.View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab.id)}
          >
            <View style={activeTab === tab.id ? styles.tabActive : styles.tabInactive}>
              <Feather
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? '#FFFFFF' : Theme.colors.text.muted}
              />
            </View>
            <Text style={activeTab === tab.id ? styles.tabLabelActive : styles.tabLabel}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scroll: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  dateLabel: {
    ...Theme.typography.label,
    color: Theme.colors.text.muted,
    marginBottom: 2,
  },
  greeting: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  heroGradient: {
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.xxl,
    overflow: 'hidden',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    position: 'relative',
  },
  blob1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  blob2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(168,85,247,0.06)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRingOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(148,163,184,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  progressRingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.palette.slate[400],
    marginTop: 4,
  },
  heroText: {
    flex: 1,
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(148,163,184,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  trackPillText: {
    ...Theme.typography.caption,
    color: Theme.colors.palette.slate[400],
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  heroTitle: {
    ...Theme.typography.displaySm,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSub: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.slate[400],
    fontWeight: '500',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Theme.borderRadius.lg,
    paddingLeft: 16,
    paddingVertical: 4,
    paddingRight: 4,
  },
  heroCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  heroCtaText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.palette.slate[300],
    fontWeight: '600',
    flex: 1,
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
  statCardGrad: {
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

  journeySection: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  journeyTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  journeySub: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
    fontWeight: '500',
    marginBottom: 20,
  },
  journeyNode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    zIndex: 2,
  },
  journeyLine: {
    position: 'absolute',
    left: 23,
    top: 48,
    width: 2,
    height: 56,
    backgroundColor: Theme.colors.border,
    zIndex: 1,
  },
  journeyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.palette.slate[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...Theme.shadow.md,
  },
  journeyCircleDone: {
    backgroundColor: Theme.colors.success,
  },
  journeyInfo: {
    flex: 1,
  },
  journeyNodeTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  journeyNodeMeta: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
    fontWeight: '500',
  },

  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: 32,
    justifyContent: 'space-around',
    ...Theme.shadow.lg,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabActive: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInactive: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
  tabLabelActive: {
    ...Theme.typography.caption,
    color: Theme.colors.text.primary,
    fontWeight: '700',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  regenIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  regenTitle: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  regenText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});
