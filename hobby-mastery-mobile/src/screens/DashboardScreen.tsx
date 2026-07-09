import React, { useContext, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LearningContext } from '../store/LearningContext';
import { TechniqueCard } from '../components/TechniqueCard';
import { ProgressBar } from '../components/ProgressBar';
import { Theme } from '../utils/theme';

export const DashboardScreen = () => {
  const { plan, updateTechniqueStatus, clearPlan } = useContext(LearningContext) || {};
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { total, mastered, progress } = useMemo(() => {
    if (!plan?.techniques) return { total: 0, mastered: 0, progress: 0 };
    
    const validTechniques = plan.techniques.filter(tech => tech.status !== 'skipped');
    const t = validTechniques.length;
    const m = validTechniques.filter(tech => tech.status === 'mastered').length;
    return {
      total: t,
      mastered: m,
      progress: t > 0 ? (m / t) * 100 : 0
    };
  }, [plan?.techniques]);

  useEffect(() => {
    if (progress === 100 && total > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 20,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 20,
        })
      ]).start();
    }
  }, [progress, total]);

  if (!plan) return null;

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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No techniques found for this plan.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Your Path to</Text>
          <Text style={styles.hobbyName}>{plan.hobby}</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetBtnText}>Start Over</Text>
        </TouchableOpacity>
      </View>

      {progress === 100 && total > 0 && (
        <Animated.View style={[styles.gamificationBanner, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.gamificationEmoji}>🏆</Text>
          <View>
            <Text style={styles.gamificationTitle}>Mastery Achieved!</Text>
            <Text style={styles.gamificationDesc}>You've mastered all core techniques.</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Mastery Progress</Text>
          <Text style={styles.progressText}>{mastered} / {total} Techniques</Text>
        </View>
        <ProgressBar progress={progress} />
      </View>

      <FlatList
        data={plan.techniques}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TechniqueCard 
            technique={item} 
            onStatusChange={updateTechniqueStatus!} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: Theme.colors.text.muted,
  },
  hobbyName: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  resetBtn: {
    padding: Theme.spacing.sm,
  },
  resetBtnText: {
    color: Theme.colors.danger,
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Theme.spacing.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  progressText: {
    fontSize: 14,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 40,
  },
  emptyState: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    color: Theme.colors.text.muted,
    fontSize: 16,
  },
  gamificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.achievement.bg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    shadowColor: Theme.colors.achievement.bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gamificationEmoji: {
    fontSize: 32,
    marginRight: Theme.spacing.md,
  },
  gamificationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.achievement.title,
  },
  gamificationDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.achievement.subtitle,
  }
});
