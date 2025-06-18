import AsyncStorage from '@react-native-async-storage/async-storage';

interface Playlist {
  id: string;
  name: string;
  tracks: any[];
}

interface Settings {
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  playbackSpeed: number;
  sleepTimerMinutes: number;
  isHighQuality: boolean;
  isOfflineMode: boolean;
  isAutoPlay: boolean;
  isCrossfade: boolean;
}

export class StorageService {
  private static instance: StorageService;
  private readonly FAVORITES_KEY = '@favorites';
  private readonly PLAYLISTS_KEY = '@playlists';
  private readonly SETTINGS_KEY = '@settings';

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Favorites
  async getFavorites(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem(this.FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async saveFavorites(favorites: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    try {
      const playlists = await AsyncStorage.getItem(this.PLAYLISTS_KEY);
      return playlists ? JSON.parse(playlists) : [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  }

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  // Settings
  async getSettings(): Promise<Settings> {
    try {
      const settings = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        isShuffle: false,
        repeatMode: 'off',
        playbackSpeed: 1.0,
        sleepTimerMinutes: 5,
        isHighQuality: true,
        isOfflineMode: false,
        isAutoPlay: true,
        isCrossfade: false
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        isShuffle: false,
        repeatMode: 'off',
        playbackSpeed: 1.0,
        sleepTimerMinutes: 5,
        isHighQuality: true,
        isOfflineMode: false,
        isAutoPlay: true,
        isCrossfade: false
      };
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
} 