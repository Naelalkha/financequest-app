/**
 * Native Authentication Service for Capacitor
 * Uses @capacitor-firebase/authentication for native iOS/Android auth
 */

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication, User as NativeUser } from '@capacitor-firebase/authentication';
import {
  signInWithCredential,
  GoogleAuthProvider,
  signInAnonymously as webSignInAnonymously,
  signOut as webSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

// Check if running on native platform
export const isNative = Capacitor.isNativePlatform();

/**
 * Sign in anonymously
 * Works on both web and native
 */
export async function signInAnonymously(): Promise<NativeUser | FirebaseUser | null> {
  if (isNative) {
    // Use native Firebase Auth
    console.log('[NativeAuth] Signing in anonymously via native plugin...');
    const result = await FirebaseAuthentication.signInAnonymously();
    console.log('[NativeAuth] Sign in result:', result.user?.uid);
    return result.user;
  } else {
    // Use web Firebase Auth
    const result = await webSignInAnonymously(auth);
    return result.user;
  }
}

/**
 * Sign in with Google
 * Uses native Google Sign-In on mobile, popup on web
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (isNative) {
    // Use native Google Sign-In
    const result = await FirebaseAuthentication.signInWithGoogle();

    if (result.credential?.idToken) {
      // Create credential from native token
      const credential = GoogleAuthProvider.credential(result.credential.idToken);
      // Sign in to web SDK with credential
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }
    return null;
  } else {
    // Web implementation uses popup (handled by AuthContext)
    throw new Error('Use AuthContext.loginWithGoogle() for web');
  }
}

/**
 * Sign out
 * Signs out from both native and web Firebase
 */
export async function signOut(): Promise<void> {
  if (isNative) {
    // Sign out from native Firebase
    await FirebaseAuthentication.signOut();
  }
  // Always sign out from web SDK too
  await webSignOut(auth);
}

/**
 * Get current native user
 */
export async function getCurrentUser(): Promise<NativeUser | null> {
  if (isNative) {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result.user;
  }
  return null;
}

/**
 * Add listener for native auth state changes
 */
export function addNativeAuthStateListener(
  callback: (user: NativeUser | null) => void
): () => void {
  if (!isNative) {
    return () => {}; // No-op on web
  }

  const handle = FirebaseAuthentication.addListener('authStateChange', (change) => {
    callback(change.user);
  });

  // Return unsubscribe function
  return () => {
    handle.then(h => h.remove());
  };
}

/**
 * Delete the current user account
 * Works on both web and native
 */
export async function deleteCurrentUser(): Promise<void> {
  if (isNative) {
    // Use native Firebase Auth to delete user
    console.log('[NativeAuth] Deleting user via native plugin...');
    await FirebaseAuthentication.deleteUser();
    console.log('[NativeAuth] User deleted successfully');
  } else {
    // Use web Firebase Auth
    const { deleteUser } = await import('firebase/auth');
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
}
