import { BrowserRouter as Router } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { BackgroundProvider } from './contexts/BackgroundContext';
import './styles/animations.css';
import AppBackground from './components/layout/AppBackground';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AppRouter from './AppRouter';
import { DURATION, EASE } from './styles/animationConstants';

// Main app content with smooth transitions
function AppContent(): React.ReactElement {
    const { loading } = useAuth();
    const { t } = useTranslation('common');

    return (
        <AppBackground>
            <AnimatePresence mode="wait">
                {loading ? (
                    // Loading state with smooth fade
                    <motion.div
                        key="loading"
                        className="min-h-screen flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: DURATION.medium,
                            ease: EASE.premium
                        }}
                    >
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{
                                duration: DURATION.normal,
                                ease: EASE.outExpo,
                                delay: 0.05
                            }}
                        >
                            <div className="mb-6 flex items-center justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                            <motion.p
                                className="text-gray-400 text-lg font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15, duration: DURATION.normal }}
                            >
                                {t('ui.loading_app') || 'Loading Moniyo...'}
                            </motion.p>
                        </motion.div>
                    </motion.div>
                ) : (
                    // Main app content with smooth entry
                    <motion.div
                        key="app-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: DURATION.medium,
                            ease: EASE.premium
                        }}
                    >
                        <AppRouter />
                    </motion.div>
                )}
            </AnimatePresence>
        </AppBackground>
    );
}

// Main App component
function App(): React.ReactElement {
    return (
        <Router>
            <BackgroundProvider>
                <AppContent />
            </BackgroundProvider>
        </Router>
    );
}

export default App;
