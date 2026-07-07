import { create } from 'zustand';

interface SettingsState {
  pushEnabled: boolean;
  language: 'en' | 'hi';
  tabBarVisible: boolean;
  togglePush: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setTabBarVisible: (visible: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pushEnabled: true,
  language: 'en',
  tabBarVisible: true,
  togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
  setLanguage: (lang) => set({ language: lang }),
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
}));
