import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { LearningPlan, TechniqueStatus } from '../types';
import { StorageService } from '../services/StorageService';

interface LearningContextType {
  plan: LearningPlan | null;
  isLoading: boolean;
  setPlan: (plan: LearningPlan) => Promise<void>;
  updateTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  clearPlan: () => Promise<void>;
}

export const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlanState] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      const savedPlan = await StorageService.loadPlan();
      if (savedPlan) {
        setPlanState(savedPlan);
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

    const updatedPlan = { ...plan, techniques: updatedTechniques };
    setPlanState(updatedPlan);
    await StorageService.savePlan(updatedPlan);
  };

  const clearPlan = async () => {
    setPlanState(null);
    await StorageService.clearPlan();
  };

  return (
    <LearningContext.Provider value={{ plan, isLoading, setPlan, updateTechniqueStatus, clearPlan }}>
      {children}
    </LearningContext.Provider>
  );
};
