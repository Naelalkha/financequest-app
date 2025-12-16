import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  linkWithPopup
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

  const createUserDocument = async (uid, email, additionalData = {}) => {
    const userRef = doc(db, 'users', uid);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Détection automatique de la locale du navigateur
        let detectedLang = 'en';
        let detectedCountry = 'fr-FR';
        
        try {
          // Détection de la langue depuis le navigateur
          const browserLang = navigator.language || navigator.userLanguage || 'en';
          const langCode = browserLang.split('-')[0];
          if (langCode === 'fr' || langCode === 'en') {
            detectedLang = langCode;
          }
          
          // Détection du pays depuis la locale
          const locale = Intl.DateTimeFormat().resolvedOptions().locale || browserLang;
          const region = new Intl.Locale(locale).region || locale.split('-')[1] || null;
          
          // Mapper la région vers nos codes pays supportés
          if (region === 'US') {
            detectedCountry = 'en-US';
          } else if (region === 'FR' || !region) {
            detectedCountry = 'fr-FR';
          }
        } catch (error) {
          console.log('Locale detection failed, using defaults:', error);
        }
        
        // Create new user document SANS les champs protégés
        const newUserData = {
          uid,
          email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          xp: 0,
          // NE PAS inclure level - c'est un champ protégé calculé par le serveur
          streaks: 0,
          badges: [],
          totalQuests: 0,
          completedQuests: 0,
          // NE PAS inclure : isPremium, premiumStatus, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, level, totalXP, longestStreak
          lang: additionalData.lang || detectedLang,
          country: additionalData.country || detectedCountry,
          ...additionalData
        };
        
        // Retirer les champs protégés s'ils sont dans additionalData
        delete newUserData.isPremium;
        delete newUserData.premiumStatus;
        delete newUserData.stripeCustomerId;
        delete newUserData.stripeSubscriptionId;
        delete newUserData.currentPeriodEnd;
        delete newUserData.level;
        delete newUserData.totalXP;
        delete newUserData.longestStreak;
        delete newUserData.impactAnnualEstimated;
        delete newUserData.impactAnnualVerified;
        delete newUserData.proofsVerifiedCount;
        delete newUserData.isAdmin;
        delete newUserData.isModerator;
        
        console.log('Creating user document with data:', newUserData);
        await setDoc(userRef, newUserData, { merge: true });
        
        // Retourner avec les valeurs par défaut pour l'affichage UI (non écrites en DB)
        return {
          ...newUserData,
          isPremium: false, // Valeur par défaut pour l'UI seulement
          level: 'Novice' // Valeur par défaut pour l'UI (sera calculé par le serveur)
        };
      } else {
        // Update last login - ne pas faire échouer si ça échoue
        try {
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (updateError) {
          console.warn('Failed to update last login, but continuing:', updateError);
        }
        
        const updatedSnap = await getDoc(userRef);
        return {
          ...updatedSnap.data(),
          isPremium: updatedSnap.data()?.isPremium || false
        };
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  };

  // Login function - for existing accounts
  // Note: If current user is anonymous and logs into an existing account,
  // their anonymous data will be lost. Consider warning users about this.
  const login = async (email, password) => {
    try {
      setError(null);
      
      // If user is anonymous, they're logging into an EXISTING account
      // This will replace the anonymous user (data migration would need to be handled separately)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocument(userCredential.user.uid, userCredential.user.email);
      
      // Merge Firebase Auth user with Firestore data
      setUser({
        ...userCredential.user,
        ...userData,
        isAnonymous: false
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Register function - handles both new users and anonymous upgrade
  const register = async (email, password, displayName = null, country = 'fr-FR') => {
    try {
      setError(null);
      
      let userCredential;
      const currentUser = auth.currentUser;
      
      // Check if current user is anonymous → upgrade instead of create new
      if (currentUser && currentUser.isAnonymous) {
        // Link anonymous account with email/password credentials
        const credential = EmailAuthProvider.credential(email, password);
        userCredential = await linkWithCredential(currentUser, credential);
        console.log('Anonymous account upgraded to email/password');
      } else {
        // Create new account (normal flow)
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Update display name if provided
      if (displayName) {
        try {
          await updateProfile(userCredential.user, { displayName });
        } catch (profileError) {
          console.warn('Failed to update profile, but continuing:', profileError);
        }
      }
      
      // Create/update user document - ne pas faire échouer l'inscription si ça échoue
      let userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        country,
        isPremium: false
      };
      
      try {
        userData = await createUserDocument(
          userCredential.user.uid, 
          userCredential.user.email,
          { displayName, country }
        );
      } catch (firestoreError) {
        console.error('Failed to create user document, but user is authenticated:', firestoreError);
        // L'utilisateur est créé dans Firebase Auth, on continue avec des données par défaut
      }
      
      // Merge Firebase Auth user with Firestore data
      setUser({
        ...userCredential.user,
        ...userData,
        isAnonymous: false
      });
      
      // Capture PostHog signup event
      try {
        posthog.capture('signup', {
          provider: 'email',
          lang: userData.lang || 'en',
          country: userData.country || 'fr-FR',
          upgraded_from_anonymous: currentUser?.isAnonymous || false
        });
      } catch (posthogError) {
        console.warn('PostHog tracking failed:', posthogError);
      }
      
      return userCredential.user;
    } catch (error) {
      // Seulement faire échouer si l'authentification Firebase échoue
      if (error.code && error.code.startsWith('auth/')) {
        setError(error.message);
        throw error;
      } else {
        // Pour les autres erreurs, logger mais ne pas faire échouer
        console.error('Non-auth error during registration:', error);
        return null;
      }
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

  // Google login/signup function - handles both new users and anonymous upgrade
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const currentUser = auth.currentUser;
      
      let result;
      let wasAnonymous = false;
      
      // Check if current user is anonymous → upgrade instead of create new
      if (currentUser && currentUser.isAnonymous) {
        result = await linkWithPopup(currentUser, provider);
        wasAnonymous = true;
        console.log('Anonymous account upgraded to Google');
      } else {
        result = await signInWithPopup(auth, provider);
      }
      
      // Vérifier si c'est un nouveau compte
      const isNewUser = result._tokenResponse?.isNewUser || wasAnonymous;
      
      // Create or update user document - ne pas faire échouer si ça échoue
      let userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isPremium: false
      };
      
      try {
        userData = await createUserDocument(
          result.user.uid, 
          result.user.email,
          { 
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            // Ne pas forcer le country, laisser la détection automatique le faire
          }
        );
      } catch (firestoreError) {
        console.error('Failed to create/update user document, but user is authenticated:', firestoreError);
        // L'utilisateur est authentifié, on continue avec des données par défaut
      }
      
      // Merge Firebase Auth user with Firestore data
      const mergedUser = {
        ...result.user,
        ...userData,
        isNewGoogleUser: isNewUser,
        isAnonymous: false
      };
      
      setUser(mergedUser);
      
      // Capture PostHog signup event seulement pour les nouveaux utilisateurs
      if (isNewUser) {
        try {
          posthog.capture('signup', {
            provider: 'google',
            lang: userData.lang || 'en',
            country: userData.country || 'fr-FR',
            upgraded_from_anonymous: wasAnonymous
          });
        } catch (posthogError) {
          console.warn('PostHog tracking failed:', posthogError);
        }
      }
      
      return mergedUser;
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
              ...userSnap.data(),
              isAnonymous: firebaseUser.isAnonymous
            });
          } else {
            // Create user document if it doesn't exist
            const userData = await createUserDocument(firebaseUser.uid, firebaseUser.email);
            setUser({
              ...firebaseUser,
              ...userData,
              isAnonymous: firebaseUser.isAnonymous
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            ...firebaseUser,
            isAnonymous: firebaseUser.isAnonymous
          }); // Fallback to just Firebase Auth user
        }
      } else {
        // No user logged in → Sign in anonymously for Guest Mode
        try {
          await signInAnonymously(auth);
          // The onAuthStateChanged will trigger again with the anonymous user
        } catch (anonymousError) {
          console.error('Failed to sign in anonymously:', anonymousError);
        setUser(null);
          setLoading(false);
        }
        return; // Don't setLoading(false) here, wait for anonymous auth to complete
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