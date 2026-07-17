import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert, Keyboard, Animated,
  Dimensions, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LearningContext } from '../store/LearningContext';
import { ApiClient } from '../services/ApiClient';
import { Theme } from '../utils/theme';
import AppLogo from '../../assets/AppRealLogo.png'

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HobbyCategory {
  label: string;
  icon: string;
  color: string;
  hobbies: string[];
}

const CATEGORIES: HobbyCategory[] = [
  {
    label: 'Music',
    icon: '🎵',
    color: Theme.colors.palette.blue[500],
    hobbies: ['Guitar', 'Piano', 'Drums', 'Singing', 'Ukulele'],
  },
  {
    label: 'Art & Design',
    icon: '🎨',
    color: Theme.colors.palette.rose[500],
    hobbies: ['Watercolor', 'Digital Art', 'Sketching', 'Calligraphy', 'Photography'],
  },
  {
    label: 'Movement',
    icon: '🏃',
    color: Theme.colors.palette.emerald[500],
    hobbies: ['Yoga', 'Boxing', 'Bouldering', 'Dance', 'Martial Arts'],
  },
  {
    label: 'Mind & Knowledge',
    icon: '🧠',
    color: Theme.colors.palette.sky[500],
    hobbies: ['Chess', 'Philosophy', 'Creative Writing', 'Speed Reading', 'Public Speaking'],
  },
  {
    label: 'Craft & Making',
    icon: '🔧',
    color: Theme.colors.palette.amber[500],
    hobbies: ['Pottery', 'Woodworking', 'Origami', 'Cooking', 'Knitting'],
  },
  {
    label: 'Nature',
    icon: '🌿',
    color: '#22C55E',
    hobbies: ['Urban Gardening', 'Bird Watching', 'Foraging', 'Astronomy', 'Fishing'],
  },
];

export const OnboardingScreen = () => {
  const { setPlan } = useContext(LearningContext) || {};
  const [hobby, setHobby] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => Animated.timing(keyboardOffset, { toValue: -e.endCoordinates.height, duration: 250, useNativeDriver: true }).start(),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => Animated.timing(keyboardOffset, { toValue: 0, duration: 250, useNativeDriver: true }).start(),
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const isFormValid = useMemo(() => hobby.trim().length > 2, [hobby]);

  const handleGenerate = async () => {
    if (!isFormValid || !setPlan) return;
    setIsGenerating(true);
    Keyboard.dismiss();
    try {
      const plan = await ApiClient.generatePlan(hobby.trim(), 'beginner');
      await setPlan(plan);
    } catch {
      Alert.alert('Error', 'Could not generate your plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectHobby = (name: string) => {
    setHobby(name);
    Keyboard.dismiss();
  };

  const toggleCategory = (index: number) => {
    Keyboard.dismiss();
    setExpandedCategory(prev => prev === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <Image source={AppLogo} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Master{'\n'}Something New</Text>
            <Text style={styles.subtitle}>
              Pick a skill that excites you. We will build{'\n'}a personalized learning path just for you.
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color={Theme.colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Type any hobby..."
                placeholderTextColor={Theme.colors.text.muted}
                value={hobby}
                onChangeText={setHobby}
                autoCapitalize="words"
                editable={!isGenerating}
                onSubmitEditing={handleGenerate}
                returnKeyType="go"
              />
              {hobby.length > 0 && (
                <TouchableOpacity onPress={() => setHobby('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={16} color={Theme.colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.sectionLabel}>OR EXPLORE BY CATEGORY</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((cat, catIndex) => {
              const isExpanded = expandedCategory === catIndex;
              return (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.categoryHeader, isExpanded && { borderColor: cat.color, borderWidth: 1.5 }]}
                  onPress={() => toggleCategory(catIndex)}
                  activeOpacity={0.7}
                  disabled={isGenerating}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '18' }]}>
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={styles.categoryCountText}>{cat.hobbies.length} hobbies</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {expandedCategory !== null && (
            <View style={styles.hobbyGridWrapper}>
              <View style={styles.hobbyGrid}>
                {CATEGORIES[expandedCategory].hobbies.map(h => {
                  const cat = CATEGORIES[expandedCategory];
                  const isSelected = hobby === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.hobbyChip,
                        isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                      ]}
                      onPress={() => selectHobby(h)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.hobbyChipText, isSelected && { color: '#FFFFFF' }]}>
                        {h}
                      </Text>
                      {isSelected && <Feather name="check" size={14} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </Animated.ScrollView>

        <Animated.View style={[styles.bottomGradientWrapper, { transform: [{ translateY: keyboardOffset }] }]}>
          <LinearGradient
            colors={['rgba(248,250,252,0)', 'rgba(248,250,252,0.95)', Theme.colors.background]}
            style={styles.bottomGradient}
          >
            <TouchableOpacity
              style={[styles.startButton, (!isFormValid || isGenerating) && styles.startButtonDisabled]}
              onPress={handleGenerate}
              disabled={!isFormValid || isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.startButtonText}>Building your plan...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Text style={styles.startButtonText}>Start Learning</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {hobby.trim().length > 0 && !isGenerating && (
              <Text style={styles.selectedHint}>
                Ready to learn <Text style={styles.selectedHintBold}>{hobby}</Text>
              </Text>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
  },

  heroSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',

  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  title: {
    ...Theme.typography.displayLg,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  searchContainer: {
    marginBottom: Theme.spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 14,
    gap: Theme.spacing.md,
    ...Theme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontWeight: '500',
  },

  sectionLabel: {
    ...Theme.typography.label,
    color: Theme.colors.text.muted,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },

  categoriesContainer: {
    gap: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.sm,
    ...Theme.shadow.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
  },
  categoryCountText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
  },

  hobbyGridWrapper: {
    paddingHorizontal: Theme.spacing.xs,
    marginTop: Theme.spacing.sm,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.full,
    ...Theme.shadow.sm,
  },
  hobbyChipText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.primary,
  },

  bottomGradientWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Theme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    ...Theme.shadow.lg,
  },
  startButtonDisabled: {
    backgroundColor: Theme.colors.palette.slate[300],
    ...Theme.shadow.sm,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedHint: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
    marginTop: Theme.spacing.sm,
  },
  selectedHintBold: {
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
});
