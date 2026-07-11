import React, { useContext, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LearningContext } from '../store/LearningContext';
import { DailyChallenge } from '../components/DailyChallenge';
import { LessonScreen } from '../components/LessonScreen';
import { PracticeDrillScreen } from '../components/PracticeDrillScreen';
import { StoryLearnScreen } from '../components/StoryLearnScreen';
import { CompletionScreen } from '../components/CompletionScreen';
import { JourneyTab } from '../components/JourneyTab';
import { PracticeTab } from '../components/PracticeTab';
import { ProfileTab } from '../components/ProfileTab';
import { LearnTab } from '../components/LearnTab';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.38;

type TabId = 'home' | 'journey' | 'practice' | 'learn' | 'profile';

interface TabConfig {
  id: TabId;
  icon: string;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'journey', icon: 'map', label: 'Journey' },
  { id: 'practice', icon: 'target', label: 'Practice' },
  { id: 'learn', icon: 'book-open', label: 'Learn' },
  { id: 'profile', icon: 'user', label: 'Profile' },
];

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const DashboardScreen = () => {
  const ctx = useContext(LearningContext);
  if (!ctx) return null;

  const {
    plan, updateTechniqueStatus, clearPlan,
    totalXp, challengesCompleted, addXp, incrementChallenges,
  } = ctx;

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activePracticeId, setActivePracticeId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [completedTechnique, setCompletedTechnique] = useState<Technique | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [activeTab]);

  const metrics = useMemo(() => {
    if (!plan?.techniques) return null;

    const active = plan.techniques.filter(t => t.status !== 'skipped');
    const mastered = active.filter(t => t.status === 'mastered').length;
    const nextTech = active.find(t => t.status !== 'mastered') || null;
    const progress = active.length > 0 ? Math.round((mastered / active.length) * 100) : 0;

    return { total: active.length, mastered, progress, nextTech };
  }, [plan?.techniques]);

  if (!plan || !metrics) return null;

  const handleChallengeComplete = useCallback((xp: number) => {
    addXp(xp);
    incrementChallenges();
  }, [addXp, incrementChallenges]);

  const openLesson = (techId: string) => {
    setActiveLessonId(techId);
  };

  const openPractice = (techId: string) => {
    setActivePracticeId(techId);
  };

  const openStory = (techId: string) => {
    setActiveStoryId(techId);
  };

  const handleLessonComplete = async (techId: string) => {
    const tech = plan.techniques.find(t => t.id === techId);
    if (tech) {
      await updateTechniqueStatus(techId, 'mastered');
      setActiveLessonId(null);
      setCompletedTechnique(tech);
    }
  };

  const handleCompletionDismiss = () => {
    setCompletedTechnique(null);
  };

  if (completedTechnique) {
    return (
      <CompletionScreen
        technique={completedTechnique}
        xpEarned={25}
        streakCount={plan.streakCount || 0}
        progressBefore={Math.max(0, metrics.progress - 15)}
        progressNow={metrics.progress}
        nextTechnique={plan.techniques.find(t => t.status !== 'mastered' && t.id !== completedTechnique.id) || null}
        onContinue={handleCompletionDismiss}
        onBackToHome={handleCompletionDismiss}
      />
    );
  }

  if (activePracticeId) {
    const tech = plan.techniques.find(t => t.id === activePracticeId);
    if (tech) {
      return (
        <PracticeDrillScreen
          technique={tech}
          onBack={() => setActivePracticeId(null)}
          onComplete={() => {
            setActivePracticeId(null);
            setCompletedTechnique(tech);
          }}
        />
      );
    }
  }

  if (activeStoryId) {
    const tech = plan.techniques.find(t => t.id === activeStoryId);
    if (tech) {
      return (
        <StoryLearnScreen
          technique={tech}
          onClose={() => setActiveStoryId(null)}
          onComplete={() => {
            setActiveStoryId(null);
            setCompletedTechnique(tech);
          }}
        />
      );
    }
  }

  if (activeLessonId) {
    const tech = plan.techniques.find(t => t.id === activeLessonId);
    if (tech) {
      return (
        <LessonScreen
          technique={tech}
          onBack={() => setActiveLessonId(null)}
          onComplete={() => handleLessonComplete(tech.id)}
          totalXp={totalXp}
        />
      );
    }
  }

  const handleReset = () => {
    Alert.alert('Reset Plan?', 'Start fresh with a new hobby?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => clearPlan?.() },
    ]);
  };

  const renderConceptCard = ({ item }: { item: Technique }) => {
    const isMastered = item.status === 'mastered';
    return (
      <TouchableOpacity
        style={styles.conceptCard}
        activeOpacity={0.7}
        onPress={() => openLesson(item.id)}
      >
        <View style={[styles.conceptVisual, isMastered && styles.conceptVisualDone]}>
          <Text style={styles.conceptEmoji}>{item.emoji || '📖'}</Text>
          {isMastered && (
            <View style={styles.conceptCheckmark}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.conceptName} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.levelBadge,
          item.level === 'Intermediate' && styles.levelBadgeIntermediate,
          item.level === 'Advanced' && styles.levelBadgeAdvanced,
        ]}>
          <Text style={[styles.levelBadgeText,
            item.level === 'Intermediate' && styles.levelBadgeTextIntermediate,
            item.level === 'Advanced' && styles.levelBadgeTextAdvanced,
          ]}>{item.level || 'Beginner'}</Text>
        </View>
        <View style={styles.conceptFooter}>
          <Feather name="clock" size={12} color={Theme.colors.text.muted} />
          <Text style={styles.conceptTime}>{item.estimatedMinutes} min</Text>
          <TouchableOpacity
            style={styles.conceptArrow}
            onPress={() => openLesson(item.id)}
          >
            <Feather name="arrow-right" size={14} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.headerSub}>Ready to sharpen your {plan.hobby.toLowerCase()} today?</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>{plan.streakCount || 0}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpIcon}>💎</Text>
            <View>
              <Text style={styles.xpValue}>{totalXp.toLocaleString()}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
        </View>
      </View>

      {metrics.nextTech && (
        <TouchableOpacity
          style={styles.continueCard}
          activeOpacity={0.8}
          onPress={() => openLesson(metrics.nextTech!.id)}
        >
          <View style={styles.continueLeft}>
            <Text style={styles.continueLabel}>Continue Learning</Text>
            <Text style={styles.continueTitle}>{metrics.nextTech.name}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${metrics.progress}%` }]} />
            </View>
            <Text style={styles.continueProgress}>{metrics.progress}% completed</Text>
          </View>
          <View style={styles.continueRight}>
            <View style={styles.continueEmoji}>
              <Text style={{ fontSize: 36 }}>{metrics.nextTech.emoji || '📖'}</Text>
            </View>
            <View style={styles.playButton}>
              <Feather name="play" size={20} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Concepts</Text>
        <TouchableOpacity onPress={() => setActiveTab('journey')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={plan.techniques}
        renderItem={renderConceptCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.conceptsRow}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Challenge</Text>
      </View>

      <DailyChallenge
        hobby={plan.hobby}
        completedChallenges={challengesCompleted}
        onChallengeComplete={handleChallengeComplete}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <TouchableOpacity onPress={() => setActiveTab('profile')}>
          <Text style={styles.seeAll}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressCardLeft}>
          <View style={styles.progressIcon}>
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </View>
          <View>
            <Text style={styles.progressCardTitle}>{plan.hobby} Journey</Text>
            <Text style={styles.progressCardLevel}>Level {Math.floor(totalXp / 500) + 1}</Text>
          </View>
        </View>
        <View style={styles.progressXpBar}>
          <Text style={styles.progressXpText}>{totalXp} / {(Math.floor(totalXp / 500) + 1) * 500} XP</Text>
          <View style={styles.progressXpTrack}>
            <View style={[styles.progressXpFill, {
              width: `${Math.min(100, (totalXp % 500) / 5)}%`
            }]} />
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.root}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'journey' && (
          <JourneyTab
            plan={plan}
            totalXp={totalXp}
            onOpenLesson={openLesson}
            onStatusChange={updateTechniqueStatus}
          />
        )}
        {activeTab === 'practice' && (
          <PracticeTab
            techniques={plan.techniques}
            hobby={plan.hobby}
            onOpenPractice={openPractice}
            totalXp={totalXp}
          />
        )}
        {activeTab === 'learn' && (
          <LearnTab
            plan={plan}
            totalXp={totalXp}
            onOpenStory={openStory}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            plan={plan}
            totalXp={totalXp}
            challengesCompleted={challengesCompleted}
            onReset={handleReset}
          />
        )}
      </Animated.View>

      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={isActive ? styles.tabIconActive : styles.tabIconInactive}>
                <Feather
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? Theme.colors.primary : Theme.colors.text.muted}
                />
              </View>
              <Text style={isActive ? styles.tabLabelActive : styles.tabLabel}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  headerSub: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  streakIcon: { fontSize: 16 },
  streakValue: { ...Theme.typography.headingSm, color: Theme.colors.text.primary },
  streakLabel: { ...Theme.typography.caption, color: Theme.colors.text.muted },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  xpIcon: { fontSize: 16 },
  xpValue: { ...Theme.typography.headingSm, color: Theme.colors.primary },
  xpLabel: { ...Theme.typography.caption, color: Theme.colors.text.muted },

  continueCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primaryBg,
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    marginBottom: 24,
  },
  continueLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  continueLabel: {
    ...Theme.typography.headingSm,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  continueTitle: {
    ...Theme.typography.displaySm,
    color: Theme.colors.text.primary,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Theme.colors.palette.violet[200],
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
  },
  continueProgress: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
  },
  continueRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  continueEmoji: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
  },
  seeAll: {
    ...Theme.typography.headingSm,
    color: Theme.colors.primary,
  },

  conceptsRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  conceptCard: {
    width: CARD_WIDTH,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  conceptVisual: {
    width: '100%',
    height: 80,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  conceptVisualDone: {
    backgroundColor: Theme.colors.successLight,
  },
  conceptEmoji: {
    fontSize: 32,
  },
  conceptCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conceptName: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  levelBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '700',
  },
  levelBadgeIntermediate: {
    backgroundColor: Theme.colors.warningLight,
  },
  levelBadgeTextIntermediate: {
    color: Theme.colors.warning,
  },
  levelBadgeAdvanced: {
    backgroundColor: '#FEF2F2',
  },
  levelBadgeTextAdvanced: {
    color: Theme.colors.danger,
  },
  conceptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conceptTime: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
    flex: 1,
  },
  conceptArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
  },
  progressCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCardTitle: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
  },
  progressCardLevel: {
    ...Theme.typography.bodySm,
    color: Theme.colors.primary,
  },
  progressXpBar: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressXpText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },
  progressXpTrack: {
    width: 80,
    height: 6,
    backgroundColor: Theme.colors.border,
    borderRadius: 3,
  },
  progressXpFill: {
    height: 6,
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
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
    paddingBottom: 28,
    paddingTop: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 50,
  },
  tabIconActive: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  tabIconInactive: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  tabLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
  tabLabelActive: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
});
