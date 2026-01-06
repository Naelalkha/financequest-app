import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, BarChart3, User, Crown, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { trackEvent } from '../../utils/analytics';
import { haptic } from '../../utils/haptics';

interface NavBadge {
    type: 'starter' | 'new' | 'premium';
    label?: string;
    count?: number;
}

interface NavItem {
    path: string;
    icon: LucideIcon;
    label: string;
    a11yLabel?: string;
    key: string;
    badge: NavBadge | null;
    chip?: string | null;
}

const BottomNav: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation('common');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Indicator states
    const [showStarterBadge, setShowStarterBadge] = useState(false);
    const { impactAnnualEstimated } = useServerImpactAggregates();

    // Analytics refs (prevent duplicates)
    const starterBadgeShownRef = useRef(false);
    const impactChipShownRef = useRef(false);

    // Feature flag for Nav V2
    const NAV_V2_ENABLED = import.meta.env.VITE_NAV_V2 !== 'off';
    const STARTER_BADGE_TTL_HOURS = parseInt(import.meta.env.VITE_STARTER_BADGE_TTL_HOURS || '72', 10);

    // Reset pending state when URL changes
    useEffect(() => {
        setPendingPath(null);
    }, [location.pathname]);

    // Starter badge logic (ephemeral)
    useEffect(() => {
        if (!user || !NAV_V2_ENABLED) return;

        const checkStarterBadge = async () => {
            try {
                // 1. Check if already dismissed
                const dismissed = localStorage.getItem('starterBadgeDismissed');
                if (dismissed === 'true') {
                    setShowStarterBadge(false);
                    return;
                }

                // 2. Check if user has started a Starter quest
                const userQuestsRef = collection(db, 'userQuests');
                const q = query(userQuestsRef, where('userId', '==', user.uid));
                const snapshot = await getDocs(q);

                const starterQuestIds = ['cut-subscription', 'adjust-tax-rate', 'weekly-savings'];
                const hasStartedStarter = snapshot.docs.some(doc => {
                    const data = doc.data();
                    return starterQuestIds.includes(data.questId) && ['active', 'completed'].includes(data.status);
                });

                if (hasStartedStarter) {
                    setShowStarterBadge(false);
                    localStorage.setItem('starterBadgeDismissed', 'true');
                    return;
                }

                // 3. Check TTL (72h default)
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
                    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

                    if (hoursSinceCreation < STARTER_BADGE_TTL_HOURS) {
                        setShowStarterBadge(true);
                    }
                }
            } catch (error) {
                console.error('Error checking starter badge:', error);
            }
        };

        checkStarterBadge();
    }, [user, NAV_V2_ENABLED, STARTER_BADGE_TTL_HOURS]);

    // Analytics: Starter badge (1×/session)
    useEffect(() => {
        if (showStarterBadge && !starterBadgeShownRef.current && NAV_V2_ENABLED) {
            trackEvent('nav_starter_badge_shown', {});
            starterBadgeShownRef.current = true;
        }
    }, [showStarterBadge, NAV_V2_ENABLED]);

    // Analytics: Impact chip (1×/session)
    useEffect(() => {
        if (impactAnnualEstimated > 0 && !impactChipShownRef.current && NAV_V2_ENABLED) {
            trackEvent('nav_impact_chip_shown', { total_annual_impact: impactAnnualEstimated });
            impactChipShownRef.current = true;
        }
    }, [impactAnnualEstimated, NAV_V2_ENABLED]);

    // Dismiss Starter badge when opening /quests
    useEffect(() => {
        if (location.pathname === '/quests' && showStarterBadge) {
            localStorage.setItem('starterBadgeDismissed', 'true');
            setShowStarterBadge(false);
            trackEvent('nav_starter_badge_dismissed', { reason: 'opened_quests' });
        }
    }, [location.pathname, showStarterBadge]);

    // Navigation items (V2 or V1)
    const getNavItems = (): NavItem[] => {
        if (NAV_V2_ENABLED) {
            return [
                {
                    path: '/dashboard',
                    icon: Home,
                    label: t('nav.dashboard') || 'Accueil',
                    a11yLabel: t('nav.a11y.home') || 'Go to Home',
                    key: 'dashboard',
                    badge: null
                },
                {
                    path: '/quests',
                    icon: Gamepad2,
                    label: t('nav.quests') || 'Quêtes',
                    a11yLabel: t('nav.a11y.quests') || 'Go to Quests',
                    key: 'quests',
                    badge: showStarterBadge ? { type: 'starter', label: '!' } : null
                },
                {
                    path: '/impact',
                    icon: BarChart3,
                    label: t('nav.impact') || 'Impact',
                    a11yLabel: t('nav.a11y.impact') || 'Go to Impact',
                    key: 'impact',
                    badge: null,
                    chip: null
                },
                {
                    path: '/profile',
                    icon: User,
                    label: t('nav.profile') || 'Profil',
                    a11yLabel: t('nav.a11y.profile') || 'Go to Profile',
                    key: 'profile',
                    badge: null
                }
            ];
        } else {
            // TODO: Type user properly when AuthContext is migrated
            const typedUser = user as { isPremium?: boolean; newQuests?: number } | null;
            const baseItems: NavItem[] = [
                {
                    path: '/dashboard',
                    icon: Home,
                    label: t('nav.dashboard') || 'Accueil',
                    key: 'dashboard',
                    badge: null
                },
                {
                    path: '/quests',
                    icon: Gamepad2,
                    label: t('nav.quests') || 'Quêtes',
                    key: 'quests',
                    badge: typedUser?.newQuests && typedUser.newQuests > 0
                        ? { count: typedUser.newQuests, type: 'new' }
                        : null
                }
            ];

            if (typedUser?.isPremium) {
                return [
                    ...baseItems,
                    {
                        path: '/profile',
                        icon: User,
                        label: t('nav.profile') || 'Profil',
                        key: 'profile',
                        badge: null
                    }
                ];
            } else {
                return [
                    ...baseItems,
                    {
                        path: '/premium',
                        icon: Crown,
                        label: t('nav.premium') || 'Premium',
                        key: 'premium',
                        badge: { type: 'premium' }
                    },
                    {
                        path: '/profile',
                        icon: User,
                        label: t('nav.profile') || 'Profil',
                        key: 'profile',
                        badge: null
                    }
                ];
            }
        }
    };

    const navItems = getNavItems();

    return (
        <div className="fixed left-4 right-4 z-50 max-w-md mx-auto pointer-events-none" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-[#222] rounded-3xl p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] pointer-events-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const currentPath = pendingPath ?? location.pathname;
                    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 relative
                ${isActive
                                    ? 'text-[#E2FF00] drop-shadow-[0_0_8px_rgba(226,255,0,0.5)] scale-110'
                                    : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
                                }
              `}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={item.a11yLabel || item.label}
                            onMouseEnter={() => setHoveredItem(item.key)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={(e) => {
                                if (!isActive) {
                                    e.preventDefault();
                                    setPendingPath(item.path);
                                    trackEvent('nav_tab_clicked', { tab: item.key });
                                    haptic.light();
                                    setTimeout(() => navigate(item.path), 140);
                                }
                            }}
                        >
                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />

                            {/* Active Dot Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-dot"
                                    className="absolute -bottom-2 w-1 h-1 bg-[#E5FF00] rounded-full shadow-[0_0_5px_#E5FF00]"
                                />
                            )}

                            {/* Badges */}
                            {item.badge && (
                                <div className={`
                  absolute -top-1 -right-1 
                  ${item.badge.type === 'starter' ? 'bg-[#E5FF00] text-black' : 'bg-red-500 text-white'}
                  w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#0A0A0A]
                `}>
                                    {item.badge.count || item.badge.label || '!'}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
