import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { LearningPlan, TechniqueStatus } from '../types';
import { StorageService } from '../services/StorageService';
import { ApiClient } from '../services/ApiClient';
import { Alert } from 'react-native';

interface LearningContextType {
  plan: LearningPlan | null;
  isLoading: boolean;
  isRegenerating: boolean;
  totalXp: number;
  challengesCompleted: number;
  setPlan: (plan: LearningPlan) => Promise<void>;
  updateTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  clearPlan: () => Promise<void>;
  addXp: (amount: number) => void;
  incrementChallenges: () => void;
}

export const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlanState] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [challengesCompleted, setChallengesCompleted] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const savedPlan = await StorageService.loadPlan();
    if (savedPlan) {
      const hasLesson = savedPlan.techniques?.length > 0 && savedPlan.techniques[0].lesson;
      if (!hasLesson) {
        await StorageService.clearPlan();
        setPlanState(null);
      } else {
        setPlanState(savedPlan);
      }
    }
    setIsLoading(false);
  };

  const setPlan = async (newPlan: LearningPlan) => {
    setPlanState(newPlan);
    await StorageService.savePlan(newPlan);
  };

  const updateTechniqueStatus = async (techniqueId: string, status: TechniqueStatus) => {
    if (!plan) return;

    const updatedTechniques = plan.techniques.map(tech =>
      tech.id === techniqueId ? { ...tech, status } : tech,
    );

    const today = new Date().toISOString().split('T')[0];
    const updatedPlan: LearningPlan = {
      ...plan,
      techniques: updatedTechniques,
      lastPracticeDate: today,
    };

    if (status === 'mastered') {
      setTotalXp(prev => prev + 50);
    }

    setPlanState(updatedPlan);
    await StorageService.savePlan(updatedPlan);

    const skippedTechniques = updatedTechniques.filter(t => t.status === 'skipped');
    if (skippedTechniques.length >= 3 && !isRegenerating) {
      regeneratePlan(updatedPlan, skippedTechniques.map(t => t.name));
    }
  };

  const regeneratePlan = async (currentPlan: LearningPlan, skippedNames: string[]) => {
    setIsRegenerating(true);
    Alert.alert(
      'Adapting Plan',
      'We noticed a few techniques were too hard. Regenerating your plan with easier prerequisites...',
    );

    try {
      const newPlan = await ApiClient.generatePlan(
        currentPlan.hobby,
        currentPlan.targetLevel,
        skippedNames,
      );

      const masteredTechniques = currentPlan.techniques.filter(t => t.status === 'mastered');
      const adaptedPlan: LearningPlan = {
        ...newPlan,
        streakCount: currentPlan.streakCount,
        techniques: [...masteredTechniques, ...newPlan.techniques],
      };

      setPlanState(adaptedPlan);
      await StorageService.savePlan(adaptedPlan);
      Alert.alert('Plan Updated', 'Your path has been recalibrated.');
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const clearPlan = async () => {
    setPlanState(null);
    setTotalXp(0);
    setChallengesCompleted(0);
    await StorageService.clearPlan();
  };

  const addXp = (amount: number) => {
    setTotalXp(prev => prev + amount);
  };

  const incrementChallenges = () => {
    setChallengesCompleted(prev => prev + 1);
  };

  const contextValue: LearningContextType = {
    plan,
    isLoading,
    isRegenerating,
    totalXp,
    challengesCompleted,
    setPlan,
    updateTechniqueStatus,
    clearPlan,
    addXp,
    incrementChallenges,
  };

  return (
    <LearningContext.Provider value={contextValue}>
      {children}
    </LearningContext.Provider>
  );
};
