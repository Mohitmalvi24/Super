import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningPlan } from '../types';

const STORAGE_KEY = '@hobby_mastery_plan';
const USERNAME_KEY = '@hobby_mastery_username';

let memoryPlan: LearningPlan | null = null;
let memoryUserName: string | null = null;
let useMemoryFallback = false;

export const StorageService = {
  async savePlan(plan: LearningPlan): Promise<void> {
    if (useMemoryFallback) {
      memoryPlan = plan;
      return;
    }

    try {
      const jsonValue = JSON.stringify(plan);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Storage error:', e);
      useMemoryFallback = true;
      memoryPlan = plan;
    }
  },

  async loadPlan(): Promise<LearningPlan | null> {
    if (useMemoryFallback) {
      return memoryPlan;
    }

    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Storage error:', e);
      useMemoryFallback = true;
      return memoryPlan;
    }
  },

  async clearPlan(): Promise<void> {
    if (useMemoryFallback) {
      memoryPlan = null;
      return;
    }

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Storage error:', e);
      useMemoryFallback = true;
      memoryPlan = null;
    }
  },

  async saveUserName(name: string): Promise<void> {
    if (useMemoryFallback) {
      memoryUserName = name;
      return;
    }
    try {
      await AsyncStorage.setItem(USERNAME_KEY, name);
    } catch (e) {
      console.error('Storage error:', e);
      useMemoryFallback = true;
      memoryUserName = name;
    }
  },

  async loadUserName(): Promise<string | null> {
    if (useMemoryFallback) {
      return memoryUserName;
    }
    try {
      return await AsyncStorage.getItem(USERNAME_KEY);
    } catch (e) {
      console.error('Storage error:', e);
      useMemoryFallback = true;
      return memoryUserName;
    }
  },

  async clearUserName(): Promise<void> {
    if (useMemoryFallback) {
      memoryUserName = null;
      return;
    }
    try {
      await AsyncStorage.removeItem(USERNAME_KEY);
    } catch (e) {
      console.error('Storage error:', e);
      useMemoryFallback = true;
      memoryUserName = null;
    }
  }
};
