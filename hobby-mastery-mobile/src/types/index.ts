export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type TechniqueStatus = 'not-started' | 'learning' | 'mastered' | 'skipped';

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'audio';
  url: string;
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  level: SkillLevel;
  status: TechniqueStatus;
  resources: Resource[];
}

export interface LearningPlan {
  hobby: string;
  targetLevel: SkillLevel;
  techniques: Technique[];
  createdAt: number;
}
