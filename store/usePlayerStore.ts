import { Audio } from 'expo-av';
import { create } from 'zustand';

interface LocalTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  artwork?: string;
  playCount?: number;
  dateAdded?: number;
  genre?: string;
  album?: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: LocalTrack[];
}

interface SmartPlaylist extends Playlist {
  type: 'most-played' | 'recently-added' | 'favorites' | 'custom';
  criteria?: {
    minPlayCount?: number;
    addedAfter?: Date;
    genres?: string[];
  };
}

interface AudioEffect {
  name: string;
  settings: {
    bass: number;
    mid: number;
    treble: number;
    reverb: number;
    preamp: number;
  };
}

interface PlayerState {
  tracks: LocalTrack[];
  currentTrack: LocalTrack | null;
  sound: Audio.Sound | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  error: string | null;
  isShuffle: boolean;
  shuffledTracks: LocalTrack[];
  repeatMode: 'off' | 'one' | 'all';
  playlists: Playlist[];
  favorites: string[];
  equalizerSettings: AudioEffect['settings'];
  playbackSpeed: number;
  pitchCorrection: boolean;
  crossfadeDuration: number;
  sleepTimerId: NodeJS.Timeout | null;
  sleepTimerMinutes: number;
  sleepTimerActive: boolean;
  sortBy: 'title' | 'artist' | 'duration';
  searchQuery: string;
  selectedTrack: LocalTrack | null;
  showSortMenu: boolean;
  showPlaylistDialog: boolean;
  showEqualizer: boolean;
  showSleepTimer: boolean;
  showQueue: boolean;
  showCrossfadeDialog: boolean;
  showPlaybackSpeed: boolean;
  showTrackDetails: boolean;
  showTagEditor: boolean;
  showLyrics: boolean;
  lyrics: string;
  editingTrack: LocalTrack | null;
  audioEffectPresets: AudioEffect[];
  selectedPreset: string | null;
  smartPlaylists: SmartPlaylist[];
  queueTracks: LocalTrack[];
  viewMode: 'list' | 'grid';
  groupBy: 'none' | 'artist' | 'album';

  // Actions
  setTracks: (tracks: LocalTrack[]) => void;
  setCurrentTrack: (track: LocalTrack | null) => void;
  setSound: (sound: Audio.Sound | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setError: (error: string | null) => void;
  setIsShuffle: (isShuffle: boolean) => void;
  setShuffledTracks: (tracks: LocalTrack[]) => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setFavorites: (favorites: string[]) => void;
  setEqualizerSettings: (settings: AudioEffect['settings']) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPitchCorrection: (enabled: boolean) => void;
  setCrossfadeDuration: (duration: number) => void;
  setSleepTimerId: (timerId: NodeJS.Timeout | null) => void;
  setSleepTimerMinutes: (minutes: number) => void;
  setSleepTimerActive: (active: boolean) => void;
  setSortBy: (sortBy: 'title' | 'artist' | 'duration') => void;
  setSearchQuery: (query: string) => void;
  setSelectedTrack: (track: LocalTrack | null) => void;
  setShowSortMenu: (show: boolean) => void;
  setShowPlaylistDialog: (show: boolean) => void;
  setShowEqualizer: (show: boolean) => void;
  setShowSleepTimer: (show: boolean) => void;
  setShowQueue: (show: boolean) => void;
  setShowCrossfadeDialog: (show: boolean) => void;
  setShowPlaybackSpeed: (show: boolean) => void;
  setShowTrackDetails: (show: boolean) => void;
  setShowTagEditor: (show: boolean) => void;
  setShowLyrics: (show: boolean) => void;
  setLyrics: (lyrics: string) => void;
  setEditingTrack: (track: LocalTrack | null) => void;
  setAudioEffectPresets: (presets: AudioEffect[]) => void;
  setSelectedPreset: (preset: string | null) => void;
  setSmartPlaylists: (playlists: SmartPlaylist[]) => void;
  setQueueTracks: (tracks: LocalTrack[]) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setGroupBy: (groupBy: 'none' | 'artist' | 'album') => void;

  // Helper functions
  reset: () => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  updatePlayCount: (trackId: string) => void;
  updateSmartPlaylists: () => void;
  applyAudioEffect: (preset: AudioEffect) => Promise<void>;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  currentTrack: null,
  sound: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  error: null,
  isShuffle: false,
  shuffledTracks: [],
  repeatMode: 'off',
  playlists: [],
  favorites: [],
  equalizerSettings: {
    bass: 50,
    mid: 50,
    treble: 50,
    reverb: 0,
    preamp: 100,
  },
  playbackSpeed: 1,
  pitchCorrection: true,
  crossfadeDuration: 0,
  sleepTimerId: null,
  sleepTimerMinutes: 30,
  sleepTimerActive: false,
  sortBy: 'title',
  searchQuery: '',
  selectedTrack: null,
  showSortMenu: false,
  showPlaylistDialog: false,
  showEqualizer: false,
  showSleepTimer: false,
  showQueue: false,
  showCrossfadeDialog: false,
  showPlaybackSpeed: false,
  showTrackDetails: false,
  showTagEditor: false,
  showLyrics: false,
  lyrics: '',
  editingTrack: null,
  audioEffectPresets: [
    {
      name: 'Bass Boost',
      settings: { bass: 80, mid: 50, treble: 40, reverb: 20, preamp: 60 },
    },
    {
      name: 'Vocal Boost',
      settings: { bass: 40, mid: 75, treble: 65, reverb: 30, preamp: 55 },
    },
    {
      name: 'Rock',
      settings: { bass: 60, mid: 45, treble: 75, reverb: 15, preamp: 65 },
    },
    {
      name: 'Classical',
      settings: { bass: 45, mid: 60, treble: 70, reverb: 40, preamp: 50 },
    },
  ],
  selectedPreset: null,
  smartPlaylists: [],
  queueTracks: [],
  viewMode: 'list',
  groupBy: 'none',

  // Actions
  setTracks: (tracks) => set({ tracks }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setSound: (sound) => set({ sound }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setError: (error) => set({ error }),
  setIsShuffle: (isShuffle) => set({ isShuffle }),
  setShuffledTracks: (tracks) => set({ shuffledTracks: tracks }),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  setPlaylists: (playlists) => set({ playlists }),
  setFavorites: (favorites) => set({ favorites }),
  setEqualizerSettings: (settings) => set({ equalizerSettings: settings }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPitchCorrection: (enabled) => set({ pitchCorrection: enabled }),
  setCrossfadeDuration: (duration) => set({ crossfadeDuration: duration }),
  setSleepTimerId: (timerId) => set({ sleepTimerId: timerId }),
  setSleepTimerMinutes: (minutes) => set({ sleepTimerMinutes: minutes }),
  setSleepTimerActive: (active) => set({ sleepTimerActive: active }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  setShowSortMenu: (show) => set({ showSortMenu: show }),
  setShowPlaylistDialog: (show) => set({ showPlaylistDialog: show }),
  setShowEqualizer: (show) => set({ showEqualizer: show }),
  setShowSleepTimer: (show) => set({ showSleepTimer: show }),
  setShowQueue: (show) => set({ showQueue: show }),
  setShowCrossfadeDialog: (show) => set({ showCrossfadeDialog: show }),
  setShowPlaybackSpeed: (show) => set({ showPlaybackSpeed: show }),
  setShowTrackDetails: (show) => set({ showTrackDetails: show }),
  setShowTagEditor: (show) => set({ showTagEditor: show }),
  setShowLyrics: (show) => set({ showLyrics: show }),
  setLyrics: (lyrics) => set({ lyrics }),
  setEditingTrack: (track) => set({ editingTrack: track }),
  setAudioEffectPresets: (presets) => set({ audioEffectPresets: presets }),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  setSmartPlaylists: (playlists) => set({ smartPlaylists: playlists }),
  setQueueTracks: (tracks) => set({ queueTracks: tracks }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setGroupBy: (groupBy) => set({ groupBy: groupBy }),

  // Helper functions
  reset: () =>
    set({
      currentTrack: null,
      sound: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      error: null,
    }),

  toggleFavorite: (trackId) =>
    set((state) => ({
      favorites: state.favorites.includes(trackId)
        ? state.favorites.filter((id) => id !== trackId)
        : [...state.favorites, trackId],
    })),

  isFavorite: (trackId) => get().favorites.includes(trackId),

  updatePlayCount: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, playCount: (track.playCount || 0) + 1 }
          : track
      ),
    })),

  updateSmartPlaylists: () => {
    const { tracks, favorites } = get();

    const mostPlayed = {
      id: 'most-played',
      name: 'Most Played',
      type: 'most-played' as const,
      tracks: tracks
        .filter((t) => (t.playCount || 0) > 5)
        .sort((a, b) => ((b.playCount || 0) - (a.playCount || 0))),
    };

    const recentlyAdded = {
      id: 'recently-added',
      name: 'Recently Added',
      type: 'recently-added' as const,
      tracks: [...tracks]
        .sort((a, b) => ((b.dateAdded || 0) - (a.dateAdded || 0)))
        .slice(0, 50),
    };

    const favoritesPlaylist = {
      id: 'favorites',
      name: 'Favorites',
      type: 'favorites' as const,
      tracks: tracks.filter((t) => favorites.includes(t.id)),
    };

    set({ smartPlaylists: [mostPlayed, recentlyAdded, favoritesPlaylist] });
  },

  applyAudioEffect: async (preset) => {
    const { sound } = get();
    if (!sound) return;

    set({
      selectedPreset: preset.name,
      equalizerSettings: preset.settings,
    });

    try {
      await sound.setVolumeAsync(preset.settings.preamp / 100);
      // Additional audio effect applications would go here
      // Note: Expo AV doesn't support full equalizer control
      // You'd need native modules for more advanced audio effects
    } catch (error) {
      console.error('Error applying audio effect:', error);
    }
  },

  reorderQueue: (fromIndex, toIndex) => {
    set((state) => {
      const newQueue = [...state.queueTracks];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      return { queueTracks: newQueue };
    });
  },
})); 