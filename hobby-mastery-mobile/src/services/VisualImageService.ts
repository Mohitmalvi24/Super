import Constants from 'expo-constants';

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=600';

const cache = new Map<string, string>();

const getPexelsApiKey = (): string | null => {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return process.env.EXPO_PUBLIC_PEXELS_API_KEY || extra?.pexelsApiKey || null;
};

const normalize = (value: string): string => value.trim().toLowerCase();

const buildSearchQuery = (hobby: string, topic: string): string => {
  const normalizedHobby = normalize(hobby);
  const normalizedTopic = normalize(topic);

  if (normalizedHobby.includes('chess')) {
    if (normalizedTopic.includes('fork')) return 'chess knight fork tactic board';
    if (normalizedTopic.includes('pin')) return 'chess pin tactic board';
    if (normalizedTopic.includes('skewer')) return 'chess skewer tactic board';
    if (normalizedTopic.includes('checkmate')) return 'chess checkmate pattern board';
  }

  return `${hobby} ${topic}`.trim();
};

export const VisualImageService = {
  async getTechniqueImage(hobby: string, topic: string): Promise<string | null> {
    const cacheKey = `${normalize(hobby)}:${normalize(topic)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const fallback = FALLBACK_IMAGE;
    const apiKey = getPexelsApiKey();

    if (!apiKey) {
      cache.set(cacheKey, fallback);
      return fallback;
    }

    try {
      const params = new URLSearchParams({
        query: buildSearchQuery(hobby, topic),
        per_page: '1',
        orientation: 'square',
      });

      const response = await fetch(`${PEXELS_SEARCH_URL}?${params.toString()}`, {
        headers: { Authorization: apiKey },
      });

      if (!response.ok) throw new Error(`Pexels ${response.status}`);

      const data = await response.json();
      const imageUri = data?.photos?.[0]?.src?.medium || fallback;
      cache.set(cacheKey, imageUri);
      return imageUri;
    } catch {
      cache.set(cacheKey, fallback);
      return fallback;
    }
  },
};
