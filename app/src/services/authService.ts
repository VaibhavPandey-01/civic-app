

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth, FIREBASE_CONFIG } from '../config/firebaseConfig';
import { useAuthStore } from '../context/useAuthStore';
import { User } from '../types/user.types';
import api, { USE_MOCK } from './api';

function firebaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    switch ((err as { code: string }).code) {
      case 'auth/invalid-verification-code':
        return 'Incorrect OTP. Please check and try again.';
      case 'auth/code-expired':
        return 'OTP has expired. Please request a new one.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'auth/invalid-phone-number':
        return 'The phone number format is invalid.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        break;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred. Please try again.';
}

// 1. register with firebase emailpassword

export const registerWithEmail = async (email: string, password: string): Promise<string> => {
  if (USE_MOCK) {
    return 'mock-id-token';
  }
  try {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await credential.user.getIdToken();
    return idToken;
  } catch (err) {
    throw new Error(firebaseErrorMessage(err));
  }
};

// 2. login with firebase emailpassword

export const loginWithEmail = async (email: string, password: string): Promise<string> => {
  if (USE_MOCK) {
    return 'mock-id-token';
  }
  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await credential.user.getIdToken();
    return idToken;
  } catch (err) {
    throw new Error(firebaseErrorMessage(err));
  }
};

interface RegisterProfile {
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'admin';
  inviteCode?: string;
}

import * as SecureStore from 'expo-secure-store';

const MOCK_USERS_KEY = 'op_mock_users';

const getMockUsers = async (): Promise<User[]> => {
  try {
    const raw = await SecureStore.getItemAsync(MOCK_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

const saveMockUser = async (user: User) => {
  const users = await getMockUsers();
  const index = users.findIndex(u => u.email?.toLowerCase() === user.email?.toLowerCase());
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await SecureStore.setItemAsync(MOCK_USERS_KEY, JSON.stringify(users));
};

export const registerWithBackend = async (
  idToken: string,
  profile: RegisterProfile
): Promise<void> => {
  if (USE_MOCK) {
    const user: User = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      name: profile.name || 'Citizen User',
      phone: profile.phone || '9999999999',
      email: profile.email || 'mock@civicsafe.com',
      role: profile.role || 'citizen',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
    };
    await saveMockUser(user);
    const token = 'mock-token';
    await useAuthStore.getState().setSession(user, token);
    return;
  }
  try {
    const res = await api.post('/auth/register', {
      idToken,
      name: profile.name,
      phone: profile.phone,
      email: profile.email || undefined,
      role: profile.role,
      inviteCode: profile.inviteCode || undefined,
    });
    const data = res.data.data as any;
    const user = { ...data.user, id: data.user.id || data.user._id } as User;
    const token = data.token as string;
    await useAuthStore.getState().setSession(user, token);
  } catch (err: unknown) {

    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? firebaseErrorMessage(err);
    throw new Error(message);
  }
};

export const loginWithBackend = async (
  idToken: string,
  email?: string,
  role?: 'citizen' | 'admin'
): Promise<void> => {
  if (USE_MOCK) {
    const users = await getMockUsers();
    let user = email ? users.find(u => u.email?.toLowerCase() === email.toLowerCase()) : null;
    if (!user) {
      const derivedName = email ? email.split('@')[0] : 'Citizen';
      const capitalizedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      const isMockAdmin = email ? email.toLowerCase().includes('admin') : false;
      user = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        name: capitalizedName,
        phone: '9999999999',
        email: email || 'mock@civicsafe.com',
        role: isMockAdmin ? 'admin' : (role || 'citizen'),
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
      };
      await saveMockUser(user);
    }
    const token = 'mock-token';
    await useAuthStore.getState().setSession(user, token);
    return;
  }
  try {
    const res = await api.post('/auth/login', { idToken });
    const data = res.data.data as any;
    const user = { ...data.user, id: data.user.id || data.user._id } as User;
    if (user && role && user.role !== role) {
      throw new Error(`This account is registered as ${user.role}, not ${role}.`);
    }
    const token = data.token as string;
    await useAuthStore.getState().setSession(user, token);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('registered as')) {
      throw err;
    }
    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? firebaseErrorMessage(err);
    throw new Error(message);
  }
};

// 5. logout

export const logout = async (): Promise<void> => {
  try {
    await signOut(firebaseAuth);
  } catch {

  }
  await useAuthStore.getState().logout();
};
