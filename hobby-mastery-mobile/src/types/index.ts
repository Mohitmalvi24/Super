export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type TechniqueStatus = 'not-started' | 'learning' | 'mastered' | 'skipped';
export type ChallengeType = 'quiz' | 'timed-drill' | 'creative-prompt' | 'reflection';

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
  emoji: string;
  estimatedMinutes: number;
  level: string;
  visualDescription: string;
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

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface DailyChallenge {
  id: string;
  hobby: string;
  type: ChallengeType;
  title: string;
  description: string;
  content: string;
  emoji: string;
  visualHint: string;
  options?: QuizOption[];
  durationMinutes: number;
  xpReward: number;
  generatedAt: number;
}
