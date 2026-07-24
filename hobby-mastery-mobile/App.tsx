import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions, Image } from 'react-native';
import { Theme } from './src/utils/theme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LearningProvider, LearningContext } from './src/store/LearningContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { NameEntryScreen } from './src/screens/NameEntryScreen';
import AppLogo from './assets/AppRealLogo.png'

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { plan, isLoading, userName, setUserName } = useContext(LearningContext) || { plan: null, isLoading: true, userName: null, setUserName: async () => {} };
  const [showSplash, setShowSplash] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowSplash(false));
      }, 1200); // Keep splash visible for at least a moment to show animation
    }
  }, [isLoading]);

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.splashContent, { transform: [{ scale: scaleAnim }, { translateY: -40 }] }]}>
          <View style={styles.logoBadge}>
            <Image source={AppLogo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.splashTitle}>Zovian</Text>
          <Text style={styles.splashSubtitle}>Learn something new every day.</Text>
        </Animated.View>
      </Animated.View>
    );
  }

  if (!userName) {
    return (
      <NameEntryScreen
        onSubmit={async (name) => {
          await setUserName(name);
        }}
      />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {plan ? (
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const linking = {
    prefixes: ['zovian://', 'https://zovian.app'],
    config: {
      screens: {
        PrivacyPolicy: 'privacy-policy',
        Dashboard: '',
        Onboarding: 'onboarding',
      }
    }
  };

  return (
    <LearningProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </LearningProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  splashContent: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  splashTitle: {
    ...Theme.typography.displayMd,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  splashSubtitle: {
    ...Theme.typography.bodyLg,
    color: 'rgba(255,255,255,0.7)',
  },
});
