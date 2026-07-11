import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../utils/theme';
import { Technique, LearningPlan } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LearnTabProps {
  plan: LearningPlan;
  totalXp: number;
  onOpenStory: (id: string) => void;
}

export const LearnTab = ({ plan, onOpenStory }: LearnTabProps) => {
  const { techniques, hobby } = plan;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Bite-sized stories to master {hobby}.</Text>
      </View>

      <View style={styles.grid}>
        {techniques.map((tech, idx) => {
          const isMastered = tech.status === 'mastered';
          // Use colors based on index for a vibrant discover feed
          const gradientColors = [
            [Theme.colors.palette.violet[500], Theme.colors.palette.violet[700]],
            [Theme.colors.palette.emerald[500], Theme.colors.palette.emerald[700]],
            [Theme.colors.palette.amber[500], Theme.colors.palette.amber[700]],
            [Theme.colors.palette.sky[500], Theme.colors.palette.sky[700]],
            [Theme.colors.palette.rose[500], Theme.colors.palette.rose[700]],
          ][idx % 5];

          return (
            <TouchableOpacity 
              key={tech.id} 
              style={styles.storyCard}
              activeOpacity={0.8}
              onPress={() => onOpenStory(tech.id)}
            >
              <LinearGradient
                colors={gradientColors as [string, string]}
                style={styles.storyGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.storyHeader}>
                  <View style={styles.storyTag}>
                    <Text style={styles.storyTagText}>{tech.category}</Text>
                  </View>
                  {isMastered && (
                    <View style={styles.masteredBadge}>
                      <Feather name="check" size={12} color={Theme.colors.successDark} />
                    </View>
                  )}
                </View>
                
                <View style={styles.storyVisual}>
                  <Text style={styles.storyEmoji}>{tech.emoji}</Text>
                </View>

                <View style={styles.storyFooter}>
                  <Text style={styles.storyTitle}>{tech.name}</Text>
                  <Text style={styles.storyDesc} numberOfLines={2}>{tech.description}</Text>
                  
                  <View style={styles.storyMeta}>
                    <Feather name="play-circle" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.storyMetaText}>{tech.estimatedMinutes} min story</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
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
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  storyCard: {
    width: (SCREEN_WIDTH - 40 - 16) / 2, // 2 columns, minus padding and gap
    height: 280,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadow.sm,
  },
  storyGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storyTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  storyTagText: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  masteredBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  storyEmoji: {
    fontSize: 56,
  },
  storyFooter: {
    marginTop: 'auto',
  },
  storyTitle: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  storyDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 14,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storyMetaText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
