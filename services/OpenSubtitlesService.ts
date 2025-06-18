import { Config } from '@/constants/Config';

interface SongSearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: string;
  duration?: string;
  cover?: string;
}

export class OpenSubtitlesService {
  private static instance: OpenSubtitlesService;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  private constructor() {
    this.baseUrl = Config.OPENSUBTITLES.BASE_URL;
    this.apiKey = Config.OPENSUBTITLES.API_KEY;
  }

  public static getInstance(): OpenSubtitlesService {
    if (!OpenSubtitlesService.instance) {
      OpenSubtitlesService.instance = new OpenSubtitlesService();
    }
    return OpenSubtitlesService.instance;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/${this.apiKey}/${endpoint}?${queryString}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from OpenSubtitles:', error);
      throw error;
    }
  }

  public async searchSongs(query: string, limit: number = 10): Promise<SongSearchResult[]> {
    try {
      const results = await this.fetch<any>('search/song', {
        query,
        limit: limit.toString(),
      });

      // Transform the results to match our SongSearchResult interface
      return results.map((result: any) => ({
        id: result.id || result.hash,
        title: result.title,
        artist: result.artist || 'Unknown Artist',
        album: result.album,
        year: result.year,
        duration: result.duration,
        cover: result.cover,
      }));
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }
} 