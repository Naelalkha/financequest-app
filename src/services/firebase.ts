// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, disableNetwork } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcgZin9_iq1iEqTr61rvxLaWAIVK74YtM",
  authDomain: "moniyo-7ddbe.firebaseapp.com",
  projectId: "moniyo-7ddbe",
  storageBucket: "moniyo-7ddbe.firebasestorage.app",
  messagingSenderId: "207019269878",
  appId: "1:207019269878:web:cd8ed8a177c67fed5cd6d7",
  measurementId: "G-PZ4RDJYB9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Check if running on native platform
const isNativePlatform = Capacitor.isNativePlatform();

// Initialize Firebase Auth
// On native platforms, use initializeAuth WITHOUT browserPopupRedirectResolver
// This prevents gapi from loading (which causes crashes on Capacitor)
// On web, use standard getAuth which includes popup/redirect support
export const auth = isNativePlatform
  ? initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
      // No popupRedirectResolver - this prevents gapi from loading
    })
  : getAuth(app);

// Initialize Firestore
// On native platforms, we use the native @capacitor-firebase/firestore plugin
// The web SDK is initialized but immediately put in offline mode to prevent CORS errors
const firestoreInstance = getFirestore(app);

// CRITICAL: On native, disable network IMMEDIATELY before any other code can use it
// This is a synchronous-ish block that starts the disable process right away
let firestoreReady: Promise<void> | null = null;
if (isNativePlatform) {
  firestoreReady = disableNetwork(firestoreInstance).then(() => {
    console.log('[Firebase] ✅ Web Firestore network disabled - using native plugin');
  }).catch((err) => {
    console.warn('[Firebase] ⚠️ Failed to disable web Firestore network:', err);
  });
}

export const db = firestoreInstance;
export { firestoreReady };

export const storage = getStorage(app);

// Analytics and Performance are disabled on native platforms (Capacitor)
// They require Firebase Installations which blocks capacitor:// origin
// For native apps, use Firebase native SDKs instead
export const analytics = typeof window !== 'undefined' && !isNativePlatform ? getAnalytics(app) : null;
export const performance = typeof window !== 'undefined' && !isNativePlatform ? getPerformance(app) : null;

// Enable offline persistence for Firestore (web only)
// On native platforms, the Capacitor Firebase plugin handles persistence
// This allows the app to work offline after the first load
if (typeof window !== 'undefined' && !isNativePlatform) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firestore persistence not supported by browser');
    }
  });
}


// Helper to check if app is initialized
export const isFirebaseInitialized = () => {
  return app !== null;
};

export default app;