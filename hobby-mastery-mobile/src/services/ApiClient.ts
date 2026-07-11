import { LearningPlan, SkillLevel, DailyChallenge } from '../types';

const BACKEND_URL = 'https://super-rrfr.onrender.com';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Unknown error');
    throw new Error(`API ${response.status}: ${message}`);
  }

  return response.json();
}

export const ApiClient = {
  async generatePlan(hobby: string, level: SkillLevel, skippedTechniques: string[] = []): Promise<LearningPlan> {
    return request<LearningPlan>('/api/plan', {
      method: 'POST',
      body: JSON.stringify({ hobby, level, skippedTechniques }),
    });
  },

  async getDailyChallenge(hobby: string, level: SkillLevel = 'beginner', completedCount: number = 0): Promise<DailyChallenge> {
    const params = new URLSearchParams({ level, completed: String(completedCount) });
    return request<DailyChallenge>(`/api/challenge/${encodeURIComponent(hobby)}?${params}`);
  },
};
