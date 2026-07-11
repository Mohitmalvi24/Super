const normalize = (value: string): string => value.trim().toLowerCase();

const buildPrompt = (hobby: string, topic: string): string => {
  const normalizedHobby = normalize(hobby);
  const normalizedTopic = normalize(topic);

  // We want a beautiful, app-friendly illustration or 3D render, not overly realistic or messy photos
  return `A highly detailed, beautiful, premium, clean illustration of ${normalizedTopic} in the context of ${normalizedHobby}. Professional app UI asset style, vibrant colors, clear subject, no text.`;
};

const buildImageUrl = (prompt: string, seed: number, width: number, height: number): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&private=true`;
};

export const VisualImageService = {
  getTechniqueImageUrl(hobby: string, topic: string, width = 240, height = 240): string {
    const prompt = buildPrompt(hobby, topic);
    const seed = topic.length * hobby.length;
    return buildImageUrl(prompt, seed, width, height);
  },

  async getTechniqueImage(hobby: string, topic: string): Promise<string | null> {
    try {
      return VisualImageService.getTechniqueImageUrl(hobby, topic);
    } catch (error) {
      console.warn('Pollinations AI failed', error);
      return null;
    }
  },
};
