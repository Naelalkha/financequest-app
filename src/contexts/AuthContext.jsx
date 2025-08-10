import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import posthog from 'posthog-js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create or update user document in Firestore
  const createUserDocument = async (uid, email, additionalData = {}) => {
    const userRef = doc(db, 'users', uid);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          uid,
          email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          xp: 0,
          level: 'Novice',
          streaks: 0,
          badges: [],
          totalQuests: 0,
          completedQuests: 0,
          isPremium: false,
          lang: 'en',
          country: 'fr-FR', // Default country
          ...additionalData
        });
      } else {
        // Update last login
        await setDoc(userRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      
      // Fetch and return the user data
      const updatedSnap = await getDoc(userRef);
      return updatedSnap.data();
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocument(userCredential.user.uid, userCredential.user.email);
      
      // Merge Firebase Auth user with Firestore data
      setUser({
        ...userCredential.user,
        ...userData
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Register function
  const register = async (email, password, displayName = null, country = 'fr-FR') => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user document
      const userData = await createUserDocument(
        userCredential.user.uid, 
        userCredential.user.email,
        { displayName, country }
      );
      
      // Merge Firebase Auth user with Firestore data
      setUser({
        ...userCredential.user,
        ...userData
      });
      
      // Capture PostHog signup event
      posthog.capture('signup', {
        provider: 'email',
        lang: userData.lang || 'en',
        country: userData.country || 'fr-FR'
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Google login/signup function
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create or update user document
      const userData = await createUserDocument(
        userCredential.user.uid, 
        userCredential.user.email,
        { 
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          country: 'fr-FR' // Default country for Google signup
        }
      );
      
      // Merge Firebase Auth user with Firestore data
      setUser({
        ...userCredential.user,
        ...userData
      });
      
      // Capture PostHog signup event
      posthog.capture('signup', {
        provider: 'google',
        lang: userData.lang || 'en'
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return;
    
    try {
      // Update Firebase Auth profile if displayName or photoURL changed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL
        });
      }
      
      // Update Firestore document
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local user state
      const updatedDoc = await getDoc(userRef);
      setUser({
        ...auth.currentUser,
        ...updatedDoc.data()
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            // Merge Firebase Auth user with Firestore data
            setUser({
              ...firebaseUser,
              ...userSnap.data()
            });
          } else {
            // Create user document if it doesn't exist
            const userData = await createUserDocument(firebaseUser.uid, firebaseUser.email);
            setUser({
              ...firebaseUser,
              ...userData
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser); // Fallback to just Firebase Auth user
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};