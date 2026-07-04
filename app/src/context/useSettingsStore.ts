import { create } from 'zustand';

interface SettingsState {
  pushEnabled: boolean;
  language: 'en' | 'hi';
  togglePush: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pushEnabled: true,
  language: 'en',
  togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
  setLanguage: (lang) => set({ language: lang }),
}));
