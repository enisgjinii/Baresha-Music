import { OpenSubtitlesService } from '@/services/OpenSubtitlesService';
import { useCallback, useState } from 'react';

interface SongSearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: string;
  duration?: string;
  cover?: string;
}

export function useSongSearch() {
  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSongs = useCallback(async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = OpenSubtitlesService.getInstance();
      const searchResults = await service.searchSongs(query, limit);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching songs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchSongs,
  };
} 