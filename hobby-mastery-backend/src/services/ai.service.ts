/**
 * Response shape expected from the LLM for each technique.
 * The AI generates full lesson content instead of search terms,
 * so the mobile app never needs to open external URLs.
 */
interface AITechniqueResponse {
  name: string;
  description: string;
  category: string;
  estimatedMinutes: number;
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

const MODELS = [
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'mixtral-8x7b-32768'
];

const callLlm = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  for (const model of MODELS) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
        }
      );

      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      continue;
    }
  }

  throw new Error('LLM services unavailable');
};

export const generateLearningPlan = async (hobby: string, level: string, skippedTechniques: string[] = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getMockPlan(hobby, level);
  }

  const skipContext = skippedTechniques.length > 0
    ? `I previously found these techniques too hard and skipped them: ${skippedTechniques.join(', ')}. Please adapt the plan and suggest easier prerequisites or alternative fundamental techniques.`
    : `I don't want to be overwhelmed.`;

  const prompt = `
    I want to learn ${hobby} at a ${level} level. ${skipContext}
    Generate a curated list of 5-8 essential techniques I need to master.

    IMPORTANT: For each technique, generate FULL lesson content that can be displayed
    directly in a mobile app. Do NOT provide YouTube links, Google searches, or any
    external URLs. The user will read and learn entirely within the app.

    Return strictly as a JSON object with a single key "techniques" containing an array.
    Each object must have:
    - "name" (string): technique name
    - "description" (string): why this technique matters, 2-3 sentences
    - "category" (string): short tag like "Basics", "Rhythm", "Technique", "Theory"
    - "estimatedMinutes" (number): realistic practice time
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
  `;

  try {
    const textContent = await callLlm(prompt);
    let parsedData: { techniques?: AITechniqueResponse[] } = {};

    try {
      parsedData = JSON.parse(textContent);
    } catch (e) {
      const cleanedText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    }

    const parsedTechniques = parsedData.techniques || [];

    const techniques = parsedTechniques.map((tech: AITechniqueResponse, index: number) => ({
      id: `tech-${index}-${Date.now()}`,
      name: tech.name,
      description: tech.description,
      category: tech.category || 'Fundamentals',
      estimatedMinutes: tech.estimatedMinutes || 15,
      level: level,
      status: 'not-started',
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
          durationMinutes: tech.estimatedMinutes || 15,
          goal: `Complete one full practice session.`,
        },
        proTips: tech.lesson?.proTips || [],
      },
      keyTakeaways: tech.keyTakeaways || [],
    }));

    return {
      hobby,
      targetLevel: level,
      createdAt: Date.now(),
      streakCount: 0,
      techniques
    };
  } catch (error) {
    console.error('Plan generation failed:', error);
    return getMockPlan(hobby, level);
  }
};

const getMockPlan = (hobby: string, level: string) => {
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
      }
    ]
  };
};
