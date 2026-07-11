import { LearningPlan, SkillLevel, Technique } from '../types';

const BACKEND_URL = 'https://super-rrfr.onrender.com';

export const AIService = {
  async generateLearningPlan(hobby: string, level: SkillLevel, skippedTechniques: string[] = []): Promise<LearningPlan> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hobby, level, skippedTechniques })
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
      streakCount: 0,
      techniques: [
        {
          id: '1',
          name: 'The Fundamentals',
          description: `Core concepts of ${hobby} to build a strong base.`,
          category: 'Basics',
          estimatedMinutes: 15,
          level: level,
          status: 'not-started',
          emoji: '📖',
          visualDescription: 'A generic visualization of the technique.',
          lesson: {
            overview: `This lesson introduces the foundational principles of ${hobby}. Understanding these basics is essential before moving to advanced techniques.`,
            steps: [
              { order: 1, title: 'Understand the Basics', body: `Start by familiarizing yourself with the core vocabulary and concepts of ${hobby}. Read through each term carefully and try to connect it to something you already know.` },
              { order: 2, title: 'Observe Before Doing', body: `Watch how experienced practitioners approach ${hobby}. Pay attention to their posture, grip, timing, and flow. Mental rehearsal is just as valuable as physical practice.` },
              { order: 3, title: 'Try It Yourself', body: `Now attempt the basic movements or actions yourself. Don't worry about perfection — focus on getting comfortable with the motions. Repeat each action 5-10 times slowly.` },
            ],
            exercise: {
              title: 'Foundation Drill',
              instruction: `Set a timer and practice the basic stance and movements for ${hobby}. Focus on slow, deliberate repetitions rather than speed. Take a 30-second break between sets.`,
              durationMinutes: 10,
              goal: 'Complete 3 sets of 10 slow repetitions with correct form.',
            },
            proTips: [
              'Slow practice builds faster muscle memory than rushing.',
              'Record yourself to spot mistakes you can\'t feel.',
              'Consistency beats intensity — 15 minutes daily outperforms 2-hour weekend sessions.',
            ],
          },
          keyTakeaways: [
            { title: 'Start Slow', detail: 'Focus on form before speed.' },
            { title: 'Be Patient', detail: 'Mastery takes consistent daily effort, not overnight intensity.' },
          ],
        },
        {
          id: '2',
          name: 'Advanced Practice Routine',
          description: 'How to practice effectively every day.',
          category: 'Practice',
          estimatedMinutes: 20,
          level: level,
          status: 'not-started',
          emoji: '📖',
          visualDescription: 'A generic visualization of the technique.',
          lesson: {
            overview: `A structured practice routine separates amateurs from experts. This lesson covers how to optimize your practice time for maximum growth.`,
            steps: [
              { order: 1, title: 'Warm Up', body: `Always start with a 3-5 minute warm-up. Review basic movements to get your mind and body ready for focused learning.` },
              { order: 2, title: 'Targeted Practice', body: `Pick one specific weakness and spend 10 minutes working only on that. Avoid the temptation to just do what you're already good at.` },
              { order: 3, title: 'Cool Down', body: `End your session by playing or doing something fun and creative within the hobby to maintain your passion and motivation.` },
            ],
            exercise: {
              title: 'The 20-Minute Focus Block',
              instruction: `Use the Pomodoro technique. 5 min warm-up, 10 min hyper-focused practice on a new skill, 5 min cool-down/fun activity.`,
              durationMinutes: 20,
              goal: 'Complete the block without checking your phone or getting distracted.',
            },
            proTips: [
              'Keep a practice journal to track what you worked on.',
              'Stop practicing when you feel frustrated — take a break and return later.',
            ],
          },
          keyTakeaways: [
            { title: 'Structure Matters', detail: 'Random practice leads to random results.' },
            { title: 'Focus on Weaknesses', detail: 'Growth happens when you tackle things you cannot easily do yet.' },
          ],
        }
      ]
    };
  }
};
