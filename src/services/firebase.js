// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const performance = typeof window !== 'undefined' ? getPerformance(app) : null;
export const storage = getStorage(app);

// Enable offline persistence for Firestore
// This allows the app to work offline after the first load
if (typeof window !== 'undefined') {
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