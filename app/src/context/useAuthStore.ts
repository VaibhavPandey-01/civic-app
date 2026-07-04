import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const SECURE_STORE_TOKEN_KEY = 'op_auth_token';
const SECURE_STORE_USER_KEY = 'op_auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: async (user: User, token: string) => {
    set({ isLoading: true });
    try {
      await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token);
      await SecureStore.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Error saving auth session:', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_STORE_USER_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Error clearing auth session:', error);
      set({ isLoading: false });
    }
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(SECURE_STORE_USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error hydrating auth session:', error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
