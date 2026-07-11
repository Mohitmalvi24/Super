import React, { useContext, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Dimensions, FlatList, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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
import { VisualImageService } from '../services/VisualImageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

const normalize = (value: string): string => value.trim().toLowerCase();

const getHobbyKind = (hobby: string): 'chess' | 'football' | 'generic' => {
  const normalized = normalize(hobby);
  if (normalized.includes('chess')) return 'chess';
  if (normalized.includes('football') || normalized.includes('soccer')) return 'football';
  return 'generic';
};

const CHESS_TITLES = ['Fork', 'Pin', 'Skewer', 'Checkmate Patterns'];
const FOOTBALL_TITLES = ['First Touch', 'Passing Lanes', 'Ball Control', 'Finishing'];

const getDisplayName = (hobby: string, technique: Technique, index: number): string => {
  const kind = getHobbyKind(hobby);
  const current = normalize(technique.name);
  const isGeneric = current.includes('fundamental') || current.includes('structured practice') || current.includes('advanced practice');

  if (kind === 'chess') return CHESS_TITLES[index % CHESS_TITLES.length];
  if (kind === 'football' && isGeneric) return FOOTBALL_TITLES[index % FOOTBALL_TITLES.length];
  return technique.name;
};

const ChessVisual = ({ variant = 0, compact = false }: { variant?: number; compact?: boolean }) => {
  const pieces = [
    [{ row: 2, col: 2, label: 'N' }, { row: 0, col: 6, label: 'R' }, { row: 5, col: 6, label: 'Q' }],
    [{ row: 1, col: 5, label: 'B' }, { row: 5, col: 5, label: 'B' }],
    [{ row: 1, col: 4, label: 'R' }, { row: 5, col: 4, label: 'Q' }],
    [{ row: 1, col: 5, label: 'B' }, { row: 3, col: 7, label: 'K' }],
  ][variant % 4];

  return (
    <View style={[styles.boardVisual, compact && styles.boardVisualCompact]}>
      {Array.from({ length: 64 }).map((_, cell) => {
        const row = Math.floor(cell / 8);
        const col = cell % 8;
        const piece = pieces.find(p => p.row === row && p.col === col);
        return (
          <View
            key={cell}
            style={[
              styles.boardSquare,
              (row + col) % 2 === 0 ? styles.boardSquareLight : styles.boardSquareDark,
            ]}
          >
            {piece && <Text style={styles.boardPiece}>{piece.label}</Text>}
          </View>
        );
      })}
      {variant % 4 === 0 && (
        <>
          <View style={[styles.tacticLine, styles.tacticLineOne]} />
          <View style={[styles.tacticLine, styles.tacticLineTwo]} />
        </>
      )}
      {variant % 4 === 1 && <View style={[styles.tacticLine, styles.pinLine]} />}
      {variant % 4 === 2 && <View style={[styles.tacticLine, styles.skewerLine]} />}
    </View>
  );
};

const FootballVisual = ({ variant = 0, compact = false }: { variant?: number; compact?: boolean }) => (
  <View style={[styles.pitchVisual, compact && styles.pitchVisualCompact]}>
    <View style={styles.pitchCenterCircle} />
    <View style={styles.pitchMidline} />
    <View style={[styles.pitchPlayer, styles.pitchPlayerOne]} />
    <View style={[styles.pitchPlayer, styles.pitchPlayerTwo]} />
    <View style={[styles.pitchPlayer, styles.pitchPlayerThree]} />
    <View style={[styles.pitchBall, variant % 2 === 0 ? styles.pitchBallOne : styles.pitchBallTwo]} />
    <View style={[styles.pitchRunLine, variant % 2 === 0 ? styles.pitchRunLineOne : styles.pitchRunLineTwo]} />
  </View>
);

const TechniqueVisual = ({
  hobby,
  imageUri,
  index,
  compact = false,
  fallback,
}: {
  hobby: string;
  imageUri?: string;
  index: number;
  compact?: boolean;
  fallback: string;
}) => {
  const kind = getHobbyKind(hobby);
  if (kind === 'chess') return <ChessVisual variant={index} compact={compact} />;
  if (kind === 'football') return <FootballVisual variant={index} compact={compact} />;
  if (imageUri) return <Image source={{ uri: imageUri }} style={compact ? styles.continueImage : styles.conceptImage} resizeMode="cover" />;
  return <Text style={compact ? styles.continueVisualEmoji : styles.conceptEmoji}>{fallback}</Text>;
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
  const [techniqueImages, setTechniqueImages] = useState<Record<string, string>>({});

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

  useEffect(() => {
    let isMounted = true;

    const loadTechniqueImages = async () => {
      if (!plan?.techniques?.length) return;

      const entries = await Promise.all(
        plan.techniques.map(async tech => {
          const imageUri = await VisualImageService.getTechniqueImage(plan.hobby, tech.name);
          return imageUri ? [tech.id, imageUri] as const : null;
        }),
      );

      if (!isMounted) return;

      setTechniqueImages(
        entries.reduce<Record<string, string>>((acc, entry) => {
          if (entry) acc[entry[0]] = entry[1];
          return acc;
        }, {}),
      );
    };

    loadTechniqueImages();

    return () => {
      isMounted = false;
    };
  }, [plan?.hobby, plan?.techniques]);

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

  const renderConceptCard = ({ item, index }: { item: Technique; index: number }) => {
    const isMastered = item.status === 'mastered';
    const displayName = getDisplayName(plan.hobby, item, index);
    
    // Dynamic color logic based on index or level for the cards to match the target UI
    const colorScheme = [
      { bg: '#FEF3C7', text: '#D97706', arrowBg: '#FEF3C7' }, // Yellow/Amber
      { bg: '#D1FAE5', text: '#059669', arrowBg: '#D1FAE5' }, // Green
      { bg: '#DBEAFE', text: '#2563EB', arrowBg: '#DBEAFE' }, // Blue
      { bg: '#F3E8FF', text: '#7C3AED', arrowBg: '#F3E8FF' }, // Purple
    ][index % 4];

    return (
      <TouchableOpacity
        style={styles.conceptCard}
        activeOpacity={0.7}
        onPress={() => openLesson(item.id)}
      >
        <Text style={styles.conceptName} numberOfLines={2}>{displayName}</Text>
        <View style={[styles.levelBadge, { backgroundColor: colorScheme.bg }]}>
          <Text style={[styles.levelBadgeText, { color: colorScheme.text }]}>
            {item.level || 'Beginner'}
          </Text>
        </View>

        <View style={[styles.conceptVisual, { backgroundColor: colorScheme.bg + '40' }]}>
          <TechniqueVisual
            hobby={plan.hobby}
            imageUri={techniqueImages[item.id]}
            index={index}
            fallback={item.emoji || '📖'}
          />
          {isMastered && (
            <View style={styles.conceptCheckmark}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.conceptFooter}>
          <View style={styles.conceptTimeRow}>
            <Feather name="clock" size={12} color={Theme.colors.text.muted} />
            <Text style={styles.conceptTime}>{item.estimatedMinutes} min</Text>
          </View>
          <View style={[styles.conceptArrow, { backgroundColor: colorScheme.arrowBg }]}>
            <Feather name="arrow-right" size={14} color={colorScheme.text} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}, Alex</Text>
          <Text style={styles.headerSub}>Ready to sharpen your {plan.hobby.toLowerCase()} today?</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.badgeTextCol}>
              <Text style={styles.badgeValue}>{plan.streakCount || 0}</Text>
              <Text style={styles.badgeLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.xpBadgeHome}>
            <Text style={styles.streakIcon}>💎</Text>
            <View style={styles.badgeTextCol}>
              <Text style={styles.badgeValue}>{totalXp.toLocaleString()}</Text>
              <Text style={styles.badgeLabel}>XP</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => setActiveTab('profile')}>
            <Feather name="bell" size={18} color={Theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {metrics.nextTech && (
        <TouchableOpacity
          style={styles.continueCard}
          activeOpacity={0.85}
          onPress={() => openLesson(metrics.nextTech!.id)}
        >
          <View style={styles.continueLeft}>
            <Text style={styles.continueLabel}>Continue Learning</Text>
            <Text style={styles.continueTitle}>
              {getDisplayName(plan.hobby, metrics.nextTech, plan.techniques.findIndex(t => t.id === metrics.nextTech?.id))}
            </Text>
            
            <View style={styles.progressRow}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${metrics.progress}%` }]} />
              </View>
              <Text style={styles.continueProgress}>{metrics.progress}% completed</Text>
            </View>
          </View>
          
          <View style={styles.continueRight}>
            <View style={styles.continueVisualBg}>
              <TechniqueVisual
                hobby={plan.hobby}
                imageUri={techniqueImages[metrics.nextTech.id]}
                index={plan.techniques.findIndex(t => t.id === metrics.nextTech?.id)}
                compact
                fallback={metrics.nextTech.emoji || '📖'}
              />
            </View>
            <View style={styles.playButton}>
              <Feather name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
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
        renderItem={({ item, index }) => renderConceptCard({ item, index })}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.conceptsRow}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Challenge</Text>
        <Text style={styles.challengeTimer}>
          <Feather name="clock" size={12} /> New Puzzle in 12:45:30
        </Text>
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
          <View style={styles.progressAvatar}>
            <Text style={styles.progressAvatarEmoji}>{plan.techniques[0]?.emoji || '🎯'}</Text>
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressCardTitle}>{plan.hobby} Journey</Text>
            <Text style={styles.progressCardLevel}>Level {Math.floor(totalXp / 500) + 1}</Text>
          </View>
        </View>
        <View style={styles.progressXpSection}>
          <Text style={styles.progressXpText}>{totalXp.toLocaleString()} / {((Math.floor(totalXp / 500) + 1) * 500).toLocaleString()} XP</Text>
          <View style={styles.progressXpTrack}>
            <View style={[styles.progressXpFill, { width: `${Math.min(100, (totalXp % 500) / 5)}%` }]} />
          </View>
        </View>
        <View style={styles.progressBadge}>
          <Feather name="hexagon" size={22} color={Theme.colors.primary} />
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
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    paddingBottom: 100,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  headerSub: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  xpBadgeHome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: Theme.colors.palette.violet[200],
  },
  streakIcon: { fontSize: 14 },
  badgeTextCol: {
    alignItems: 'center',
  },
  badgeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    lineHeight: 14,
  },
  badgeLabel: {
    fontSize: 8,
    color: Theme.colors.text.muted,
    lineHeight: 10,
  },
  notifBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },

  /* Continue Learning */
  continueCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Theme.shadow.sm,
  },
  continueLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 16,
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 4,
  },
  continueTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'column',
    gap: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Theme.colors.palette.violet[100],
    borderRadius: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  continueProgress: {
    fontSize: 11,
    color: Theme.colors.text.secondary,
  },
  continueRight: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 100,
    height: 100,
  },
  continueVisualBg: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueImage: {
    width: '100%',
    height: '100%',
  },
  continueVisualEmoji: {
    fontSize: 48,
  },
  playButton: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },

  /* Section Headers */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  challengeTimer: {
    fontSize: 12,
    color: Theme.colors.text.muted,
  },

  /* Concept Cards */
  conceptsRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 24,
  },
  conceptCard: {
    width: SCREEN_WIDTH * 0.35,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Theme.shadow.sm,
  },
  conceptName: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  conceptVisual: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  conceptImage: {
    width: '100%',
    height: '100%',
  },
  boardVisual: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)',
  },
  boardVisualCompact: {
    borderRadius: 12,
  },
  boardSquare: {
    width: '12.5%',
    height: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardSquareLight: {
    backgroundColor: '#F7F3FF',
  },
  boardSquareDark: {
    backgroundColor: '#DED6F5',
  },
  boardPiece: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
  },
  tacticLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#7C3AED',
    borderRadius: 1,
  },
  tacticLineOne: {
    width: '46%',
    left: '34%',
    top: '29%',
    transform: [{ rotate: '-34deg' }],
  },
  tacticLineTwo: {
    width: '45%',
    left: '35%',
    top: '58%',
    transform: [{ rotate: '30deg' }],
  },
  pinLine: {
    width: '62%',
    left: '19%',
    top: '49%',
    transform: [{ rotate: '90deg' }],
    backgroundColor: '#D97706',
  },
  skewerLine: {
    width: '58%',
    left: '21%',
    top: '50%',
    transform: [{ rotate: '90deg' }],
    backgroundColor: '#2563EB',
  },
  pitchVisual: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#27AE60',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.18)',
  },
  pitchVisualCompact: {
    borderRadius: 12,
  },
  pitchCenterCircle: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    left: '50%',
    top: '50%',
    marginLeft: -21,
    marginTop: -21,
  },
  pitchMidline: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  pitchPlayer: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#14532D',
  },
  pitchPlayerOne: {
    left: '20%',
    top: '28%',
  },
  pitchPlayerTwo: {
    left: '54%',
    top: '44%',
  },
  pitchPlayerThree: {
    left: '72%',
    top: '22%',
  },
  pitchBall: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FDE68A',
    borderWidth: 1,
    borderColor: '#92400E',
  },
  pitchBallOne: {
    left: '41%',
    top: '58%',
  },
  pitchBallTwo: {
    left: '64%',
    top: '34%',
  },
  pitchRunLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 1,
  },
  pitchRunLineOne: {
    width: '48%',
    left: '25%',
    top: '45%',
    transform: [{ rotate: '19deg' }],
  },
  pitchRunLineTwo: {
    width: '46%',
    left: '32%',
    top: '35%',
    transform: [{ rotate: '-18deg' }],
  },
  conceptEmoji: {
    fontSize: 32,
  },
  conceptCheckmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conceptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conceptTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conceptTime: {
    fontSize: 11,
    color: Theme.colors.text.muted,
  },
  conceptArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Your Progress */
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  progressCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressAvatarEmoji: {
    fontSize: 20,
  },
  progressMeta: {},
  progressCardTitle: {
    ...Theme.typography.headingSm,
    color: Theme.colors.text.primary,
  },
  progressCardLevel: {
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  progressXpSection: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  progressXpText: {
    fontSize: 10,
    color: Theme.colors.text.muted,
    marginBottom: 4,
  },
  progressXpTrack: {
    width: 80,
    height: 5,
    backgroundColor: Theme.colors.border,
    borderRadius: 2.5,
  },
  progressXpFill: {
    height: 5,
    backgroundColor: Theme.colors.primary,
    borderRadius: 2.5,
  },
  progressBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  /* Tab Bar */
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    fontSize: 10,
    color: Theme.colors.text.muted,
  },
  tabLabelActive: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
});
