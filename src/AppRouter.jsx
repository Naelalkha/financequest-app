import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { PlaceholderOnboarding, onboardingStore } from './features/onboarding';

// Private route wrapper - Now allows anonymous users!
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <AppBackground variant="nebula" grain grid={false} animate>
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" label="" />
            </div>
        </AppBackground>
    );

    // With anonymous auth, user should always exist after loading
    // If somehow no user, redirect to root (will trigger anonymous auth)
    if (!user) return <Navigate to="/" state={{ from: location }} replace />;

    return children;
}

// Public route wrapper (redirects to dashboard if authenticated and NOT anonymous)
function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <AppBackground variant="nebula" grain grid={false} animate>
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" label="" />
            </div>
        </AppBackground>
    );

    // Only redirect if user is logged in with a real account (not anonymous)
    if (user && !user.isAnonymous) return <Navigate to="/dashboard" replace />;

    return children;
}

const AppRouter = () => {
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
        
        // Check on mount and when navigating
        checkOnboarding();
        
        // Listen for storage changes (in case another tab completes onboarding)
        window.addEventListener('storage', checkOnboarding);
        return () => window.removeEventListener('storage', checkOnboarding);
    }, [location.pathname]);

    if (loading) {
        return (
            <AppBackground variant="nebula" grain grid={false} animate>
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner size="lg" label="" />
                </div>
            </AppBackground>
        );
    }

    // If user hasn't completed onboarding, show onboarding first
    if (!hasCompletedOnboarding && user) {
        return <PlaceholderOnboarding />;
    }

    // Routes that show bottom nav (now includes anonymous users)
    const showBottomNav = user && !['/', '/login', '/register', '/onboarding'].includes(location.pathname);

    return (
        <>
            <div className={showBottomNav ? 'pb-20' : ''}>
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
            </div>

            {/* Bottom Navigation */}
            {showBottomNav && <BottomNav />}
        </>
    );
};

export default AppRouter;
