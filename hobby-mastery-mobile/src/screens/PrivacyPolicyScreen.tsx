import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {Platform.OS !== 'web' && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
        
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information that you provide directly to us when you use the Zovian app, such as your selected hobbies, skill levels, and learning progress. This data is stored locally on your device to personalize your learning experience.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your information is used solely to generate personalized learning plans, track your daily challenges, and improve your app experience. We do not sell or share your personal data with third parties.
        </Text>

        <Text style={styles.heading}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Since Zovian primarily stores your progress locally on your device, you maintain full control over your data. Any interactions with our backend servers for AI generation do not involve transmitting personally identifiable information.
        </Text>

        <Text style={styles.heading}>4. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </Text>

        <Text style={styles.heading}>5. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at support@zovian.com.
        </Text>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  title: {
    ...Theme.typography.headingLg,
    color: Theme.colors.text.primary,
  },
  content: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxxl,
  },
  lastUpdated: {
    ...Theme.typography.bodySm,
    color: Theme.colors.text.muted,
    marginBottom: Theme.spacing.lg,
  },
  heading: {
    ...Theme.typography.headingMd,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  paragraph: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
});
