import { Audio } from 'expo-av';
import { create } from 'zustand';

interface LocalTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  artwork?: string;
}

interface PlayerState {
  sound: Audio.Sound | null;
  currentTrack: LocalTrack | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  setSound: (sound: Audio.Sound | null) => void;
  setCurrentTrack: (track: LocalTrack | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setDuration: (duration: number) => void;
  setPosition: (position: number) => void;
  setIsShuffle: (isShuffle: boolean) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  reset: () => void;
}

const initialState = {
  sound: null,
  currentTrack: null,
  isPlaying: false,
  duration: 0,
  position: 0,
  isShuffle: false,
  repeatMode: 'off' as const,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,
  setSound: (sound) => set({ sound }),
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setDuration: (duration) => set({ duration }),
  setPosition: (position) => set({ position }),
  setIsShuffle: (isShuffle) => set({ isShuffle }),
  setRepeatMode: (repeatMode) => set({ repeatMode }),
  reset: () => set(initialState),
})); 