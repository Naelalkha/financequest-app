import React, { useState, useEffect, ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuestList from './pages/QuestList';
import QuestRouter from './pages/QuestRouter';
import Premium from './pages/Premium';
import Profile from './pages/Profile';
import Impact from './pages/Impact';
import BottomNav from './components/layout/BottomNav';
import AppBackground from './components/layout/AppBackground';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { OnboardingFlow, onboardingStore } from './features/onboarding';
import { DURATION, EASE } from './styles/animationConstants';

interface RouteWrapperProps {
    children: ReactNode;
}

// Smooth loading screen component
const SmoothLoadingScreen: React.FC = () => (
    <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION.medium, ease: EASE.premium }}
    >
        <LoadingSpinner size="lg" />
    </motion.div>
);

// Private route wrapper - Now allows anonymous users!
function PrivateRoute({ children }: RouteWrapperProps): React.ReactElement {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <AppBackground>
            <SmoothLoadingScreen />
        </AppBackground>
    );

    // With anonymous auth, user should always exist after loading
    if (!user) return <Navigate to="/" state={{ from: location }} replace />;

    return <>{children}</>;
}

// Public route wrapper (redirects to dashboard if authenticated and NOT anonymous)
function PublicRoute({ children }: RouteWrapperProps): React.ReactElement {
    const { user, loading } = useAuth();

    if (loading) return (
        <AppBackground>
            <SmoothLoadingScreen />
        </AppBackground>
    );

    // TODO: Type user properly when AuthContext is migrated
    // Only redirect if user is logged in with a real account (not anonymous)
    if (user && !(user as { isAnonymous?: boolean }).isAnonymous) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

const AppRouter: React.FC = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Track onboarding completion (persisted in localStorage)
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
        onboardingStore.hasCompletedOnboarding()
    );

    // Listen for onboarding completion (in case it changes)
    useEffect(() => {
        const checkOnboarding = () => {
            setHasCompletedOnboarding(onboardingStore.hasCompletedOnboarding());
        };

        checkOnboarding();

        window.addEventListener('storage', checkOnboarding);
        return () => window.removeEventListener('storage', checkOnboarding);
    }, [location.pathname]);

    // Routes that show bottom nav (now includes anonymous users)
    const showBottomNav = user && !['/', '/login', '/register', '/onboarding'].includes(location.pathname);

    // Smooth loading state
    if (loading) {
        return (
            <AppBackground>
                <SmoothLoadingScreen />
            </AppBackground>
        );
    }

    // Onboarding flow with smooth transition
    if (!hasCompletedOnboarding && user) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.premium }}
                >
                    <OnboardingFlow />
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <>
            <motion.div
                className={showBottomNav ? 'pb-20' : ''}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DURATION.medium, ease: EASE.premium }}
            >
                <Routes>
                    {/* Root Route Logic */}
                    <Route path="/" element={
                        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/dashboard" replace />
                    } />

                    {/* Auth Routes - for upgrading anonymous accounts */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />

                    {/* Protected Routes - Now accessible by anonymous users too! */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/quests" element={
                        <PrivateRoute>
                            <QuestList />
                        </PrivateRoute>
                    } />
                    <Route path="/quests/:id" element={
                        <PrivateRoute>
                            <QuestRouter />
                        </PrivateRoute>
                    } />
                    <Route path="/premium" element={
                        <PrivateRoute>
                            <Premium />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path="/impact" element={
                        <PrivateRoute>
                            <Impact />
                        </PrivateRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </motion.div>

            {/* Bottom Navigation */}
            {showBottomNav && <BottomNav />}
        </>
    );
};

export default AppRouter;
