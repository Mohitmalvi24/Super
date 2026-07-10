import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LearningContext } from '../store/LearningContext';
import { TechniqueCard } from '../components/TechniqueCard';
import { LearnTab } from '../components/LearnTab';
import { RadarTab } from '../components/RadarTab';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CATEGORY_ICONS: Record<string, string> = {
  Basics: 'box',
  Technique: 'layers',
  Theory: 'book',
  Practice: 'target',
  Rhythm: 'activity',
  Gear: 'tool',
  General: 'star',
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};


const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  }).toUpperCase();
};

export const DashboardScreen = () => {
  const ctx = useContext(LearningContext);
  if (!ctx) return null;
  const { plan, updateTechniqueStatus, clearPlan, isRegenerating } = ctx;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [activeTab, setActiveTab] = useState<'hub' | 'learn' | 'radar'>('hub');
  const [savedTips, setSavedTips] = useState<string[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [activeTab]);

  const metrics = useMemo(() => {
    if (!plan?.techniques) return null;

    const active = plan.techniques.filter(t => t.status !== 'skipped');
    const m = active.filter(t => t.status === 'mastered').length;
    const next = active.find(t => t.status !== 'mastered') || null;
    const remaining = active.filter(t => t.id !== next?.id);

    const cats = new Map<string, { total: number; done: number }>();
    const allProTips: string[] = [];

    active.forEach(t => {
      const c = t.category || 'General';
      const e = cats.get(c) || { total: 0, done: 0 };
      e.total++;
      if (t.status === 'mastered') e.done++;
      cats.set(c, e);

      if (t.lesson?.proTips) {
        allProTips.push(...t.lesson.proTips);
      }
    });

    const radar = Array.from(cats.entries()).map(([name, s]) => ({
      name,
      percentage: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
      total: s.total,
      done: s.done
    })).sort((a, b) => b.percentage - a.percentage);

    return {
      total: active.length,
      mastered: m,
      progress: active.length > 0 ? Math.round((m / active.length) * 100) : 0,
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
      <SafeAreaView style={[s.root, s.centerContent]}>
        <Feather name="cpu" size={48} color="#43503F" style={{ marginBottom: 24 }} />
        <Text style={s.regenTitle}>Adapting Plan...</Text>
        <Text style={s.regenText}>Analyzing your feedback to suggest better techniques.</Text>
      </SafeAreaView>
    );
  }

  const streak = plan.streakCount || 12;
  const todayIdx = new Date().getDay();
  const todayMon = todayIdx === 0 ? 6 : todayIdx - 1;
  const level = plan.targetLevel ? plan.targetLevel.charAt(0).toUpperCase() + plan.targetLevel.slice(1) : 'Beginner';

  const handleReset = () => {
    Alert.alert("Reset Plan?", "Start fresh with a new hobby?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => clearPlan?.() }
    ]);
  };

  const { nextTechnique, remainingTechniques, skillRadar, proTips, weakestSkill, strongestSkill, mastered, total, progress } = metrics;

  const renderHub = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <View style={s.header}>
        <View>
          <Text style={s.dateLabel}>{getFormattedDate()}</Text>
          <Text style={s.greeting}>{getGreeting()}</Text>
        </View>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7} style={s.resetBtn}>
          <Feather name="refresh-cw" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>


      <LinearGradient colors={['#0F172A', '#1E293B', '#334155']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroGradient}>
        <View style={s.blob1} />
        <View style={s.blob2} />
        <View style={s.blob3} />

        <View style={s.heroContent}>
          <View style={s.progressRingOuter}>
            <View style={s.progressRingInner}>
              <Text style={s.progressNumber}>{progress}</Text>
              <Text style={s.progressPercent}>%</Text>
            </View>
          </View>
          <View style={s.heroText}>
            <View style={s.trackPill}>
              <Feather name="trending-up" size={10} color="#94A3B8" />
              <Text style={s.trackPillText}>{level.toUpperCase()} TRACK</Text>
            </View>
            <Text style={s.heroTitle}>{plan.hobby}</Text>
            <Text style={s.heroSub}>{mastered} of {total} techniques mastered</Text>
          </View>
        </View>

        {nextTechnique && (
          <View style={s.heroCta}>
            <View style={s.heroCtaLeft}>
              <Feather name="zap" size={14} color="#FBBF24" />
              <Text style={s.heroCtaText}>Up next: {nextTechnique.name}</Text>
            </View>
            <TechniqueCard technique={nextTechnique} onStatusChange={updateTechniqueStatus!} isHero />
          </View>
        )}
      </LinearGradient>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={s.statCardGrad}>
            <Feather name="clock" size={20} color="#16A34A" />
            <Text style={s.statValue}>{plan.techniques.reduce((sum, t) => sum + t.estimatedMinutes, 0)}</Text>
            <Text style={s.statLabel}>Min Total</Text>
          </LinearGradient>
        </View>
        <View style={s.statCard}>
          <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={s.statCardGrad}>
            <Feather name="target" size={20} color="#2563EB" />
            <Text style={s.statValue}>{mastered}</Text>
            <Text style={s.statLabel}>Mastered</Text>
          </LinearGradient>
        </View>
      </View>

      {remainingTechniques.length > 0 && (
        <View style={s.journeySection}>
          <Text style={s.journeyTitle}>The Journey</Text>
          <Text style={s.journeySub}>{remainingTechniques.length} milestones remaining</Text>
          {remainingTechniques.map((tech, i) => (
            <View key={tech.id}>
              {i < remainingTechniques.length - 1 && <View style={s.journeyLine} />}
              <View style={s.journeyNode}>
                <View style={[s.journeyCircle, tech.status === 'mastered' && s.journeyCircleDone]}>
                  <Feather name={tech.status === 'mastered' ? 'check' : (CATEGORY_ICONS[tech.category] as any || 'circle')} size={20} color="#FFFFFF" />
                </View>
                <View style={s.journeyInfo}>
                  <Text style={s.journeyNodeTitle}>{tech.name}</Text>
                  <Text style={s.journeyNodeMeta}>{tech.category} · {tech.estimatedMinutes} min</Text>
                </View>
                <TechniqueCard technique={tech} onStatusChange={updateTechniqueStatus!} isHero />
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={s.socialCard}>
        <View style={s.socialHeader}>
          <Feather name="users" size={16} color="#475569" />
          <Text style={s.socialTitle}>Live Leaderboard</Text>
        </View>
        <View style={s.socialRow}>
          <View style={s.socialAvatar}>
            <Text style={s.socialAvatarText}>R</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.socialName}>Rohan (Friend)</Text>
            <Text style={s.socialScoreText}>You are 2 lessons behind Rohan!</Text>
          </View>
          <View style={s.socialPill}>
            <Text style={s.socialPillText}>Catch Up</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {activeTab === 'hub' && renderHub()}
        {activeTab === 'learn' && <LearnTab proTips={metrics.proTips} savedTips={savedTips} setSavedTips={setSavedTips} />}
        {activeTab === 'radar' && <RadarTab weakestSkill={metrics.weakestSkill} strongestSkill={metrics.strongestSkill} savedTips={savedTips} skillRadar={metrics.skillRadar} CATEGORY_ICONS={CATEGORY_ICONS} />}

      </Animated.View>

      <View style={s.tabBar}>
        <TouchableOpacity style={s.tabItem} activeOpacity={0.7} onPress={() => setActiveTab('hub')}>
          <View style={activeTab === 'hub' ? s.tabActive : s.tabInactive}>
            <Feather name="grid" size={18} color={activeTab === 'hub' ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={activeTab === 'hub' ? s.tabLabelActive : s.tabLabel}>Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.tabItem} activeOpacity={0.7} onPress={() => setActiveTab('learn')}>
          <View style={activeTab === 'learn' ? s.tabActive : s.tabInactive}>
            <Feather name="book-open" size={18} color={activeTab === 'learn' ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={activeTab === 'learn' ? s.tabLabelActive : s.tabLabel}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.tabItem} activeOpacity={0.7} onPress={() => setActiveTab('radar')}>
          <View style={activeTab === 'radar' ? s.tabActive : s.tabInactive}>
            <Feather name="pie-chart" size={18} color={activeTab === 'radar' ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={activeTab === 'radar' ? s.tabLabelActive : s.tabLabel}>Radar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const RADAR_COLORS = [
  { fg: '#16A34A', fgLight: '#4ADE80', bg: '#F0FDF4' },
  { fg: '#2563EB', fgLight: '#60A5FA', bg: '#EFF6FF' },
  { fg: '#DC2626', fgLight: '#F87171', bg: '#FEF2F2' },
  { fg: '#9333EA', fgLight: '#C084FC', bg: '#FAF5FF' },
  { fg: '#EA580C', fgLight: '#FB923C', bg: '#FFF7ED' },
];

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroGradient: {
    marginHorizontal: 20,
    borderRadius: 28,
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
  blob3: {
    position: 'absolute',
    top: 30,
    left: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.05)',
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
    color: '#94A3B8',
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
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
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
    fontSize: 13,
    color: '#CBD5E1',
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
    borderRadius: 16,
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
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  socialCard: {
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
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  socialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  socialName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  socialScoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
  socialPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  socialPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dayTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleDone: {
    backgroundColor: '#16A34A',
  },
  dayCircleToday: {
    backgroundColor: '#16A34A',
    borderWidth: 3,
    borderColor: '#BBF7D0',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  radarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radarIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radarInfo: {
    flex: 1,
  },
  radarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  radarName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  radarPct: {
    fontSize: 13,
    fontWeight: '800',
  },
  radarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  radarFill: {
    height: '100%',
    borderRadius: 3,
  },
  journeySection: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  journeyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  journeySub: {
    fontSize: 13,
    color: '#94A3B8',
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
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  journeyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  journeyCircleDone: {
    backgroundColor: '#16A34A',
  },
  journeyInfo: {
    flex: 1,
  },
  journeyNodeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  journeyNodeMeta: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  masteryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  masteryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
  },
  masteryDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#B45309',
    marginTop: 2,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: 32,
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabActive: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  tabLabelActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },

  tabInactive: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  regenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  regenText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  tabSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 24,
  },

});
