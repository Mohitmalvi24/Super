import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { Technique } from '../types';

interface PracticeTabProps {
  techniques: Technique[];
  hobby: string;
  onOpenPractice: (id: string) => void;
  totalXp: number;
}

export const PracticeTab = ({ techniques, hobby, onOpenPractice }: PracticeTabProps) => {
  const practiceable = techniques.filter(t => t.status === 'mastered');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Review what you've learned.</Text>
      </View>

      {practiceable.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>Nothing to practice yet</Text>
          <Text style={styles.emptySub}>Complete your first lesson to unlock practice drills.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {practiceable.map(tech => (
            <TouchableOpacity 
              key={tech.id} 
              style={styles.drillCard}
              activeOpacity={0.7}
              onPress={() => onOpenPractice(tech.id)}
            >
              <View style={styles.drillHeader}>
                <View style={styles.drillVisual}>
                  <Text style={styles.drillEmoji}>{tech.emoji || '🎯'}</Text>
                </View>
                <View style={styles.drillTag}>
                  <Text style={styles.drillTagText}>Review</Text>
                </View>
              </View>
              <Text style={styles.drillTitle}>{tech.name}</Text>
              <Text style={styles.drillDesc} numberOfLines={2}>
                {tech.lesson?.exercise?.instruction || tech.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySub: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  drillCard: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadow.sm,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  drillVisual: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillEmoji: {
    fontSize: 28,
  },
  drillTag: {
    backgroundColor: Theme.colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  drillTagText: {
    ...Theme.typography.caption,
    color: Theme.colors.infoDark,
  },
  drillTitle: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  drillDesc: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
});
