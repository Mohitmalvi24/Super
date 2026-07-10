import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView, Alert, Keyboard, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LearningContext } from '../store/LearningContext';
import { AIService } from '../services/AIService';
import { Theme } from '../utils/theme';

const SUGGESTIONS = ['Digital Art', 'Urban Gardening', 'Philosophy', 'Jazz Piano', 'Bouldering'];

export const OnboardingScreen = () => {
  const { setPlan } = useContext(LearningContext) || {};
  const [hobby, setHobby] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [slideAnim]);

  const isFormValid = useMemo(() => hobby.trim().length > 2, [hobby]);

  const handleGenerate = async () => {
    if (!isFormValid || !setPlan) return;

    setIsGenerating(true);
    Keyboard.dismiss();
    try {
      const plan = await AIService.generateLearningPlan(hobby.trim(), 'beginner');
      await setPlan(plan);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate plan. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, transform: [{ translateY: slideAnim }] }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Find Your{'\n'}Passion</Text>
            <Text style={styles.subtitle}>
              What sparks your curiosity today? Explore{'\n'}a new skill or rediscover an old hobby.
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.input}
              placeholder="Search hobbies (e.g. Pottery)"
              placeholderTextColor={Theme.colors.text.muted}
              value={hobby}
              onChangeText={setHobby}
              autoCapitalize="words"
              editable={!isGenerating}
              onSubmitEditing={handleGenerate}
              returnKeyType="go"
            />
          </View>

          <View style={styles.suggestionsContainer}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionPill}
                onPress={() => setHobby(suggestion)}
                disabled={isGenerating}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.button, (!isFormValid || isGenerating) && styles.buttonDisabled]}
              onPress={handleGenerate}
              disabled={!isFormValid || isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator color={Theme.colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Start Exploration</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F4',
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl * 2,
    paddingBottom: Theme.spacing.xl,
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1A1C18',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: Theme.spacing.lg,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#60645C',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D3D6CD',
    paddingBottom: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Theme.spacing.md,
    color: '#60645C',
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1A1C18',
    paddingVertical: Theme.spacing.xs,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Theme.spacing.xl,
  },
  suggestionPill: {
    backgroundColor: '#E6E9E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.full,
  },
  suggestionText: {
    color: '#44483D',
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: Theme.spacing.sm,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#43503F',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    width: '70%',
    marginBottom: Theme.spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: '#A0A89C',
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerHint: {
    fontSize: 12,
    color: '#8A8F85',
  }
});
