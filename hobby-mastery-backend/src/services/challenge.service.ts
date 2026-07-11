import { DailyChallenge, ChallengeType } from '../types';
import { callLlm, parseLlmJson } from './llm.client';
import { buildChallengePrompt } from '../prompts/plan.prompt';
import config from '../config/environment';

interface LlmChallengeResponse {
  type: ChallengeType;
  title: string;
  description: string;
  content: string;
  options?: { text: string; isCorrect: boolean }[];
  durationMinutes: number;
  xpReward: number;
}

export async function generateDailyChallenge(
  hobby: string,
  currentLevel: string = 'beginner',
  completedCount: number = 0,
): Promise<DailyChallenge> {
  if (!config.groqApiKey) {
    return buildMockChallenge(hobby);
  }

  const prompt = buildChallengePrompt(hobby, currentLevel, completedCount);

  try {
    const raw = await callLlm(prompt);
    const parsed = parseLlmJson<LlmChallengeResponse>(raw);

    return {
      id: `challenge-${Date.now()}`,
      hobby,
      type: parsed.type || 'reflection',
      title: parsed.title,
      description: parsed.description,
      content: parsed.content,
      options: parsed.options,
      durationMinutes: parsed.durationMinutes || 3,
      xpReward: parsed.xpReward || 20,
      generatedAt: Date.now(),
    };
  } catch (error) {
    console.error('Challenge generation failed, using mock:', error);
    return buildMockChallenge(hobby);
  }
}

function buildMockChallenge(hobby: string): DailyChallenge {
  const types: ChallengeType[] = ['quiz', 'timed-drill', 'creative-prompt', 'reflection'];
  const type = types[Math.floor(Math.random() * types.length)];

  const challenges: Record<ChallengeType, Omit<DailyChallenge, 'id' | 'hobby' | 'generatedAt'>> = {
    'quiz': {
      type: 'quiz',
      title: 'Quick Knowledge Check',
      description: `Test your understanding of ${hobby} fundamentals.`,
      content: `Which of the following is the most important factor for improving at ${hobby}?`,
      options: [
        { text: 'Practicing for long hours once a week', isCorrect: false },
        { text: 'Consistent daily practice with focused goals', isCorrect: true },
        { text: 'Buying expensive equipment first', isCorrect: false },
        { text: 'Only watching tutorials without practicing', isCorrect: false },
      ],
      durationMinutes: 2,
      xpReward: 15,
    },
    'timed-drill': {
      type: 'timed-drill',
      title: 'Speed Drill',
      description: 'A quick focused exercise to sharpen your skills.',
      content: `Set a 3-minute timer. Practice the most basic movement or technique in ${hobby} as slowly and precisely as possible. Focus entirely on form — not speed. Count how many perfect repetitions you can complete.`,
      durationMinutes: 3,
      xpReward: 25,
    },
    'creative-prompt': {
      type: 'creative-prompt',
      title: 'Creative Expression',
      description: 'Apply your skills in a creative way.',
      content: `Take something you have learned in ${hobby} and combine it with a completely different idea. For example, apply a technique from ${hobby} to solve a problem in your daily life, or explain a ${hobby} concept using a food metaphor. Write down or practice your creative fusion.`,
      durationMinutes: 5,
      xpReward: 30,
    },
    'reflection': {
      type: 'reflection',
      title: 'Learning Reflection',
      description: 'Take a moment to think about your progress.',
      content: `Think about the last technique you practiced in ${hobby}. What was the hardest part? What surprised you? If you could give one piece of advice to yourself from a week ago, what would it be? Write down your thoughts in 2-3 sentences.`,
      durationMinutes: 3,
      xpReward: 20,
    },
  };

  return {
    id: `challenge-${Date.now()}`,
    hobby,
    generatedAt: Date.now(),
    ...challenges[type],
  };
}
