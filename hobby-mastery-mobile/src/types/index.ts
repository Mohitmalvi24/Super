export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type TechniqueStatus = 'not-started' | 'learning' | 'mastered' | 'skipped';

export interface LessonStep {
  order: number;
  title: string;
  body: string;
}

export interface PracticeExercise {
  title: string;
  instruction: string;
  durationMinutes: number;
  goal: string;
}


export interface KeyTakeaway {
  title: string;
  detail: string;
}

export interface LessonContent {
  overview: string;
  steps: LessonStep[];
  exercise: PracticeExercise;
  proTips: string[];
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  level: SkillLevel;
  status: TechniqueStatus;
  masteredAt?: number;
  reviewDueAt?: number;
  lesson: LessonContent;
  keyTakeaways: KeyTakeaway[];
}

export interface LearningPlan {
  hobby: string;
  targetLevel: SkillLevel;
  techniques: Technique[];
  createdAt: number;
  streakCount: number;
  lastPracticeDate?: string;
}
