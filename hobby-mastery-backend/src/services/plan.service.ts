import { LearningPlan, Technique } from '../types';
import { callLlm, parseLlmJson } from './llm.client';
import { buildPlanPrompt } from '../prompts/plan.prompt';
import config from '../config/environment';

interface LlmTechnique {
  name: string;
  description: string;
  category: string;
  emoji?: string;
  estimatedMinutes: number;
  level?: string;
  visualDescription?: string;
  lesson: {
    overview: string;
    steps: { order: number; title: string; body: string }[];
    exercise: {
      title: string;
      instruction: string;
      durationMinutes: number;
      goal: string;
    };
    proTips: string[];
  };
  keyTakeaways: { title: string; detail: string }[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Basics: '📘',
  Fundamentals: '🧱',
  Technique: '🎯',
  Theory: '📐',
  Practice: '🏋️',
  Rhythm: '🥁',
  Strategy: '♟️',
  Gear: '🔧',
  General: '⭐',
};

export async function generateLearningPlan(
  hobby: string,
  level: string,
  skippedTechniques: string[] = [],
): Promise<LearningPlan> {
  if (!config.groqApiKey) {
    return buildMockPlan(hobby, level);
  }

  const prompt = buildPlanPrompt(hobby, level, skippedTechniques);

  try {
    const raw = await callLlm(prompt);
    const parsed = parseLlmJson<{ techniques?: LlmTechnique[] }>(raw);
    const techniques = mapTechniques(parsed.techniques || [], level);

    return {
      hobby,
      targetLevel: level,
      createdAt: Date.now(),
      streakCount: 0,
      techniques,
    };
  } catch (error) {
    console.error('Plan generation failed, falling back to mock:', error);
    return buildMockPlan(hobby, level);
  }
}

function mapTechniques(raw: LlmTechnique[], level: string): Technique[] {
  return raw.map((tech, index) => ({
    id: `tech-${index}-${Date.now()}`,
    name: tech.name,
    description: tech.description,
    category: tech.category || 'Fundamentals',
    emoji: tech.emoji || CATEGORY_EMOJIS[tech.category] || '📖',
    estimatedMinutes: tech.estimatedMinutes || 3,
    level: tech.level || level,
    visualDescription: tech.visualDescription || tech.description,
    status: 'not-started' as const,
    lesson: {
      overview: tech.lesson?.overview || tech.description,
      steps: (tech.lesson?.steps || []).map((s, i) => ({
        order: s.order || i + 1,
        title: s.title,
        body: s.body,
      })),
      exercise: tech.lesson?.exercise || {
        title: `Practice ${tech.name}`,
        instruction: `Spend focused time practicing ${tech.name} with deliberate repetition.`,
        durationMinutes: tech.estimatedMinutes || 3,
        goal: 'Complete one full practice session.',
      },
      proTips: tech.lesson?.proTips || [],
    },
    keyTakeaways: tech.keyTakeaways || [],
  }));
}

function buildMockPlan(hobby: string, level: string): LearningPlan {
  return {
    hobby,
    targetLevel: level,
    createdAt: Date.now(),
    streakCount: 0,
    techniques: [
      {
        id: 'mock-1',
        name: 'The Fundamentals',
        description: `Core concepts of ${hobby} to build a strong base.`,
        category: 'Basics',
        emoji: '📘',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: `A focused learner practicing the fundamental movements of ${hobby} with careful attention to form.`,
        status: 'not-started',
        lesson: {
          overview: `This lesson introduces the foundational principles of ${hobby}. Understanding these basics is essential before moving to advanced techniques.`,
          steps: [
            { order: 1, title: 'Understand the Basics', body: `Start by familiarizing yourself with the core vocabulary and concepts of ${hobby}. Read through each term carefully and connect it to something you already know.` },
            { order: 2, title: 'Observe Before Doing', body: `Watch how experienced practitioners approach ${hobby}. Pay attention to posture, grip, timing, and flow.` },
            { order: 3, title: 'Try It Yourself', body: `Attempt the basic movements or actions. Focus on comfort over perfection. Repeat each action 5-10 times slowly.` },
          ],
          exercise: {
            title: 'Foundation Drill',
            instruction: `Set a timer and practice the basic stance and movements for ${hobby}. Focus on slow, deliberate repetitions.`,
            durationMinutes: 3,
            goal: 'Complete 3 sets of 10 slow repetitions with correct form.',
          },
          proTips: [
            'Slow practice builds faster muscle memory than rushing.',
            'Record yourself to spot mistakes you cannot feel.',
            'Consistency beats intensity — 15 minutes daily outperforms 2-hour weekend sessions.',
          ],
        },
        keyTakeaways: [
          { title: 'Start Slow', detail: 'Focus on form before speed.' },
          { title: 'Be Patient', detail: 'Mastery takes consistent daily effort.' },
        ],
      },
      {
        id: 'mock-2',
        name: 'Structured Practice',
        description: 'How to practice effectively and build lasting habits.',
        category: 'Practice',
        emoji: '🏋️',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: 'A practice session broken into warm-up, focused practice, and cool-down phases.',
        status: 'not-started',
        lesson: {
          overview: 'A structured practice routine separates amateurs from experts. This lesson covers how to optimize your practice time.',
          steps: [
            { order: 1, title: 'Warm Up', body: 'Always start with a 3-5 minute warm-up. Review basic movements to get your mind and body ready.' },
            { order: 2, title: 'Targeted Practice', body: 'Pick one specific weakness and spend 10 minutes working only on that.' },
            { order: 3, title: 'Cool Down', body: 'End your session with something fun and creative within the hobby.' },
          ],
          exercise: {
            title: 'The Focus Block',
            instruction: 'Use the Pomodoro technique: warm-up, focused practice, cool-down.',
            durationMinutes: 3,
            goal: 'Complete the block without distraction.',
          },
          proTips: [
            'Keep a practice journal to track what you worked on.',
            'Stop practicing when frustrated — take a break and return later.',
          ],
        },
        keyTakeaways: [
          { title: 'Structure Matters', detail: 'Random practice leads to random results.' },
          { title: 'Focus on Weaknesses', detail: 'Growth happens when you tackle difficult things.' },
        ],
      },
    ],
  };
}
