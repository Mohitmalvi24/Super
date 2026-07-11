export function buildPlanPrompt(hobby: string, level: string, skippedTechniques: string[]): string {
  const skipContext = skippedTechniques.length > 0
    ? `I previously found these techniques too hard and skipped them: ${skippedTechniques.join(', ')}. Adapt the plan with easier prerequisites or alternative fundamentals.`
    : '';

  return `
I want to learn ${hobby} at a ${level} level. ${skipContext}

Generate a curated list of 5-8 essential techniques/concepts I need to master.

IMPORTANT: For each technique, generate FULL lesson content that can be displayed
directly in a mobile app. Do NOT provide YouTube links, Google searches, or any
external URLs. The user will read and learn entirely within the app.

Return strictly as a JSON object with a single key "techniques" containing an array.
Each object must have:
- "name" (string): technique/concept name (short, 1-3 words)
- "description" (string): why this technique matters, 2-3 sentences
- "category" (string): short tag like "Basics", "Rhythm", "Technique", "Theory", "Strategy", "Fundamentals"
- "emoji" (string): a single emoji that best represents this technique visually (e.g. "♟️" for chess openings, "🎸" for guitar strumming, "🧘" for yoga poses)
- "estimatedMinutes" (number): realistic practice time (2-5 range)
- "level" (string): "Beginner", "Intermediate", or "Advanced"
- "visualDescription" (string): a SHORT 1-sentence description of what the technique looks like when performed (used as visual placeholder in the app, e.g. "A knight piece leaps over pawns to attack two pieces simultaneously" or "Fingers press down on the fretboard while the other hand strums downward")
- "lesson" (object) containing:
  - "overview" (string): a 2-3 sentence introduction to this lesson
  - "steps" (array of objects): 3-5 step-by-step instructions, each with:
    - "order" (number)
    - "title" (string): short step heading
    - "body" (string): 2-4 sentences explaining what to do
  - "exercise" (object): a concrete practice drill with:
    - "title" (string)
    - "instruction" (string): what exactly to practice, 3-4 sentences
    - "durationMinutes" (number)
    - "goal" (string): measurable success criteria
  - "proTips" (array of strings): 2-3 expert tips
- "keyTakeaways" (array of objects): 2-3 items with "title" and "detail" strings

Do not include markdown, code fences, or any text outside the JSON.
`.trim();
}

export function buildChallengePrompt(hobby: string, currentLevel: string, completedCount: number): string {
  const difficultyHint = completedCount > 10
    ? 'Make it moderately challenging — the user has been practicing regularly.'
    : 'Keep it approachable for someone building daily habits.';

  return `
Generate a single daily challenge for someone learning ${hobby} at the ${currentLevel} level.
They have completed ${completedCount} challenges so far. ${difficultyHint}

Pick ONE of these challenge types at random:
1. "quiz" — A knowledge question with 4 options (only 1 correct)
2. "timed-drill" — A short focused practice exercise (2-5 minutes)
3. "creative-prompt" — An open-ended creative task related to the hobby
4. "reflection" — A thoughtful question about their learning journey

Return strictly as a JSON object with these fields:
- "type" (string): one of "quiz", "timed-drill", "creative-prompt", "reflection"
- "title" (string): short engaging title (3-6 words)
- "description" (string): 1-2 sentence description of the challenge
- "content" (string): the main challenge text. For quiz, this is the question.
  For timed-drill, the exercise instructions. For creative-prompt, the prompt.
  For reflection, the reflection question.
- "emoji" (string): a single emoji representing this challenge (e.g. "🎯", "⏱️", "🎨", "💭")
- "visualHint" (string): a SHORT 1-sentence visual description of what the challenge involves
- "options" (array, only for quiz): 4 objects with "text" (string) and "isCorrect" (boolean)
- "durationMinutes" (number): estimated time (1-5 minutes)
- "xpReward" (number): between 10-50 based on difficulty

Do not include markdown, code fences, or any text outside the JSON.
`.trim();
}
