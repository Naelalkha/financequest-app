import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
// Styles globaux unifiés (neon/glass) désormais dans global.css
import {
    FaLock,
    FaClock,
    FaSearch,
    FaTrophy,
    FaTimes,
    FaFire,
    FaChartLine,
    FaPiggyBank,
    FaWallet,
    FaCheck,
    FaLayerGroup,
    FaArrowRight,
    FaPlay,
    FaRedoAlt,
    FaBolt,
    FaBookmark,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaCrown,
    FaChevronDown,
    FaCircle,
    FaCreditCard,
    FaShieldAlt,
    FaFileInvoiceDollar
} from 'react-icons/fa';
import { GiDiamondTrophy, GiTwoCoins } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { RiFireFill } from 'react-icons/ri';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../app/LoadingSpinner';
import { toast } from 'react-toastify';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import QuestsView from '../quest/QuestsView';
import { usePaywall } from '../../hooks/usePaywall';
import PaywallModal from '../app/PaywallModal';
import posthog from 'posthog-js';
import AppBackground from '../app/AppBackground';

import { trackEvent } from '../../utils/analytics';
import { getStarterPackQuests } from '../../data/quests/index';
import { annualizeImpact } from '../../utils/impact';

// Skeleton futuriste
const QuestSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            transition={{ duration: 0.5 }}
            className="neon-card rounded-3xl p-6 relative overflow-hidden"
        >
            <div className="animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl animate-float" />
                    <div className="flex-1">
                        <div className="h-6 bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg w-3/4 mb-2" />
                        <div className="h-4 bg-gradient-to-r from-blue-500/15 to-transparent rounded-md w-1/2" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-12 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-2xl flex-1 animate-pulse-glow" />
                </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float-slow" />
        </motion.div>
    );
};

// Configuration des catégories avec style néon unifié (labels seront définis dans le composant)
const baseCategoryConfig = {
    all: {
        gradient: 'from-violet-400 via-purple-400 to-pink-400',
        neonGlow: 'shadow-[0_0_20px_rgba(167,139,250,0.3)]',
        color: 'text-violet-300',
        bgColor: 'bg-violet-500/20',
        borderColor: 'border-violet-500/30',
        icon: null
    },
    budgeting: {
        gradient: 'from-cyan-400 via-sky-400 to-teal-400',
        neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
        color: 'text-cyan-300',
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/30',
        icon: FaWallet
    },
    saving: {
        gradient: 'from-green-400 via-lime-400 to-emerald-400',
        neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
        color: 'text-green-300',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        icon: FaPiggyBank
    },
    credit: {
        gradient: 'from-red-400 via-rose-400 to-pink-400',
        neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
        color: 'text-red-300',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        icon: FaCreditCard
    },
    investing: {
        gradient: 'from-blue-400 via-indigo-400 to-purple-400',
        neonGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
        color: 'text-blue-300',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        icon: FaChartLine
    },
    taxes: {
        gradient: 'from-purple-500 via-violet-500 to-indigo-500',
        neonGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        color: 'text-purple-300',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
        icon: FaFileInvoiceDollar
    },
    protect: {
        gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
        neonGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
        color: 'text-pink-300',
        bgColor: 'bg-pink-500/20',
        borderColor: 'border-pink-500/30',
        icon: FaShieldAlt
    }
};

const QuestList = () => {
    const { user } = useAuth();
    const { t, currentLang } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const reduceMotion = useReducedMotion();

    // Tab depuis l'URL (starter, quickwins, all)
    const [activeTab, setActiveTab] = useState(() => {
        const tabParam = searchParams.get('tab');
        return ['starter', 'quickwins', 'all'].includes(tabParam) ? tabParam : 'all';
    });
    const [userProgress, setUserProgress] = useState({});
    const [isPremium, setIsPremium] = useState(false);
    const [bookmarkedQuests, setBookmarkedQuests] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [hoveredQuest, setHoveredQuest] = useState(null);
    const [completedQuestsCount, setCompletedQuestsCount] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true);
    const [rawSearch, setRawSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [userStats, setUserStats] = useState({
        level: 1,
        xp: 0,
        streak: 0,
        totalQuests: 0
    });
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);

    // Configuration des catégories avec labels traduits
    const categoryConfig = useMemo(() => ({
        all: {
            ...baseCategoryConfig.all,
            label: t('questList.all') || 'Toutes'
        },
        budgeting: {
            ...baseCategoryConfig.budgeting,
            label: t('questList.budgeting') || 'Budget'
        },
        saving: {
            ...baseCategoryConfig.saving,
            label: t('questList.saving') || 'Épargne'
        },
        credit: {
            ...baseCategoryConfig.credit,
            label: t('questList.credit') || 'Crédit'
        },
        investing: {
            ...baseCategoryConfig.investing,
            label: t('questList.investing') || 'Investissement'
        },
        taxes: {
            ...baseCategoryConfig.taxes,
            label: t('questList.taxes') || 'Fiscalité'
        },
        protect: {
            ...baseCategoryConfig.protect,
            label: t('questList.protect') || 'Protection'
        }
    }), [t]);

    // Use the local quests hook
    const {
        quests,
        loading,
        userCountry,
        getQuestsByCategoryForUser,
        getQuestStats
    } = useLocalQuests();

    const [filters, setFilters] = useState({
        category: 'all',
        difficulty: 'all',
        search: '',
        sortBy: 'hot'
    });

    // Déterminer la quête active (la plus avancée parmi celles en cours)
    const activeQuest = useMemo(() => {
        if (!quests || quests.length === 0) return null;
        const activeQuests = quests.filter((q) => userProgress[q.id]?.status === 'active');
        if (activeQuests.length === 0) return null;
        const questWithProgress = activeQuests
            .map((q) => ({ quest: q, progress: userProgress[q.id]?.progress || 0 }))
            .sort((a, b) => b.progress - a.progress)[0];
        return questWithProgress?.quest ?? null;
    }, [quests, userProgress]);

    // Tags rapides pour filtrage rapide (non redondants) - épuré
    const quickTags = useMemo(() => [
        {
            id: 'new',
            label: t('questList.new') || 'Nouveau',
            icon: BsStars,
            color: 'text-cyan-300',
            bg: 'bg-cyan-500/20',
            border: 'border-cyan-500/30',
            filter: (q) => q.isNew
        },
        {
            id: 'progress',
            label: t('questList.in_progress') || 'En cours',
            icon: FaBolt,
            color: 'text-orange-300',
            bg: 'bg-orange-500/20',
            border: 'border-orange-500/30',
            filter: (q) => userProgress[q.id]?.status === 'active'
        }
    ], [t, userProgress]);

    useEffect(() => {
        if (!user) {
            setIsUserDataLoaded(true);
            return;
        }
        setIsUserDataLoaded(false);
        loadUserData();
    }, [user, currentLang]);

    const loadUserData = async () => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setIsPremium(userData.isPremium || false);
                setBookmarkedQuests(userData.bookmarkedQuests || []);
                setUserStats({
                    level: userData.level || 1,
                    xp: userData.xp || 0,
                    streak: userData.streak || 0,
                    totalQuests: userData.completedQuests || 0
                });
            }

            const progressQuery = query(
                collection(db, 'userQuests'),
                where('userId', '==', user.uid)
            );
            const progressSnapshot = await getDocs(progressQuery);
            const progress = {};
            let completedCount = 0;
            progressSnapshot.docs.forEach(doc => {
                const data = doc.data();
                progress[data.questId] = {
                    status: data.status,
                    progress: data.progress || 0,
                    completedAt: data.completedAt,
                    score: data.score || 0
                };
                if (data.status === 'completed') {
                    completedCount++;
                }
            });
            setUserProgress(progress);
            setCompletedQuestsCount(completedCount);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsUserDataLoaded(true);
        }
    };

    const calculateRecommendationScore = (quest) => {
        let score = 0;
        if (quest.isNew) score += 30;
        // Favoriser les quêtes récentes de façon déterministe
        score += (quest.createdAt || 0) * 0.6;
        // Prioriser les quêtes en cours
        if (userProgress[quest.id] && userProgress[quest.id].status !== 'completed') score += 40;
        // Déprioriser les quêtes déjà terminées
        if (userProgress[quest.id]?.status === 'completed') score -= 50;
        // Favoriser les favoris
        if (bookmarkedQuests.includes(quest.id)) score += 35;
        // Légère pondération par XP
        score += (quest.xp || 0) * 0.05;
        return score;
    };

    // Quêtes filtrées
    const filteredQuests = useMemo(() => {
        if (!quests || quests.length === 0) return [];

        const enrichedQuests = quests.map((quest, index) => ({
            ...quest,
            isNew: index >= quests.length - 5,
            createdAt: quests.length - index,
            estimatedAnnual: quest.estimatedImpact ? annualizeImpact(quest.estimatedImpact) : 0
        }));

        let filtered = [...enrichedQuests];

        // Filtrage par tab (Étape 6)
        if (activeTab === 'starter') {
            filtered = filtered.filter(quest => quest.starterPack === true);
        } else if (activeTab === 'quickwins') {
            filtered = filtered.filter(quest =>
                quest.tags?.includes('quickwin') ||
                (quest.duration <= 10 && quest.estimatedAnnual > 0)
            );
        }
        // 'all' = pas de filtre par tab

        if (filters.category !== 'all') {
            filtered = filtered.filter(quest => quest.category === filters.category);
        }

        if (filters.difficulty !== 'all') {
            filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
        }

        selectedTags.forEach(tagId => {
            const tag = quickTags.find(t => t.id === tagId);
            if (tag && tag.filter) {
                filtered = filtered.filter(tag.filter);
            }
        });

        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter(quest =>
                quest.title.toLowerCase().includes(searchLower) ||
                quest.description.toLowerCase().includes(searchLower)
            );
        }

        // Tri intelligent (Étape 6: starterPack → impact annualisé → xp)
        switch (filters.sortBy) {
            case 'impact':
                // Tri par impact annuel estimé DESC
                filtered.sort((a, b) => {
                    // Starter Pack d'abord
                    if (a.starterPack && !b.starterPack) return -1;
                    if (!a.starterPack && b.starterPack) return 1;
                    // Puis par impact
                    const impactDiff = (b.estimatedAnnual || 0) - (a.estimatedAnnual || 0);
                    if (impactDiff !== 0) return impactDiff;
                    // Puis par XP
                    return (b.xp || 0) - (a.xp || 0);
                });
                break;
            case 'new':
                filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
            case 'xp':
                filtered.sort((a, b) => b.xp - a.xp);
                break;
            case 'quick':
                filtered.sort((a, b) => a.duration - b.duration);
                break;
            case 'hot':
            default:
                // Tri par défaut: Starter Pack → impact → xp → récence
                filtered.sort((a, b) => {
                    // 1. Starter Pack d'abord
                    if (a.starterPack && !b.starterPack) return -1;
                    if (!a.starterPack && b.starterPack) return 1;
                    // 2. Impact annuel DESC (si présent)
                    const impactDiff = (b.estimatedAnnual || 0) - (a.estimatedAnnual || 0);
                    if (impactDiff !== 0) return impactDiff;
                    // 3. XP DESC
                    const xpDiff = (b.xp || 0) - (a.xp || 0);
                    if (xpDiff !== 0) return xpDiff;
                    // 4. Récence (fallback)
                    return (b.createdAt || 0) - (a.createdAt || 0);
                });
                // Si progression chargée, boost les quêtes actives en top
                if (isUserDataLoaded) {
                    const activeQuests = filtered.filter(q => userProgress[q.id]?.status === 'active');
                    const others = filtered.filter(q => userProgress[q.id]?.status !== 'active');
                    filtered = [...activeQuests, ...others];
                }
                break;
        }

        return filtered;
    }, [quests, filters, selectedTags, userProgress, bookmarkedQuests, debouncedSearch, activeTab, isUserDataLoaded]);

    // Debounce de la recherche (source de vérité: rawSearch)
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(rawSearch.trim()), 300);
        return () => clearTimeout(id);
    }, [rawSearch]);

    // Gérer l’état desktop/mobile sans lire window.innerWidth dans le rendu
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => setIsDesktop(mq.matches);
        onChange();
        mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
        return () => {
            mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
        };
    }, []);

    // Fond animé global remplacé par AppBackground (voir composant commun)

    // Observer le scroll pour afficher un bouton remonter
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const container = document.getElementById('app-scroll-container');
        if (!container) return;
        const onScroll = () => {
            setShowScrollToTop(container.scrollTop > 600);
        };
        onScroll();
        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));

        // Analytics pour changement de tri
        if (filterType === 'sortBy') {
            trackEvent('quest_list_sorted', {
                sort_type: value,
                current_tab: activeTab
            });
        }
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setSearchParams({ tab: newTab });

        // Analytics pour changement de tab
        trackEvent('quest_list_filter_changed', {
            filter_type: 'tab',
            filter_value: newTab
        });

        // Track starter pack viewed
        if (newTab === 'starter') {
            trackEvent('starter_pack_viewed', {
                quest_count: quests.filter(q => q.starterPack).length
            });
        }
    };

    const handleTagToggle = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const toggleBookmark = async (questId, e) => {
        e?.stopPropagation();

        if (!user) {
            toast.info(t('questList.login_to_save') || '🔒 Connectez-vous pour enregistrer');
            return;
        }

        try {
            const newBookmarks = bookmarkedQuests.includes(questId)
                ? bookmarkedQuests.filter(id => id !== questId)
                : [...bookmarkedQuests, questId];

            setBookmarkedQuests(newBookmarks);

            await updateDoc(doc(db, 'users', user.uid), {
                bookmarkedQuests: newBookmarks
            });

            if (!bookmarkedQuests.includes(questId)) {
                toast.success(t('questList.saved') || '✨ Saved!', {
                    position: "bottom-center",
                    autoClose: 1500
                });
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleQuestClick = (quest, e) => {
        const activeVariant = posthog.getFeatureFlag('paywall_variant');

        if (quest.isPremium && !isPremium && activeVariant === 'A_direct') {
            e.preventDefault();
            posthog.capture('paywall_triggered', {
                variant: 'A_direct',
                quest_id: quest.id
            });
            setSelectedQuest(quest);
            setShowPaywall(true);
            return;
        }
    };

    const clearAllFilters = () => {
        setFilters({
            category: 'all',
            difficulty: 'all',
            search: '',
            sortBy: 'hot'
        });
        setSelectedTags([]);
        setShowAdvancedFilters(false);
    };

    const onCardActivate = (quest, e) => {
        const activeVariant = posthog.getFeatureFlag('paywall_variant');
        const isLocked = quest.isPremium && !isPremium;
        if (isLocked && activeVariant === 'A_direct') {
            e.preventDefault();
            posthog.capture('paywall_triggered', {
                variant: 'A_direct',
                quest_id: quest.id
            });
            setSelectedQuest(quest);
            setShowPaywall(true);
            return;
        }
        navigate(`/quests/${quest.id}`);
    };

    // Configuration de difficulté avec meilleur contraste
    const difficultyConfig = {
        beginner: {
            label: t?.('questList.easy') || 'Facile',
            color: 'text-emerald-300',
            bgStyle: 'bg-emerald-500/20 border border-emerald-500/30',
            textColor: 'text-emerald-300',
            gradient: 'from-emerald-400 to-green-400'
        },
        intermediate: {
            label: t?.('questList.medium') || 'Moyen',
            color: 'text-amber-300',
            bgStyle: 'bg-amber-500/20 border border-amber-500/30',
            textColor: 'text-amber-300',
            gradient: 'from-amber-400 to-orange-400'
        },
        advanced: {
            label: t?.('questList.hard') || 'Difficile',
            color: 'text-red-300',
            bgStyle: 'bg-red-500/20 border border-red-500/30',
            textColor: 'text-red-300',
            gradient: 'from-red-400 to-rose-400'
        }
    };

    // Rendu des cartes avec style néon/gaming
    const renderQuestCard = (quest, index) => {
        const progress = userProgress[quest.id];
        const isCompleted = progress?.status === 'completed';
        const isInProgress = progress?.status === 'active';
        const isLocked = quest.isPremium && !isPremium;
        const isBookmarked = bookmarkedQuests.includes(quest.id);
        const category = categoryConfig[quest.category] || categoryConfig.all;
        const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;

        return (
            <QuestCardShared
                key={quest.id}
                quest={quest}
                progressData={progress}
                isPremiumUser={isPremium}
                onClick={(e) => onCardActivate(quest, e)}
            />
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-[calc(env(safe-area-inset-bottom)+88px)]">
            <AppBackground variant="onyx" />
            <div className="relative z-10 max-w-md mx-auto">



                {/* Bouton discret remonter en haut */}
                <AnimatePresence>
                    {showScrollToTop && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            onClick={() => {
                                const container = document.getElementById('app-scroll-container');
                                if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="fixed bottom-[calc(env(safe-area-inset-bottom)+78px)] right-4 sm:right-6 z-[70] p-2.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white shadow-lg backdrop-blur-md transition-colors"
                            aria-label="Remonter en haut"
                        >
                            <FaArrowRight className="rotate-[-90deg]" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* New QuestsView Integration */}
                <QuestsView
                    activeQuests={filteredQuests.filter(q => !userProgress[q.id] || userProgress[q.id].status !== 'completed')}
                    completedQuests={filteredQuests.filter(q => userProgress[q.id]?.status === 'completed')}
                    onComplete={async (questId) => {
                        if (!user) {
                            toast.info(t('questList.login_required') || 'Connectez-vous pour compléter cette quête');
                            return;
                        }
                        // Logique de complétion - naviguer vers la quête
                        navigate(`/quests/${questId}`);
                    }}
                    onStartQuest={() => {
                        // Logique pour démarrer une nouvelle quête - peut être un modal ou navigation
                        // Pour l'instant, on scroll en haut pour montrer les filtres
                        const container = document.getElementById('app-scroll-container');
                        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isLoading={loading}
                    onDelete={async (questId) => {
                        if (!user) return;
                        try {
                            // Supprimer la progression de la quête
                            const questProgressQuery = query(
                                collection(db, 'userQuests'),
                                where('userId', '==', user.uid),
                                where('questId', '==', questId)
                            );
                            const snapshot = await getDocs(questProgressQuery);
                            snapshot.docs.forEach(async (docSnap) => {
                                await updateDoc(docSnap.ref, { status: 'deleted' });
                            });
                            // Recharger les données
                            await loadUserData();
                            toast.success(t('questList.quest_deleted') || 'Quête supprimée');
                        } catch (error) {
                            console.error('Error deleting quest:', error);
                            toast.error(t('questList.delete_error') || 'Erreur lors de la suppression');
                        }
                    }}
                />
                {/* Paywall Modal */}
                <AnimatePresence>
                    {showPaywall && selectedQuest && (
                        <PaywallModal
                            quest={selectedQuest}
                            variant="A_direct"
                            onClose={() => {
                                setShowPaywall(false);
                                setSelectedQuest(null);
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QuestList;