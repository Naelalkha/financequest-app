import React from 'react';
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

// Private route wrapper
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

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    return children;
}

// Public route wrapper (redirects to dashboard if authenticated)
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

    if (user) return <Navigate to="/dashboard" replace />;

    return children;
}

const AppRouter = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <AppBackground variant="nebula" grain grid={false} animate>
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner size="lg" label="" />
                </div>
            </AppBackground>
        );
    }

    // Routes that show bottom nav
    const showBottomNav = user && !['/', '/login', '/register'].includes(location.pathname);

    return (
        <>
            <div className={showBottomNav ? 'pb-20' : ''}>
                <Routes>
                    {/* Root Route Logic */}
                    <Route path="/" element={
                        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                    } />

                    {/* Public Routes */}
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

                    {/* Protected Routes */}
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
