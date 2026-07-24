import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, KeyboardAvoidingView, Platform, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '../utils/theme';
import AppLogo from '../../assets/AppRealLogo.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NameEntryScreenProps {
  onSubmit: (name: string) => void;
}

export const NameEntryScreen = ({ onSubmit }: NameEntryScreenProps) => {
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(trimmed);
  };

  const isValid = name.trim().length >= 2;

  return (
    <LinearGradient
      colors={[Theme.colors.primary, '#1e40af', '#0f172a']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
            <Image source={AppLogo} style={styles.logoImage} resizeMode="contain" />
          </Animated.View>

          <Text style={styles.title}>Welcome to Zovian</Text>

          <View style={styles.messageContainer}>
            <Text style={styles.messageMain}>We just want to know your name,</Text>
            <Text style={styles.messageSub}>That is enough for us</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, isValid && styles.inputWrapperValid]}>
              <Feather
                name="user"
                size={20}
                color={isValid ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                maxLength={30}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Let's Begin</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Your name stays on your device only 🔒
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  title: {
    ...Theme.typography.displayMd,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  messageMain: {
    ...Theme.typography.bodyLg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  messageSub: {
    ...Theme.typography.bodyLg,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperValid: {
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...Theme.typography.bodyLg,
    color: '#FFFFFF',
    fontSize: 18,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    ...Theme.typography.headingMd,
    color: '#FFFFFF',
  },
  footnote: {
    ...Theme.typography.caption,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 24,
    textAlign: 'center',
  },
});
