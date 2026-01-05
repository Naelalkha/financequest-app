import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';
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
    linkWithPopup,
    User as FirebaseUser,
    UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import {
    getDocument as nativeGetDocument,
    setDocument as nativeSetDocument,
    isNative as isNativeFirestore
} from '../services/nativeFirestore';
import {
    signInAnonymously as nativeSignInAnonymously,
    isNative,
    addNativeAuthStateListener
} from '../services/nativeAuth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import posthog from 'posthog-js';

// User data interfaces
export interface UserData {
    uid: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    isPremium?: boolean;
    isAnonymous?: boolean;
    isNewGoogleUser?: boolean;
    lang?: string;
    country?: string;
    xp?: number;
    level?: string;
    streaks?: number;
    badges?: string[];
    totalQuests?: number;
    completedQuests?: number;
    createdAt?: unknown;
    lastLogin?: unknown;
    [key: string]: unknown;
}

export type MergedUser = FirebaseUser & UserData;

interface AuthContextValue {
    user: MergedUser | null;
    login: (email: string, password: string) => Promise<FirebaseUser>;
    register: (email: string, password: string, displayName?: string | null, country?: string) => Promise<FirebaseUser | null>;
    loginWithGoogle: () => Promise<MergedUser>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserData>) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<MergedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createUserDocument = async (uid: string, email: string | null, additionalData: Partial<UserData> = {}): Promise<UserData> => {
        try {
            // Use native Firestore on Capacitor, web SDK on browser
            if (isNativeFirestore) {
                console.log('[Auth] Using native Firestore for user document');
                const existingUser = await nativeGetDocument<UserData>('users', uid);

                if (!existingUser) {
                    let detectedLang = 'en';
                    let detectedCountry = 'fr-FR';

                    try {
                        const browserLang = navigator.language || 'en';
                        const langCode = browserLang.split('-')[0];
                        if (langCode === 'fr' || langCode === 'en') {
                            detectedLang = langCode;
                        }
                        const locale = Intl.DateTimeFormat().resolvedOptions().locale || browserLang;
                        const region = new Intl.Locale(locale).region || locale.split('-')[1] || null;
                        if (region === 'US') {
                            detectedCountry = 'en-US';
                        } else if (region === 'FR' || !region) {
                            detectedCountry = 'fr-FR';
                        }
                    } catch (e) {
                        console.log('Locale detection failed, using defaults:', e);
                    }

                    const now = new Date().toISOString();
                    const newUserData: Record<string, unknown> = {
                        uid,
                        email,
                        createdAt: now,
                        lastLogin: now,
                        xp: 0,
                        streaks: 0,
                        badges: [],
                        totalQuests: 0,
                        completedQuests: 0,
                        lang: additionalData.lang || detectedLang,
                        country: additionalData.country || detectedCountry,
                        ...additionalData
                    };

                    delete newUserData.isPremium;
                    delete newUserData.level;

                    console.log('[Auth] Creating user document with native Firestore:', uid);
                    await nativeSetDocument('users', uid, newUserData, true);

                    return {
                        ...newUserData,
                        isPremium: false,
                        level: 'Novice'
                    } as UserData;
                } else {
                    try {
                        await nativeSetDocument('users', uid, { lastLogin: new Date().toISOString() }, true);
                    } catch (updateError) {
                        console.warn('Failed to update last login, but continuing:', updateError);
                    }
                    return {
                        ...existingUser,
                        isPremium: existingUser?.isPremium || false
                    };
                }
            } else {
                // Web SDK flow (unchanged)
                const userRef = doc(db, 'users', uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    let detectedLang = 'en';
                    let detectedCountry = 'fr-FR';

                    try {
                        const browserLang = navigator.language || 'en';
                        const langCode = browserLang.split('-')[0];
                        if (langCode === 'fr' || langCode === 'en') {
                            detectedLang = langCode;
                        }
                        const locale = Intl.DateTimeFormat().resolvedOptions().locale || browserLang;
                        const region = new Intl.Locale(locale).region || locale.split('-')[1] || null;
                        if (region === 'US') {
                            detectedCountry = 'en-US';
                        } else if (region === 'FR' || !region) {
                            detectedCountry = 'fr-FR';
                        }
                    } catch (e) {
                        console.log('Locale detection failed, using defaults:', e);
                    }

                    const now = new Date().toISOString();
                    const newUserData: UserData = {
                        uid,
                        email,
                        createdAt: now,
                        lastLogin: now,
                        xp: 0,
                        streaks: 0,
                        badges: [],
                        totalQuests: 0,
                        completedQuests: 0,
                        lang: additionalData.lang || detectedLang,
                        country: additionalData.country || detectedCountry,
                        ...additionalData
                    };

                    delete newUserData.isPremium;
                    delete newUserData.level;

                    console.log('Creating user document with data:', newUserData);
                    await setDoc(userRef, newUserData, { merge: true });

                    return {
                        ...newUserData,
                        isPremium: false,
                        level: 'Novice'
                    };
                } else {
                    try {
                        await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
                    } catch (updateError) {
                        console.warn('Failed to update last login, but continuing:', updateError);
                    }

                    const updatedSnap = await getDoc(userRef);
                    const data = updatedSnap.data() as UserData;
                    return {
                        ...data,
                        isPremium: data?.isPremium || false
                    };
                }
            }
        } catch (err) {
            console.error('Error creating/updating user document:', err);
            throw err;
        }
    };

    const login = async (email: string, password: string): Promise<FirebaseUser> => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userData = await createUserDocument(userCredential.user.uid, userCredential.user.email);

            setUser({
                ...userCredential.user,
                ...userData,
                isAnonymous: false
            } as MergedUser);

            return userCredential.user;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        }
    };

    const register = async (
        email: string,
        password: string,
        displayName: string | null = null,
        country: string = 'fr-FR'
    ): Promise<FirebaseUser | null> => {
        try {
            setError(null);

            let userCredential: UserCredential;
            const currentUser = auth.currentUser;

            if (currentUser && currentUser.isAnonymous) {
                const credential = EmailAuthProvider.credential(email, password);
                userCredential = await linkWithCredential(currentUser, credential);
                console.log('Anonymous account upgraded to email/password');
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            if (displayName) {
                try {
                    await updateProfile(userCredential.user, { displayName });
                } catch (profileError) {
                    console.warn('Failed to update profile, but continuing:', profileError);
                }
            }

            let userData: UserData = {
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
            }

            setUser({
                ...userCredential.user,
                ...userData,
                isAnonymous: false
            } as MergedUser);

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
        } catch (err) {
            const error = err as { code?: string; message?: string };
            if (error.code && error.code.startsWith('auth/')) {
                setError(error.message || 'Registration failed');
                throw err;
            } else {
                console.error('Non-auth error during registration:', err);
                return null;
            }
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Logout failed';
            setError(message);
            throw err;
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Password reset failed';
            setError(message);
            throw err;
        }
    };

    const loginWithGoogle = async (): Promise<MergedUser> => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const currentUser = auth.currentUser;

            let result: UserCredential;
            let wasAnonymous = false;

            if (currentUser && currentUser.isAnonymous) {
                result = await linkWithPopup(currentUser, provider);
                wasAnonymous = true;
                console.log('Anonymous account upgraded to Google');
            } else {
                result = await signInWithPopup(auth, provider);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isNewUser = (result as any)._tokenResponse?.isNewUser || wasAnonymous;

            let userData: UserData = {
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
                    }
                );
            } catch (firestoreError) {
                console.error('Failed to create/update user document, but user is authenticated:', firestoreError);
            }

            const mergedUser: MergedUser = {
                ...result.user,
                ...userData,
                isNewGoogleUser: isNewUser,
                isAnonymous: false
            } as MergedUser;

            setUser(mergedUser);

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
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Google login failed';
            setError(message);
            throw err;
        }
    };

    const updateUserProfile = async (updates: Partial<UserData>): Promise<void> => {
        if (!user) return;

        try {
            if (updates.displayName || updates.photoURL) {
                await updateProfile(auth.currentUser!, {
                    displayName: updates.displayName || user.displayName,
                    photoURL: updates.photoURL || user.photoURL
                });
            }

            // Use native Firestore on Capacitor, web SDK on browser
            if (isNativeFirestore) {
                await nativeSetDocument('users', user.uid, {
                    ...updates,
                    updatedAt: new Date().toISOString()
                }, true);

                const updatedData = await nativeGetDocument<UserData>('users', user.uid);
                setUser({
                    ...auth.currentUser,
                    ...updatedData
                } as MergedUser);
            } else {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    ...updates,
                    updatedAt: new Date().toISOString()
                }, { merge: true });

                const updatedDoc = await getDoc(userRef);
                setUser({
                    ...auth.currentUser,
                    ...updatedDoc.data()
                } as MergedUser);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Profile update failed';
            setError(message);
            throw err;
        }
    };

    useEffect(() => {
        console.log('[Auth] Setting up auth state listener... isNative:', isNative);

        // Shorter timeout for mobile to avoid long loading screens
        const timeoutMs = 5000;

        // Safety timeout: if loading takes too long, force it to complete
        const safetyTimeout = setTimeout(() => {
            console.warn('[Auth] Safety timeout triggered - forcing loading=false');
            setLoading(false);
        }, timeoutMs);

        // Helper to process user (works for both native and web users)
        const processUser = async (uid: string, email: string | null, isAnonymous: boolean, userObj: unknown) => {
            console.log('[Auth] Processing user:', uid);
            clearTimeout(safetyTimeout);
            try {
                let existingData: UserData | null = null;

                // Use native Firestore on Capacitor, web SDK on browser
                if (isNativeFirestore) {
                    existingData = await nativeGetDocument<UserData>('users', uid);
                } else {
                    const userRef = doc(db, 'users', uid);
                    const userSnap = await getDoc(userRef);
                    existingData = userSnap.exists() ? (userSnap.data() as UserData) : null;
                }

                if (existingData) {
                    setUser({
                        ...userObj,
                        ...existingData,
                        uid,
                        email,
                        isAnonymous
                    } as MergedUser);
                } else {
                    const userData = await createUserDocument(uid, email);
                    setUser({
                        ...userObj,
                        ...userData,
                        uid,
                        email,
                        isAnonymous
                    } as MergedUser);
                }
            } catch (err) {
                console.error('[Auth] Error fetching user data:', err);
                setUser({
                    ...userObj,
                    uid,
                    email,
                    isAnonymous
                } as MergedUser);
            }
            console.log('[Auth] User loaded, setting loading=false');
            setLoading(false);
        };

        if (isNative) {
            // NATIVE: Use native Firebase Auth listener
            console.log('[Auth] Using native auth flow');

            // Check if already signed in
            FirebaseAuthentication.getCurrentUser().then(async ({ user: nativeUser }) => {
                console.log('[Auth] Current native user:', nativeUser?.uid || 'null');

                if (nativeUser) {
                    await processUser(nativeUser.uid, nativeUser.email, nativeUser.isAnonymous ?? true, nativeUser);
                } else {
                    // No user - sign in anonymously
                    console.log('[Auth] No native user, signing in anonymously...');
                    try {
                        const result = await nativeSignInAnonymously();
                        if (result) {
                            // Cast to get uid since it could be NativeUser or FirebaseUser
                            const nUser = result as { uid: string; email: string | null; isAnonymous?: boolean };
                            await processUser(nUser.uid, nUser.email, nUser.isAnonymous ?? true, nUser);
                        } else {
                            console.error('[Auth] Native anonymous sign in returned null');
                            setUser(null);
                            setLoading(false);
                        }
                    } catch (err) {
                        console.error('[Auth] Native anonymous sign in failed:', err);
                        setUser(null);
                        setLoading(false);
                    }
                }
            });

            // Listen for native auth state changes
            const unsubscribeNative = addNativeAuthStateListener(async (nativeUser) => {
                console.log('[Auth] Native auth state changed:', nativeUser?.uid || 'null');
                if (nativeUser) {
                    await processUser(nativeUser.uid, nativeUser.email, nativeUser.isAnonymous ?? true, nativeUser);
                } else {
                    setUser(null);
                    setLoading(false);
                }
            });

            return () => {
                clearTimeout(safetyTimeout);
                unsubscribeNative();
            };
        } else {
            // WEB: Use web Firebase Auth listener
            console.log('[Auth] Using web auth flow');

            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                console.log('[Auth] onAuthStateChanged fired, user:', firebaseUser?.uid || 'null');

                if (firebaseUser) {
                    await processUser(firebaseUser.uid, firebaseUser.email, firebaseUser.isAnonymous, firebaseUser);
                } else {
                    // No user - try anonymous sign in
                    try {
                        console.log('[Auth] No user, attempting web anonymous sign in...');
                        await signInAnonymously(auth);
                        // Don't set loading=false here, onAuthStateChanged will be called again
                    } catch (anonymousError) {
                        console.error('[Auth] Failed to sign in anonymously:', anonymousError);
                        setUser(null);
                        setLoading(false);
                    }
                }
            });

            return () => {
                clearTimeout(safetyTimeout);
                unsubscribe();
            };
        }
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo<AuthContextValue>(() => ({
        user,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
        loading,
        error
    }), [user, loading, error]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
