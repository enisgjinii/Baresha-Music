import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

// Store for managing theme preference
export const useThemeStore = create<ThemeState>((set) => ({
  // Default to system preference
  preference: 'system',
  setPreference: (preference) => set({ preference }),
})); 