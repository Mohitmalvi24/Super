import React, { useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Theme } from './src/utils/theme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LearningProvider, LearningContext } from './src/store/LearningContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { plan, isLoading } = useContext(LearningContext) || { plan: null, isLoading: true };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {plan ? (
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <LearningProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </LearningProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background
  }
});
