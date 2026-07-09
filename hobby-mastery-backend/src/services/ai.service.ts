interface AITechniqueResponse {
  name: string;
  description: string;
  videoSearchTerm: string;
  articleSearchTerm: string;
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

export const generateLearningPlan = async (hobby: string, level: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getMockPlan(hobby, level);
  }

  const prompt = `
    I want to learn ${hobby} at a ${level} level. 
    I don't want to be overwhelmed. Generate a curated list of 5-8 essential techniques I need to master to reach this level.
    Return the response strictly as a JSON object with a single key "techniques" containing an array of objects. 
    Each object in the array must have the following fields: 
    - "name" (string)
    - "description" (string, explaining why it's important)
    - "videoSearchTerm" (string, the best YouTube search query to learn this)
    - "articleSearchTerm" (string, the best Google search query for reading material on this)
    Do not include markdown blocks or any other text, just the raw JSON object.
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
      level: level,
      status: 'not-started',
      resources: [
        {
          id: `res-${index}-vid`,
          title: `Watch: ${tech.name} Tutorial`,
          type: 'video',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(tech.videoSearchTerm || hobby + ' ' + tech.name)}`
        },
        {
          id: `res-${index}-art`,
          title: `Read: ${tech.name} Guide`,
          type: 'article',
          url: `https://www.google.com/search?q=${encodeURIComponent(tech.articleSearchTerm || hobby + ' ' + tech.name + ' tutorial')}`
        }
      ]
    }));

    return {
      hobby,
      targetLevel: level,
      createdAt: Date.now(),
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
      }
    ]
  };
};
