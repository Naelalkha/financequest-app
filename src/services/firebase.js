// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnZ3gWmJZYS2UzJMz9p-l0y_jrP4IMxdI",
  authDomain: "financequest-pwa.firebaseapp.com",
  projectId: "financequest-pwa",
  storageBucket: "financequest-pwa.firebasestorage.app",
  messagingSenderId: "131538371852",
  appId: "1:131538371852:web:fa4c91813ec0beed097529",
  measurementId: "G-73ZEYJKER0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const performance = typeof window !== 'undefined' ? getPerformance(app) : null;
export const storage = getStorage(app);

// Helper to check if app is initialized
export const isFirebaseInitialized = () => {
  return app !== null;
};

export default app;