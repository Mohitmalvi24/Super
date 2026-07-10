import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { LearningPlan, TechniqueStatus } from '../types';
import { StorageService } from '../services/StorageService';
import { AIService } from '../services/AIService';
import { Alert } from 'react-native';

interface LearningContextType {
  plan: LearningPlan | null;
  isLoading: boolean;
  isRegenerating: boolean;
  setPlan: (plan: LearningPlan) => Promise<void>;
  updateTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  clearPlan: () => Promise<void>;
}

export const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlanState] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      const savedPlan = await StorageService.loadPlan();
      if (savedPlan) {
        // Auto-migration: if the plan uses the old WebView schema (missing lesson), wipe it
        if (savedPlan.techniques && savedPlan.techniques.length > 0 && !savedPlan.techniques[0].lesson) {
          console.log("Old plan schema detected. Wiping plan.");
          await StorageService.clearPlan();
          setPlanState(null);
        } else {
          setPlanState(savedPlan);
        }
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const setPlan = async (newPlan: LearningPlan) => {
    setPlanState(newPlan);
    await StorageService.savePlan(newPlan);
  };

  const updateTechniqueStatus = async (techniqueId: string, status: TechniqueStatus) => {
    if (!plan) return;

    const updatedTechniques = plan.techniques.map(tech => 
      tech.id === techniqueId ? { ...tech, status } : tech
    );

    let updatedPlan = { ...plan, techniques: updatedTechniques };
    setPlanState(updatedPlan);
    await StorageService.savePlan(updatedPlan);

    // Adaptive Plan Logic: Check if we hit the threshold of 3 skipped techniques
    const skippedTechniques = updatedTechniques.filter(t => t.status === 'skipped');
    if (skippedTechniques.length >= 3 && !isRegenerating) {
      regeneratePlan(updatedPlan, skippedTechniques.map(t => t.name));
    }
  };

  const regeneratePlan = async (currentPlan: LearningPlan, skippedNames: string[]) => {
    setIsRegenerating(true);
    Alert.alert(
      "Adapting Plan 🧠",
      "We noticed a few techniques were too hard. Regenerating your plan to focus on easier prerequisites..."
    );

    try {
      const newPlan = await AIService.generateLearningPlan(
        currentPlan.hobby, 
        currentPlan.targetLevel, 
        skippedNames
      );

      // We preserve the mastered techniques and the streak count, and append the new adapted plan
      const masteredTechniques = currentPlan.techniques.filter(t => t.status === 'mastered');
      
      const adaptedPlan: LearningPlan = {
        ...newPlan,
        streakCount: currentPlan.streakCount,
        techniques: [...masteredTechniques, ...newPlan.techniques]
      };

      setPlanState(adaptedPlan);
      await StorageService.savePlan(adaptedPlan);
      Alert.alert("Plan Updated", "Your path has been successfully recalibrated.");
    } catch (error) {
      console.error("Failed to regenerate plan:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const clearPlan = async () => {
    setPlanState(null);
    await StorageService.clearPlan();
  };

  return (
    <LearningContext.Provider value={{ plan, isLoading, isRegenerating, setPlan, updateTechniqueStatus, clearPlan }}>
      {children}
    </LearningContext.Provider>
  );
};
