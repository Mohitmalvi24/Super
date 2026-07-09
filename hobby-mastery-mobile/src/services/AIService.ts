import { LearningPlan, SkillLevel, Technique } from '../types';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://super-rrfr.onrender.com';

export const AIService = {
  async generateLearningPlan(hobby: string, level: SkillLevel): Promise<LearningPlan> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hobby, level })
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan from backend');
      }

      const plan: LearningPlan = await response.json();
      return plan;
    } catch (error) {
      console.error('Backend request failed:', error);
      return this.getMockPlan(hobby, level);
    }
  },

  getMockPlan(hobby: string, level: SkillLevel): LearningPlan {
    return {
      hobby,
      targetLevel: level,
      createdAt: Date.now(),
      techniques: [
        {
          id: '1',
          name: 'The Fundamentals',
          description: `Core concepts of ${hobby} to build a strong base.`,
          level: level,
          status: 'not-started',
          resources: [
            { id: 'r1', title: 'Basic Guide', type: 'article', url: 'https://example.com/guide' }
          ]
        },
        {
          id: '2',
          name: 'Advanced Practice Routine',
          description: 'How to practice effectively every day.',
          level: level,
          status: 'not-started',
          resources: [
            { id: 'r2', title: 'Practice Video', type: 'video', url: 'https://youtube.com' }
          ]
        }
      ]
    };
  }
};
