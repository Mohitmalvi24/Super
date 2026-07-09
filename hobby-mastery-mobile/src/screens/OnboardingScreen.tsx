import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LearningContext } from '../store/LearningContext';
import { AIService } from '../services/AIService';
import { SkillLevel } from '../types';
import { Theme } from '../utils/theme';

const SKILL_LEVELS: { id: SkillLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

export const OnboardingScreen = () => {
  const { setPlan } = useContext(LearningContext) || {};
  const [hobby, setHobby] = useState('');
  const [level, setLevel] = useState<SkillLevel>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  const isFormValid = useMemo(() => hobby.trim().length > 2, [hobby]);

  const handleGenerate = async () => {
    if (!isFormValid || !setPlan) return;
    
    setIsGenerating(true);
    try {
      const plan = await AIService.generateLearningPlan(hobby.trim(), level);
      await setPlan(plan);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate plan. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>What do you want to master?</Text>
          <Text style={styles.subtitle}>Enter a hobby and we'll curate the perfect learning path for you.</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hobby (e.g., Guitar, Chess, Cooking)</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your hobby..."
              placeholderTextColor={Theme.colors.text.muted}
              value={hobby}
              onChangeText={setHobby}
              autoCapitalize="words"
              editable={!isGenerating}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Skill Level</Text>
            <View style={styles.pillContainer}>
              {SKILL_LEVELS.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  style={[styles.pill, level === skill.id && styles.pillActive]}
                  onPress={() => setLevel(skill.id)}
                  disabled={isGenerating}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, level === skill.id && styles.pillTextActive]}>
                    {skill.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, (!isFormValid || isGenerating) && styles.buttonDisabled]} 
            onPress={handleGenerate}
            disabled={!isFormValid || isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator color={Theme.colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Generate My Path</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.text.primary,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text.muted,
  },
  pillTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  button: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  buttonText: {
    color: Theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  }
});
