import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
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
        const userRef = doc(db, 'users', uid);

        try {
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

                const newUserData: UserData = {
                    uid,
                    email,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    xp: 0,
                    streaks: 0,
                    badges: [],
                    totalQuests: 0,
                    completedQuests: 0,
                    lang: additionalData.lang || detectedLang,
                    country: additionalData.country || detectedCountry,
                    ...additionalData
                };

                // Remove protected fields
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
                    await setDoc(userRef, {
                        lastLogin: serverTimestamp()
                    }, { merge: true });
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

            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                ...updates,
                updatedAt: serverTimestamp()
            }, { merge: true });

            const updatedDoc = await getDoc(userRef);
            setUser({
                ...auth.currentUser,
                ...updatedDoc.data()
            } as MergedUser);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Profile update failed';
            setError(message);
            throw err;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        setUser({
                            ...firebaseUser,
                            ...userSnap.data(),
                            isAnonymous: firebaseUser.isAnonymous
                        } as MergedUser);
                    } else {
                        const userData = await createUserDocument(firebaseUser.uid, firebaseUser.email);
                        setUser({
                            ...firebaseUser,
                            ...userData,
                            isAnonymous: firebaseUser.isAnonymous
                        } as MergedUser);
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setUser({
                        ...firebaseUser,
                        isAnonymous: firebaseUser.isAnonymous
                    } as MergedUser);
                }
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (anonymousError) {
                    console.error('Failed to sign in anonymously:', anonymousError);
                    setUser(null);
                    setLoading(false);
                }
                return;
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value: AuthContextValue = {
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
