

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, getAuth } from 'firebase/auth';

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDxvsbs8LUFP_lo4rdEIQy59BcNeeXcPtg',
  authDomain: 'ocean-preventions.firebaseapp.com',
  projectId: 'ocean-preventions',
  storageBucket: 'ocean-preventions.firebasestorage.app',
  messagingSenderId: '298705653505',
  appId: '1:298705653505:android:530b530e4f867c16e21500',
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

export const firebaseAuth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: inMemoryPersistence,
    });
  } catch {

    return getAuth(firebaseApp);
  }
})();
