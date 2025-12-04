import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import French translations
import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frDashboard from '../locales/fr/dashboard.json';
import frQuests from '../locales/fr/quests.json';
import frProfile from '../locales/fr/profile.json';
import frHome from '../locales/fr/home.json';
import frPremium from '../locales/fr/premium.json';
import frOnboarding from '../locales/fr/onboarding.json';
import frImpact from '../locales/fr/impact.json';

// Import English translations
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enQuests from '../locales/en/quests.json';
import enProfile from '../locales/en/profile.json';
import enHome from '../locales/en/home.json';
import enPremium from '../locales/en/premium.json';
import enOnboarding from '../locales/en/onboarding.json';
import enImpact from '../locales/en/impact.json';

/**
 * i18n Configuration - Modular Namespaces
 * 
 * Usage in components:
 * ```
 * const { t } = useTranslation('dashboard');
 * t('categories.pilotage.title') // From dashboard.json
 * 
 * // Or with multiple namespaces
 * const { t } = useTranslation(['dashboard', 'common']);
 * t('common:actions.save') // From common.json
 * ```
 */

const resources = {
    fr: {
        common: frCommon,
        auth: frAuth,
        dashboard: frDashboard,
        quests: frQuests,
        profile: frProfile,
        home: frHome,
        premium: frPremium,
        onboarding: frOnboarding,
        impact: frImpact
    },
    en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        quests: enQuests,
        profile: enProfile,
        home: enHome,
        premium: enPremium,
        onboarding: enOnboarding,
        impact: enImpact
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'fr',
        fallbackLng: 'fr',
        defaultNS: 'common',
        ns: ['common', 'auth', 'dashboard', 'quests', 'profile', 'home', 'premium', 'onboarding', 'impact'],

        interpolation: {
            escapeValue: false
        },

        react: {
            useSuspense: false
        }
    });

export default i18n;
