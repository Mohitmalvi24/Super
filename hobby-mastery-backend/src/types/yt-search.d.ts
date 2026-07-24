declare module 'yt-search' {
  interface VideoResult {
    videoId: string;
    title: string;
    thumbnail: string;
    seconds: number;
    timestamp: string;
    views: number;
    url: string;
    author: { name: string };
  }

  interface SearchResult {
    videos: VideoResult[];
  }

  function yts(query: string): Promise<SearchResult>;
  export = yts;
}
