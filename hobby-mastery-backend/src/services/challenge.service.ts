import { DailyChallenge, ChallengeType } from '../types';
import { callLlm, parseLlmJson } from './llm.client';
import { buildChallengePrompt } from '../prompts/plan.prompt';
import config from '../config/environment';

interface LlmChallengeResponse {
  type: ChallengeType;
  title: string;
  description: string;
  content: string;
  emoji?: string;
  visualHint?: string;
  options?: { text: string; isCorrect: boolean }[];
  durationMinutes: number;
  xpReward: number;
}

export async function generateDailyChallenge(
  hobby: string,
  currentLevel: string = 'beginner',
  completedCount: number = 0,
): Promise<DailyChallenge> {
  if (isChessHobby(hobby)) {
    return buildChessChallenge(hobby);
  }

  if (isFootballHobby(hobby)) {
    return buildFootballChallenge(hobby);
  }

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
      emoji: parsed.emoji || '🎯',
      visualHint: parsed.visualHint || parsed.description,
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
      emoji: '❓',
      visualHint: `A learner pondering a question about ${hobby} fundamentals`,
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
      content: `Set a 3-minute timer. Practice the most basic movement or technique in ${hobby} as slowly and precisely as possible. Focus entirely on form — not speed.`,
      emoji: '⏱️',
      visualHint: `A focused practitioner performing a precision drill in ${hobby}`,
      durationMinutes: 3,
      xpReward: 25,
    },
    'creative-prompt': {
      type: 'creative-prompt',
      title: 'Creative Expression',
      description: 'Apply your skills in a creative way.',
      content: `Take something you have learned in ${hobby} and combine it with a completely different idea. Write down or practice your creative fusion.`,
      emoji: '🎨',
      visualHint: `A creative interpretation of ${hobby} concepts applied in a new way`,
      durationMinutes: 5,
      xpReward: 30,
    },
    'reflection': {
      type: 'reflection',
      title: 'Learning Reflection',
      description: 'Take a moment to think about your progress.',
      content: `Think about the last technique you practiced in ${hobby}. What was the hardest part? What surprised you? Write down your thoughts.`,
      emoji: '💭',
      visualHint: `A thoughtful moment of self-reflection on the ${hobby} learning journey`,
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

function isChessHobby(hobby: string): boolean {
  return hobby.trim().toLowerCase().includes('chess');
}

function isFootballHobby(hobby: string): boolean {
  const normalized = hobby.trim().toLowerCase();
  return normalized.includes('football') || normalized.includes('soccer');
}

function buildChessChallenge(hobby: string): DailyChallenge {
  return {
    id: `challenge-${Date.now()}`,
    hobby,
    type: 'reflection',
    title: 'Think Like a Tactician',
    description: 'Review the patterns that decide real games.',
    content: 'Look at your last position and name one fork, pin, or skewer you could have searched for. Which piece was the most vulnerable target?',
    emoji: '♟️',
    visualHint: 'A chessboard moment where a tactical idea is being evaluated',
    durationMinutes: 3,
    xpReward: 20,
    generatedAt: Date.now(),
  };
}

function buildFootballChallenge(hobby: string): DailyChallenge {
  return {
    id: `challenge-${Date.now()}`,
    hobby,
    type: 'timed-drill',
    title: 'First-Touch Drill',
    description: 'Control each pass into space before playing the next ball.',
    content: 'Use a wall or partner. Pass, receive with one touch into space, then pass again. Alternate feet and keep the ball close enough to play quickly.',
    emoji: '⚽',
    visualHint: 'A football player receiving the ball and guiding it into space',
    durationMinutes: 3,
    xpReward: 25,
    generatedAt: Date.now(),
  };
}
