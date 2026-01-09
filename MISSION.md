# MISSION.md — Guide de Création de Missions Moniyo

> Ce guide permet à Claude de scaffolder automatiquement une nouvelle mission complète.

---

## INSTRUCTIONS POUR CLAUDE

Quand l'utilisateur demande de créer une mission :

### PHASE 0 : UX REVIEW (Obligatoire)
1. Poser les questions de validation (voir section Phase 0)
2. Identifier le type de mission
3. Proposer le flow adapté
4. **Présenter le résumé et ATTENDRE la confirmation de l'utilisateur**

### PHASE 1 : SCAFFOLDING (Après validation)
1. Créer le dossier `src/features/quests/[pilier]/[nom-mission]/`
2. Scaffolder tous les fichiers dans l'ordre :
   - metadata.ts
   - insightData.ts
   - [NomMission]Flow.tsx
   - screens/ (selon le flow validé)
   - index.ts

### PHASE 2 : INTÉGRATION
1. Ajouter import dans `src/features/quests/registry.ts`
2. Ajouter traductions dans `src/locales/fr/quests.json` et `src/locales/en/quests.json`

### PHASE 3 : REVIEW
1. `npm run build` pour vérifier
2. Lister les fichiers créés
3. Proposer des optimisations si nécessaire

---

## PHASE 0 : UX REVIEW (Obligatoire avant de coder)

> Claude doit TOUJOURS exécuter cette phase avant de scaffolder une mission.

### 0.1 QUESTIONS À POSER À L'UTILISATEUR

Avant de coder, collecter ces informations :

| Question | Pourquoi c'est important |
|----------|--------------------------|
| Quel est l'objectif principal ? | Détermine le type de mission |
| L'utilisateur fait-il une action concrète hors de l'app ? | Écran ACTION nécessaire ou non |
| Comment mesure-t-on le succès ? | € économisés / Quiz réussi / Engagement pris |
| Y a-t-il plusieurs stratégies possibles ? | Si non → pas d'écran STRATÉGIE |
| L'impact € est-il réel ou potentiel ? | Réel = action faite / Potentiel = engagement requis |
| Combien d'inputs utilisateur sont nécessaires ? | Minimum = mieux |

### 0.2 VALIDATION DU TYPE DE MISSION

| Type | Critères | Impact comptabilisé |
|------|----------|---------------------|
| **Action** | L'utilisateur fait quelque chose de concret (annuler abo, ouvrir compte) | ✅ Oui (déclaratif) |
| **Habitude** | L'utilisateur s'engage à changer un comportement récurrent | ✅ Oui (si engagement) |
| **Éducation + Engagement** | L'utilisateur apprend + s'engage sur un objectif chiffré | ✅ Si "Je m'engage" / ❌ Si "Pas encore" |
| **Éducation pure** | L'utilisateur apprend un concept, pas d'action mesurable | ❌ Non, Badge + XP seulement |
| **Calculateur** | L'utilisateur calcule quelque chose (capacité d'emprunt, etc.) | Selon contexte |

### 0.3 FLOW PAR TYPE DE MISSION

| Type | Flow recommandé |
|------|-----------------|
| **Action pure** | CONTEXTE → MÉTHODE → CIBLE → STRATÉGIE → ACTION → IMPACT |
| **Habitude** | CONTEXTE → MÉTHODE → CIBLE → STRATÉGIE → IMPACT |
| **Éducation + Engagement** | CONTEXTE → MÉTHODE → CIBLE → DIAGNOSTIC → ENGAGEMENT → IMPACT |
| **Éducation pure** | CONTEXTE → MÉTHODE → QUIZ (optionnel) → BADGE |
| **Calculateur** | CONTEXTE → INPUTS → RÉSULTAT → IMPACT |

### 0.4 AUDIT DE CHAQUE ÉCRAN

Pour chaque écran prévu, valider sa nécessité :

| Écran | Question de validation | Si NON → Action |
|-------|------------------------|-----------------|
| CONTEXTE | Le problème est-il compris en 10 secondes ? | Simplifier le hook |
| MÉTHODE | Les étapes sont-elles actionnables (pas juste théoriques) ? | Reformuler ou skip si éducation pure |
| CIBLE | L'input demandé est-il le MINIMUM nécessaire ? | Réduire les champs |
| STRATÉGIE | Y a-t-il VRAIMENT plusieurs options ? | Skip si 1 seule option |
| ACTION | Y a-t-il un lien externe ou une action concrète ? | Skip si pas d'action externe |
| DIAGNOSTIC | L'utilisateur doit-il comparer idéal vs réalité ? | Skip si pas de comparaison |
| ENGAGEMENT | L'impact est-il crédible SANS engagement explicite ? | Skip si action déjà concrète |
| IMPACT | Le gain affiché reflète-t-il une VRAIE économie/action ? | Ajuster ou afficher Badge seulement |

### 0.5 RED FLAGS 🚩

**NE PAS scaffolder si :**

| Red Flag | Problème | Solution |
|----------|----------|----------|
| Impact € sans action concrète | Pas crédible, l'utilisateur n'a rien fait | Ajouter ENGAGEMENT ou retirer impact € |
| 6+ écrans pour mission simple | Over-engineered, friction inutile | Fusionner ou supprimer des écrans |
| Pas de "ouch moment" dans CONTEXTE | Pas engageant, abandon probable | Trouver une stat choc ou reformuler |
| MÉTHODE avec 4+ étapes | Trop complexe, cognitive overload | Simplifier à 3 max |
| Aucun équivalent concret possible | Impact abstrait, pas mémorable | Changer d'angle |
| STRATÉGIE avec 1 seule option | Écran inutile | Supprimer l'écran |
| ACTION sans lien externe | Écran vide | Fusionner avec IMPACT |

### 0.6 OUTPUT DE LA PHASE 0

Avant de scaffolder, Claude DOIT présenter ce résumé et attendre validation :

```
══════════════════════════════════════════════════════════
MISSION : [Nom de la mission]
══════════════════════════════════════════════════════════

TYPE IDENTIFIÉ : [Action / Habitude / Éducation + Engagement / Éducation pure / Calculateur]

FLOW PROPOSÉ :
  ✓ CONTEXTE — [Justification courte]
  ✓ MÉTHODE — [Justification courte]
  ✓ CIBLE — [Justification courte]
  ○ STRATÉGIE — [Inclus/Exclu + pourquoi]
  ○ ACTION — [Inclus/Exclu + pourquoi]
  ○ ENGAGEMENT — [Inclus/Exclu + pourquoi]
  ✓ IMPACT — [Justification courte]

DURÉE ESTIMÉE : [X min]

══════════════════════════════════════════════════════════
Confirmer ce flow avant scaffolding ? (Oui / Non / Ajuster)
══════════════════════════════════════════════════════════
```

> Claude attend la confirmation avant de passer à la Phase 1 (Scaffolding).

---

## CHECKLIST DE CRÉATION

```
[ ] 1. Créer le dossier: src/features/quests/[pilier]/[nom-mission]/
[ ] 2. Créer metadata.ts
[ ] 3. Créer insightData.ts
[ ] 4. Créer [NomMission]Flow.tsx
[ ] 5. Créer screens/ProtocolScreen.tsx
[ ] 6. Créer screens/ExecutionScreen.tsx
[ ] 7. Créer screens/DebriefScreen.tsx
[ ] 8. Créer index.ts
[ ] 9. Ajouter au registry.ts
[ ] 10. Ajouter traductions fr/en
[ ] 11. npm run build
[ ] 12. Test manuel
```

---

## ARCHITECTURE FICHIERS

```
src/features/quests/[pilier]/[nom-mission]/
├── index.ts                    # Exports
├── metadata.ts                 # ID, XP, category, colors, i18nKey
├── insightData.ts              # Stats, tips, calculs, impacts
├── [NomMission]Flow.tsx        # Orchestrateur 3 phases
└── screens/
    ├── ProtocolScreen.tsx      # Contexte + Méthode
    ├── ExecutionScreen.tsx     # Cible + Stratégie + Action
    └── DebriefScreen.tsx       # Impact + Récompenses
```

---

## TYPES DE MISSIONS

| Type | Exemple | Écrans | Impact comptabilisé | XP |
|------|---------|--------|---------------------|-----|
| **Action** | La Purge | 6 (avec ACTION) | ✅ Oui (déclaratif) | 120-140 |
| **Habitude** | Traque Invisible | 5 (sans ACTION) | ✅ Oui (engagement) | 100-120 |
| **Éducation + Engagement** | Budget 50/30/20 | 6 (avec ENGAGEMENT) | ✅ Si "Je m'engage" / ❌ Si "Pas encore" | 100-120 / 60-80 |
| **Éducation pure** | C'est quoi un ETF ? | 3-4 (sans IMPACT €) | ❌ Badge + XP seulement | 40-60 |
| **Calculateur** | Capacité d'épargne | 4-5 | Selon contexte | 60-80 |

---

## QUAND AJOUTER UN ÉCRAN ENGAGEMENT ?

| Situation | Écran ENGAGEMENT ? |
|-----------|-------------------|
| L'utilisateur choisit une STRATÉGIE active (Stopper, Réduire, etc.) | ❌ Non — Le choix EST l'engagement |
| L'utilisateur fait uniquement des INPUTS passifs (chiffres, infos) | ✅ Oui — Engagement explicite requis |
| L'utilisateur fait une ACTION externe (annuler un abo via lien) | ❌ Non — L'action EST l'engagement |

**Exemples concrets :**

| Mission | Choix actif ? | Engagement explicite ? |
|---------|---------------|------------------------|
| La Purge | ✅ Stratégie + Action externe | ❌ Non nécessaire |
| Traque Invisible | ✅ Stratégie (Stopper/Réduire) | ❌ Non nécessaire |
| Budget 50/30/20 | ❌ Juste des inputs | ✅ Oui nécessaire |
| C'est quoi un ETF ? | ❌ Aucun | ❌ Non (pas d'impact €) |

---

## TEMPLATE: metadata.ts

```typescript
/**
 * [NOM MISSION] Quest Metadata
 */
import icon from './assets/icon.png'; // ou créer un placeholder

export const [nomMission]Quest = {
    // Identification
    id: '[nom-mission]',              // kebab-case unique
    category: 'budget',               // budget|savings|debt|investing|income|planning
    country: 'fr-FR',
    difficulty: 'beginner',           // beginner|intermediate|advanced|expert
    duration: 6,                      // minutes estimées
    xp: 120,                          // XP reward
    isPremium: false,
    starterPack: false,               // true si mission d'onboarding
    order: 10,                        // ordre d'affichage dans la catégorie

    // i18n
    i18nKey: '[nomMission]',          // camelCase pour les traductions

    // Metadata
    metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        author: 'Moniyo Team',
        tags: ['starter', 'budgeting'],
        relatedQuests: [],
        averageCompletionTime: 6,
        completionRate: 0.85,
        userRating: 4.8,
        featured: false
    },

    // Impact estimé
    estimatedImpact: {
        amount: 50,                   // économie mensuelle typique
        period: 'month'               // 'month' | 'year' | 'once'
    },

    // Visuel
    icons: {
        main: icon
    },

    // Couleurs (Tailwind)
    colors: {
        primary: '#E2FF00',           // Volt yellow par défaut
        secondary: '#10B981',         // Emerald
        accent: '#E2FF00',
        background: 'from-neutral-900 to-black',
        darkBackground: 'from-neutral-900/20 to-black/20'
    },

    // Récompenses
    rewards: {
        badge: '[nom_badge]',         // ID du badge débloqué
        unlocks: []                   // Quêtes débloquées après
    }
};

export default [nomMission]Quest;
```

---

## TEMPLATE: insightData.ts

```typescript
/**
 * Insight Data - [NOM MISSION]
 */

// ===== SOCIAL PROOF (Protocol Screen - Page 0) =====
export const socialProofSlides = {
    fr: [
        {
            id: 'stat-1',
            title: 'TITRE CHOC',
            badge: 'BADGE',
            badgeColor: 'orange',        // orange|blue|purple|amber|volt
            stat: '75%',                 // Nombre impressionnant
            text: "des Français font cette erreur. Et toi ?",
            source: 'Source 2024'
        },
        {
            id: 'stat-2',
            title: 'IMPACT CACHÉ',
            badge: 'IMPACT',
            badgeColor: 'amber',
            stat: '2 400€',
            text: "perdus en moyenne chaque année à cause de ce problème.",
            source: 'Étude 2023'
        },
        {
            id: 'stat-3',
            title: 'LA SOLUTION',
            badge: 'MÉTHODE',
            badgeColor: 'volt',
            stat: '5 min',
            text: "suffisent pour reprendre le contrôle.",
            source: 'Moniyo'
        }
    ],
    en: [
        {
            id: 'stat-1',
            title: 'SHOCKING TITLE',
            badge: 'BADGE',
            badgeColor: 'orange',
            stat: '75%',
            text: "of people make this mistake. And you?",
            source: 'Source 2024'
        },
        {
            id: 'stat-2',
            title: 'HIDDEN IMPACT',
            badge: 'IMPACT',
            badgeColor: 'amber',
            stat: '€2,400',
            text: "lost on average every year because of this problem.",
            source: 'Study 2023'
        },
        {
            id: 'stat-3',
            title: 'THE SOLUTION',
            badge: 'METHOD',
            badgeColor: 'volt',
            stat: '5 min',
            text: "are enough to take back control.",
            source: 'Moniyo'
        }
    ]
};

// ===== PRO TIPS (Protocol Screen - Page 1) =====
export const proTips = {
    fr: [
        {
            id: 'step-1',
            title: 'ÉTAPE 1',
            iconName: 'Search',          // Lucide icon name
            body: "Description de la première étape. **Texte en gras** pour l'emphase."
        },
        {
            id: 'step-2',
            title: 'ÉTAPE 2',
            iconName: 'Calculator',
            body: "Description de la deuxième étape avec un **exemple concret**."
        },
        {
            id: 'step-3',
            title: 'ÉTAPE 3',
            iconName: 'Target',
            body: "Description de la troisième étape. **Action finale** à réaliser."
        }
    ],
    en: [
        {
            id: 'step-1',
            title: 'STEP 1',
            iconName: 'Search',
            body: "Description of the first step. **Bold text** for emphasis."
        },
        {
            id: 'step-2',
            title: 'STEP 2',
            iconName: 'Calculator',
            body: "Description of the second step with a **concrete example**."
        },
        {
            id: 'step-3',
            title: 'STEP 3',
            iconName: 'Target',
            body: "Description of the third step. **Final action** to take."
        }
    ]
};

// ===== CONCRETE IMPACT (Debrief Screen) =====
export const getConcreteImpact = (amount: number, locale: string = 'fr') => {
    const impacts = {
        fr: [
            {
                maxAmount: 50,
                icon: '☕',
                iconName: 'Coffee',
                text: "C'est **{value} cafés** gratuits par mois.",
                compute: (amt: number) => ({ value: Math.floor(amt / 4) })
            },
            {
                maxAmount: 100,
                icon: '🍽️',
                iconName: 'UtensilsCrossed',
                text: "C'est **un dîner au restaurant** pour 2.",
                compute: () => ({})
            },
            {
                maxAmount: 300,
                icon: '✈️',
                iconName: 'Plane',
                text: "C'est **un weekend city-trip** chaque année.",
                compute: () => ({})
            },
            {
                maxAmount: 600,
                icon: '📱',
                iconName: 'Smartphone',
                text: "C'est **un iPhone** tous les 2 ans.",
                compute: () => ({})
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                iconName: 'Rocket',
                text: "C'est **un investissement majeur** chaque année.",
                compute: () => ({})
            }
        ],
        en: [
            {
                maxAmount: 50,
                icon: '☕',
                iconName: 'Coffee',
                text: "That's **{value} free coffees** per month.",
                compute: (amt: number) => ({ value: Math.floor(amt / 4) })
            },
            {
                maxAmount: 100,
                icon: '🍽️',
                iconName: 'UtensilsCrossed',
                text: "That's **a restaurant dinner** for 2.",
                compute: () => ({})
            },
            {
                maxAmount: 300,
                icon: '✈️',
                iconName: 'Plane',
                text: "That's **a city-trip weekend** every year.",
                compute: () => ({})
            },
            {
                maxAmount: 600,
                icon: '📱',
                iconName: 'Smartphone',
                text: "That's **an iPhone** every 2 years.",
                compute: () => ({})
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                iconName: 'Rocket',
                text: "That's **a major investment** every year.",
                compute: () => ({})
            }
        ]
    };

    const list = impacts[locale] || impacts.fr;
    const match = list.find(item => amount <= item.maxAmount);

    if (!match) return { icon: '💰', iconName: 'Gift', text: '' };

    const computed = match.compute(amount);
    let finalText = match.text;

    Object.entries(computed).forEach(([key, value]) => {
        finalText = finalText.replace(`{${key}}`, String(value));
    });

    return { icon: match.icon, iconName: match.iconName, text: finalText };
};

// ===== COMPOUND GROWTH CALCULATION =====
export const calculateCompoundGrowth = (monthlyAmount: number, years: number = 5, rate: number = 0.07): number => {
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
};

export default {
    socialProofSlides,
    proTips,
    getConcreteImpact,
    calculateCompoundGrowth
};
```

---

## TEMPLATE: [NomMission]Flow.tsx

```typescript
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft } from 'lucide-react';
import ProtocolScreen from './screens/ProtocolScreen';
import ExecutionScreen from './screens/ExecutionScreen';
import DebriefScreen from './screens/DebriefScreen';
import { trackEvent } from '../../../../utils/analytics';
import { fullscreenVariants, TRANSITIONS, EASE } from '../../../../styles/animationConstants';
import { haptic } from '../../../../utils/haptics';

/** Quest metadata */
interface QuestMeta {
    id?: string;
    xp?: number;
    xpReward?: number;
    title?: string;
}

/** User progress data */
interface UserProgressData {
    streak?: number;
    xpProgress?: number;
    [key: string]: unknown;
}

/** Completion result data */
interface CompletionResult {
    questId: string;
    // Ajouter les champs spécifiques à la mission
    xpEarned: number;
    completedAt: string;
}

/** Props */
interface [NomMission]FlowProps {
    quest?: QuestMeta;
    onComplete: (result: CompletionResult) => void;
    onClose: () => void;
    userProgress?: UserProgressData;
}

// Fade-only transition for stability
const mainScreenVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const [NomMission]Flow: React.FC<[NomMission]FlowProps> = ({
    quest = {},
    onComplete,
    onClose,
    userProgress = {}
}) => {
    const { t, i18n } = useTranslation(['quests', 'common']);
    const locale = i18n.language;

    // Phase state
    const [phase, setPhase] = useState('PROTOCOL');

    // Navigation states
    const [protocolPage, setProtocolPage] = useState(0);
    const [executionStep, setExecutionStep] = useState('revelation');

    // Quest data
    const [questData, setQuestData] = useState({
        // Champs spécifiques à la mission
        amount: 0,
        ...userProgress
    });

    // Phase labels
    const phaseLabels = {
        PROTOCOL: { fr: 'CODENAME', en: 'CODENAME' },
        EXECUTION: { fr: 'CODENAME', en: 'CODENAME' },
        DEBRIEF: { fr: 'CODENAME', en: 'CODENAME' }
    };

    // Step titles
    const getStepTitle = () => {
        if (phase === 'PROTOCOL') {
            if (protocolPage === 0) return { fr: 'CONTEXTE', en: 'CONTEXT' };
            return { fr: 'MÉTHODE', en: 'METHOD' };
        }
        if (phase === 'EXECUTION') {
            if (executionStep === 'revelation') return { fr: 'CIBLE', en: 'TARGET' };
            return { fr: 'STRATÉGIE', en: 'STRATEGY' };
        }
        return { fr: 'IMPACT', en: 'IMPACT' };
    };

    // Progress bar (ajuster selon le nombre d'étapes)
    const getProgressWidth = () => {
        if (phase === 'PROTOCOL') {
            return protocolPage === 0 ? '20%' : '40%';
        }
        if (phase === 'EXECUTION') {
            return executionStep === 'revelation' ? '60%' : '80%';
        }
        return '100%';
    };

    // Update data
    const handleUpdateData = useCallback((newData: Partial<typeof questData>) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // Navigation
    const handleBack = useCallback(() => {
        haptic.light();

        if (phase === 'PROTOCOL' && protocolPage === 1) {
            setProtocolPage(0);
        } else if (phase === 'EXECUTION') {
            if (executionStep === 'challenge') {
                setExecutionStep('revelation');
            } else {
                setPhase('PROTOCOL');
                setProtocolPage(1);
            }
        }
    }, [phase, protocolPage, executionStep]);

    const goToExecution = useCallback(() => {
        haptic.medium();
        trackEvent('quest_phase_completed', {
            quest_id: '[nom-mission]',
            phase: 'PROTOCOL'
        });
        setPhase('EXECUTION');
        setExecutionStep('revelation');
    }, []);

    const goToDebrief = useCallback(() => {
        haptic.heavy();
        trackEvent('quest_phase_completed', {
            quest_id: '[nom-mission]',
            phase: 'EXECUTION'
        });
        setPhase('DEBRIEF');
    }, []);

    const showBackButton = (phase === 'PROTOCOL' && protocolPage === 1) || (phase === 'EXECUTION');

    // Completion
    const handleComplete = () => {
        trackEvent('quest_completed', {
            quest_id: '[nom-mission]',
            // Ajouter données spécifiques
        });

        onComplete({
            questId: '[nom-mission]',
            xpEarned: quest.xp || 120,
            completedAt: new Date().toISOString()
        });
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#050505]"
            style={{
                background: 'radial-gradient(circle at 50% 30%, #111111 0%, #050505 60%, #000000 100%)'
            }}
            {...fullscreenVariants.enter}
            transition={TRANSITIONS.overlayEntry}
        >
            {/* Texture Overlay */}
            <div
                className="fixed top-0 left-0 w-full h-screen opacity-[0.03] pointer-events-none z-[1]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zzM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}
            />

            {/* Main Container */}
            <motion.div
                {...fullscreenVariants.content}
                transition={{ duration: TRANSITIONS.modalEntry.duration, ease: EASE.outExpo }}
                className="w-full h-full min-h-screen bg-transparent overflow-hidden relative flex flex-col z-10"
            >
                {/* Progress Bar */}
                <div className="absolute left-0 h-1 bg-neutral-800 w-full z-50" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
                    <motion.div
                        className="h-full bg-volt transition-all duration-500 ease-out shadow-[0_0_10px_rgba(226,255,0,0.4)]"
                        initial={{ width: '0%' }}
                        animate={{ width: getProgressWidth() }}
                    />
                </div>

                {/* Header */}
                <div
                    className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-40"
                    style={{
                        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.75rem)',
                        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%)',
                        backdropFilter: 'blur(1px)',
                        WebkitBackdropFilter: 'blur(1px)'
                    }}
                >
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <AnimatePresence mode="popLayout">
                            {showBackButton && (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                        opacity: { duration: 0.15 },
                                        layout: { duration: 0.3, ease: "easeOut" }
                                    }}
                                    onClick={handleBack}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors active:scale-95"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <motion.div layout className="overflow-hidden">
                            {/* Codename */}
                            <span className="font-mono text-[11px] text-volt tracking-wide uppercase block">
                                {phaseLabels[phase]?.[locale] || phaseLabels[phase]?.fr}
                            </span>
                            {/* Step Title */}
                            <div className="h-9 mt-1 overflow-hidden pt-2 -mt-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${phase}-${protocolPage}-${executionStep}-title-wrapper`}
                                        className="h-full"
                                    >
                                        <motion.h2
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '-150%' }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            className="font-sans font-black text-2xl text-white leading-none tracking-tight"
                                            style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.4)' }}
                                        >
                                            {getStepTitle()[locale] || getStepTitle().fr}
                                        </motion.h2>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/10"
                        aria-label={t('common:close')}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 7rem)' }}>
                    <AnimatePresence mode="wait">
                        {phase === 'PROTOCOL' && (
                            <motion.div
                                key="protocol"
                                variants={mainScreenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className="h-full quest-screen"
                            >
                                <ProtocolScreen
                                    onNext={goToExecution}
                                    page={protocolPage}
                                    setPage={setProtocolPage}
                                />
                            </motion.div>
                        )}

                        {phase === 'EXECUTION' && (
                            <motion.div
                                key="execution"
                                variants={mainScreenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className="h-full quest-screen"
                            >
                                <ExecutionScreen
                                    data={questData}
                                    onUpdate={handleUpdateData}
                                    onNext={goToDebrief}
                                    step={executionStep}
                                    setStep={setExecutionStep}
                                />
                            </motion.div>
                        )}

                        {phase === 'DEBRIEF' && (
                            <motion.div
                                key="debrief"
                                variants={mainScreenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="h-full quest-screen"
                            >
                                <DebriefScreen
                                    data={questData}
                                    xpReward={quest.xp ?? quest.xpReward ?? 120}
                                    currentStreak={userProgress.streak ?? 1}
                                    onComplete={handleComplete}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default [NomMission]Flow;
```

---

## TEMPLATE: screens/ProtocolScreen.tsx

```typescript
import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { socialProofSlides, proTips } from '../insightData';
import { haptic } from '../../../../../utils/haptics';

interface ProtocolScreenProps {
    onNext: () => void;
    page: number;
    setPage: (page: number) => void;
}

const ProtocolScreen: React.FC<ProtocolScreenProps> = ({ onNext, page, setPage }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);
    const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

    // Get localized data
    const slides = socialProofSlides[locale] || socialProofSlides.fr;
    const tips = proTips[locale] || proTips.fr;

    // Auto-rotate carousel
    useEffect(() => {
        if (page === 0) {
            autoSlideRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
            }, 10000);
        }
        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [page, slides.length]);

    // Labels
    const labels = {
        fr: {
            contextCta: 'VOIR LA MÉTHODE',
            methodCta: 'COMMENCER'
        },
        en: {
            contextCta: 'SEE METHOD',
            methodCta: 'START'
        }
    };
    const L = labels[locale] || labels.fr;

    // Render bold text
    const renderWithBold = (text: string): ReactNode[] => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-white font-semibold">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // Get Lucide icon
    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as Record<string, React.ElementType>)[iconName];
        return Icon ? <Icon className="w-5 h-5 text-volt" /> : null;
    };

    // Page variants
    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <div className="h-full flex flex-col">
            <AnimatePresence mode="wait">
                {/* PAGE 0: CONTEXT */}
                {page === 0 && (
                    <motion.div
                        key="context"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 pt-2 pb-32">
                                {/* Stats Carousel */}
                                <div className="mb-6">
                                    {/* Progress dots */}
                                    <div className="flex gap-1 mb-4">
                                        {slides.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className="h-1 flex-1 rounded-full bg-neutral-800 overflow-hidden cursor-pointer"
                                                onClick={() => setCurrentSlide(idx)}
                                            >
                                                <motion.div
                                                    className="h-full bg-volt"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: idx === currentSlide ? '100%' : idx < currentSlide ? '100%' : '0%' }}
                                                    transition={{ duration: idx === currentSlide ? 10 : 0.3 }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Slide content */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentSlide}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-neutral-900/60 border border-white/5 rounded-2xl p-5"
                                        >
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide mb-3 bg-${slides[currentSlide].badgeColor}-500/20 text-${slides[currentSlide].badgeColor}-400`}>
                                                {slides[currentSlide].badge}
                                            </span>
                                            <div className="text-4xl font-black text-volt mb-2">
                                                {slides[currentSlide].stat}
                                            </div>
                                            <p className="text-sm text-neutral-300 leading-relaxed">
                                                {slides[currentSlide].text}
                                            </p>
                                            <p className="text-[10px] text-neutral-600 mt-2">
                                                {slides[currentSlide].source}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    haptic.medium();
                                    setPage(1);
                                }}
                                className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                            >
                                <span className="cta-content cta-content-animate">
                                    {L.contextCta}
                                    <ChevronRight className="w-5 h-5" />
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* PAGE 1: METHOD */}
                {page === 1 && (
                    <motion.div
                        key="method"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 pt-2 pb-32">
                                {/* Timeline */}
                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-800" />

                                    {tips.map((tip, index) => (
                                        <motion.div
                                            key={tip.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                            className="relative flex gap-4 mb-6"
                                        >
                                            {/* Circle */}
                                            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center z-10">
                                                {getIcon(tip.iconName)}
                                            </div>

                                            {/* Card */}
                                            <div className="flex-1 bg-neutral-900/60 border border-white/5 rounded-xl p-4">
                                                <h3 className="font-mono text-[11px] text-volt uppercase tracking-wide mb-2">
                                                    {tip.title}
                                                </h3>
                                                <p className="text-sm text-neutral-300 leading-relaxed">
                                                    {renderWithBold(tip.body)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    haptic.heavy();
                                    onNext();
                                }}
                                className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                            >
                                <span className="cta-content cta-content-animate">
                                    <Zap className="w-5 h-5" />
                                    {L.methodCta}
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProtocolScreen;
```

---

## TEMPLATE: screens/ExecutionScreen.tsx

```typescript
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, ChevronRight } from 'lucide-react';
import { haptic } from '../../../../../utils/haptics';

interface QuestData {
    amount?: number;
    [key: string]: unknown;
}

interface ExecutionScreenProps {
    data: QuestData;
    onUpdate: (data: Partial<QuestData>) => void;
    onNext: () => void;
    step: string;
    setStep: (step: string) => void;
}

const ExecutionScreen: React.FC<ExecutionScreenProps> = ({
    data,
    onUpdate,
    onNext,
    step,
    setStep
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Local state
    const [inputValue, setInputValue] = useState(data.amount?.toString() || '');

    // Validation
    const isValid = useMemo(() => {
        const num = parseFloat(inputValue);
        return !isNaN(num) && num > 0;
    }, [inputValue]);

    // Labels
    const labels = {
        fr: {
            inputLabel: 'MONTANT',
            inputPlaceholder: '0.00',
            currency: '€',
            revelationCta: 'CONTINUER',
            challengeCta: 'VOIR MON IMPACT'
        },
        en: {
            inputLabel: 'AMOUNT',
            inputPlaceholder: '0.00',
            currency: '€',
            revelationCta: 'CONTINUE',
            challengeCta: 'SEE MY IMPACT'
        }
    };
    const L = labels[locale] || labels.fr;

    // Step variants
    const stepVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
        setInputValue(value);
    };

    // Handle next step
    const handleNext = () => {
        haptic.medium();
        const amount = parseFloat(inputValue);
        onUpdate({ amount });

        if (step === 'revelation') {
            setStep('challenge');
        } else {
            onNext();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <AnimatePresence mode="wait">
                {/* STEP: REVELATION */}
                {step === 'revelation' && (
                    <motion.div
                        key="revelation"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 pt-2 pb-32">
                                {/* Input Card */}
                                <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-5">
                                    <label className="block font-mono text-[11px] text-neutral-500 uppercase tracking-wide mb-3">
                                        {L.inputLabel}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            placeholder={L.inputPlaceholder}
                                            className="flex-1 bg-transparent text-4xl font-black text-white outline-none placeholder-neutral-700"
                                            style={{ caretColor: '#E2FF00' }}
                                        />
                                        <span className="text-2xl text-neutral-500">{L.currency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleNext}
                                disabled={!isValid}
                                className={`w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] cta-ios-fix ${
                                    isValid
                                        ? 'bg-volt text-black border-black cta-active'
                                        : 'bg-neutral-800 text-neutral-500 border-neutral-700 cta-inactive'
                                }`}
                            >
                                <span className="cta-content cta-content-animate">
                                    {L.revelationCta}
                                    <ChevronRight className="w-5 h-5" />
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* STEP: CHALLENGE */}
                {step === 'challenge' && (
                    <motion.div
                        key="challenge"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 pt-2 pb-32">
                                {/* Recap Card */}
                                <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-5 text-center">
                                    <span className="font-mono text-[11px] text-neutral-500 uppercase">
                                        TON MONTANT
                                    </span>
                                    <div className="text-4xl font-black text-volt mt-2">
                                        {data.amount?.toLocaleString('fr-FR')} €
                                    </div>
                                </div>

                                {/* Add more challenge UI here */}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    haptic.heavy();
                                    onNext();
                                }}
                                className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                            >
                                <span className="cta-content cta-content-animate">
                                    <Zap className="w-5 h-5" />
                                    {L.challengeCta}
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExecutionScreen;
```

---

## TEMPLATE: screens/EngagementScreen.tsx (Pour missions Éducation + Engagement)

```typescript
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { haptic } from '../../../../../utils/haptics';

interface EngagementScreenProps {
    potentialAmount: number;
    onCommit: () => void;
    onSkip: () => void;
}

/**
 * EngagementScreen - Écran d'engagement explicite
 *
 * Utilisé uniquement pour les missions "Éducation + Engagement"
 * où l'utilisateur n'a pas fait d'action concrète mais peut s'engager.
 *
 * - onCommit() → IMPACT avec impact comptabilisé + XP complet
 * - onSkip() → IMPACT avec Badge seulement + XP réduit
 */
const EngagementScreen: React.FC<EngagementScreenProps> = ({
    potentialAmount,
    onCommit,
    onSkip
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    const labels = {
        fr: {
            title: 'TU T\'ENGAGES ?',
            subtitle: 'TU PEUX RÉCUPÉRER',
            perMonth: '/ mois',
            perYear: '/ an',
            description: 'En appliquant cette méthode, tu récupères cet argent chaque mois.',
            commitCta: 'JE M\'ENGAGE',
            skipCta: 'Pas encore'
        },
        en: {
            title: 'DO YOU COMMIT?',
            subtitle: 'YOU CAN RECOVER',
            perMonth: '/ month',
            perYear: '/ year',
            description: 'By applying this method, you recover this money every month.',
            commitCta: 'I COMMIT',
            skipCta: 'Not yet'
        }
    };
    const L = labels[locale] || labels.fr;

    const monthlyAmount = potentialAmount;
    const yearlyAmount = potentialAmount * 12;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32 flex flex-col items-center justify-center min-h-full">

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-sm text-neutral-400 uppercase tracking-wide mb-8"
                    >
                        {L.title}
                    </motion.h2>

                    {/* Amount Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-neutral-900/60 border border-white/10 rounded-3xl p-8 text-center mb-6 w-full max-w-sm"
                    >
                        <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide block mb-2">
                            {L.subtitle}
                        </span>

                        <div className="text-5xl font-black text-volt mb-1">
                            +{monthlyAmount.toLocaleString('fr-FR')} €
                        </div>
                        <span className="text-sm text-neutral-500">{L.perMonth}</span>

                        <div className="h-px bg-neutral-800 my-4" />

                        <div className="text-2xl font-bold text-white">
                            +{yearlyAmount.toLocaleString('fr-FR')} €
                        </div>
                        <span className="text-sm text-neutral-500">{L.perYear}</span>
                    </motion.div>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-neutral-400 text-center max-w-xs"
                    >
                        {L.description}
                    </motion.p>
                </div>
            </div>

            {/* CTAs */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        haptic.heavy();
                        onCommit();
                    }}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active mb-3"
                >
                    <span className="cta-content cta-content-animate">
                        <Zap className="w-5 h-5" />
                        {L.commitCta}
                    </span>
                </motion.button>

                <button
                    onClick={() => {
                        haptic.light();
                        onSkip();
                    }}
                    className="w-full text-neutral-500 font-medium text-sm py-2 hover:text-neutral-300 transition-colors"
                >
                    {L.skipCta} →
                </button>
            </div>
        </div>
    );
};

export default EngagementScreen;
```

**Usage dans le Flow :**
- `onCommit()` → Passe à IMPACT avec impact comptabilisé + XP complet
- `onSkip()` → Passe à IMPACT avec Badge seulement + XP réduit (ex: 60 au lieu de 120)

---

## TEMPLATE: screens/DebriefScreen.tsx

```typescript
import { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2, TrendingUp, Zap, Flame, Sparkles,
    Coffee, UtensilsCrossed, Plane, Smartphone, Rocket, Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getConcreteImpact, calculateCompoundGrowth } from '../insightData';
import { haptic } from '../../../../../utils/haptics';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
    Coffee, UtensilsCrossed, Plane, Smartphone, Rocket, Gift
};

const getIconComponent = (iconName?: string): React.ElementType => {
    if (!iconName) return Gift;
    return ICON_MAP[iconName] || Gift;
};

interface QuestData {
    amount?: number;
    [key: string]: unknown;
}

interface DebriefScreenProps {
    data: QuestData;
    xpReward?: number;
    currentStreak?: number;
    onComplete: () => void;
}

const DebriefScreen: React.FC<DebriefScreenProps> = ({
    data,
    xpReward = 120,
    currentStreak = 1,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Calculations
    const monthlyAmount = data.amount || 0;
    const yearlyAmount = monthlyAmount * 12;
    const fiveYearAmount = calculateCompoundGrowth(monthlyAmount, 5, 0.07);
    const concreteImpact = getConcreteImpact(yearlyAmount, locale);

    // Animation states
    const [animatedAmount, setAnimatedAmount] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // Celebration on mount
    useEffect(() => {
        haptic.success();

        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E2FF00', '#FFFFFF', '#10B981'],
            startVelocity: 35,
            gravity: 1.2,
            scalar: 1.1,
            ticks: 150
        });

        // Counter animation (800ms standard)
        const end = Math.round(yearlyAmount);
        const duration = 800;
        const increment = end / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setAnimatedAmount(end);
                clearInterval(timer);
                setTimeout(() => setShowContent(true), 200);
            } else {
                setAnimatedAmount(Math.round(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [yearlyAmount]);

    // Render bold text
    const renderWithBold = (text: string): ReactNode[] => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-white font-semibold">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // Labels
    const labels = {
        fr: {
            goalLabel: 'GAIN ANNUEL ESTIMÉ',
            equivalent: 'CONCRÈTEMENT',
            monthlyLabel: 'PAR MOIS',
            projectionLabel: 'POTENTIEL 5 ANS',
            projectionDesc: 'Si réinvesti à 7%/an',
            xpLabel: 'RÉCOMPENSES',
            streakLabel: 'SÉRIE',
            cta: 'MISSION ACCOMPLIE'
        },
        en: {
            goalLabel: 'ESTIMATED YEARLY GAIN',
            equivalent: 'IN REAL TERMS',
            monthlyLabel: 'PER MONTH',
            projectionLabel: '5-YEAR POTENTIAL',
            projectionDesc: 'If reinvested at 7%/year',
            xpLabel: 'REWARDS',
            streakLabel: 'STREAK',
            cta: 'MISSION ACCOMPLISHED'
        }
    };
    const L = labels[locale] || labels.fr;

    const IconComponent = getIconComponent(concreteImpact.iconName);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32">
                    {/* Hero */}
                    <div className="text-center mb-8 pt-4">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="font-mono text-[12px] text-neutral-500 uppercase tracking-wide mb-2 block"
                        >
                            {L.goalLabel}
                        </motion.span>

                        <motion.h2
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'backOut', delay: 0.15 }}
                            className="text-5xl md:text-6xl font-black text-volt tracking-tighter"
                            style={{ textShadow: '0 0 30px rgba(226, 255, 0, 0.5)' }}
                        >
                            +{animatedAmount.toLocaleString('fr-FR')} €
                        </motion.h2>
                    </div>

                    {/* Cards */}
                    <AnimatePresence>
                        {showContent && (
                            <div className="space-y-3">
                                {/* Impact Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-volt/10 flex items-center justify-center flex-shrink-0">
                                            <IconComponent className="w-6 h-6 text-volt" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-1">
                                                {L.equivalent}
                                            </span>
                                            <span className="text-sm font-bold text-white block leading-tight">
                                                {renderWithBold(concreteImpact.text)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Projection Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.04 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-neutral-500" />
                                            <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                {L.monthlyLabel}
                                            </span>
                                        </div>
                                        <span className="font-mono text-xl font-bold text-white">
                                            +{monthlyAmount.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-volt" />
                                            <div className="text-left">
                                                <div className="font-mono text-[11px] text-white font-bold uppercase">
                                                    {L.projectionLabel}
                                                </div>
                                                <div className="font-mono text-[10px] text-neutral-400">
                                                    {L.projectionDesc}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-mono text-lg font-bold text-emerald-400">
                                            +{fiveYearAmount.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Rewards Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.08 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-3">
                                        {L.xpLabel}
                                    </span>
                                    <div className="flex items-center">
                                        <div className="flex-1 flex items-center justify-center gap-2 border-r border-neutral-800 pr-4">
                                            <Zap className="w-5 h-5 text-volt" />
                                            <span className="font-mono text-lg font-bold text-white">
                                                +{xpReward} XP
                                            </span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center gap-2 pl-4">
                                            <Flame className="w-5 h-5 text-orange-500" />
                                            <span className="font-mono text-lg font-bold text-white">
                                                {L.streakLabel}
                                            </span>
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 25 }}
                                                className="font-mono text-sm font-bold text-orange-500 bg-orange-500/20 px-2 py-0.5 rounded"
                                            >
                                                +1
                                            </motion.span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        haptic.heavy();
                        onComplete();
                    }}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                >
                    <span className="cta-content cta-content-animate">
                        <CheckCircle2 className="w-5 h-5" />
                        {L.cta}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default DebriefScreen;
```

---

## TEMPLATE: index.ts

```typescript
/**
 * [NOM MISSION] Quest
 */

export { default as [NomMission]Flow } from './[NomMission]Flow';
export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';
export { default as [nomMission]Quest } from './metadata';
export {
    socialProofSlides,
    proTips,
    getConcreteImpact,
    calculateCompoundGrowth
} from './insightData';
```

---

## INTÉGRATION REGISTRY

### src/features/quests/registry.ts

```typescript
// Ajouter l'import
import { [nomMission]Quest } from './[pilier]/[nom-mission]/metadata.js';

// Ajouter à allQuests
export const allQuests: Quest[] = [
    // ... autres quêtes
    [nomMission]Quest as Quest,
];
```

---

## TRADUCTIONS

### src/locales/fr/quests.json

```json
{
  "[nomMission]": {
    "codename": "CODENAME",
    "title": "Titre de la mission",
    "description": "Description courte mais engageante de la mission...",
    "objectives": [
      "Premier objectif",
      "Deuxième objectif",
      "Troisième objectif"
    ],
    "prerequisites": ["Aucun"]
  }
}
```

### src/locales/en/quests.json

```json
{
  "[nomMission]": {
    "codename": "CODENAME",
    "title": "Mission title",
    "description": "Short but engaging mission description...",
    "objectives": [
      "First objective",
      "Second objective",
      "Third objective"
    ],
    "prerequisites": ["None"]
  }
}
```

---

## PATTERNS UI

### Couleurs
- **Volt (accent)**: `#E2FF00` / `text-volt` / `bg-volt`
- **Fond principal**: `bg-[#050505]`
- **Cards**: `bg-neutral-900/60 border border-white/5`
- **Texte principal**: `text-white`
- **Texte secondaire**: `text-neutral-400`
- **Labels**: `text-neutral-500`
- **Succès**: `text-emerald-400`
- **Alerte**: `text-orange-500`

### Typography
- **Labels**: `font-mono text-[11px] uppercase tracking-wide`
- **Titres écran**: `font-sans font-black text-2xl`
- **Hero numbers**: `text-5xl md:text-6xl font-black`
- **Corps**: `text-sm text-neutral-300`

### Composants
- **CTA actif**: `bg-volt text-black border-[3px] border-black`
- **CTA inactif**: `bg-neutral-800 text-neutral-500 border-neutral-700`
- **Cards**: `rounded-2xl p-4 backdrop-blur-[20px]`
- **Inputs**: `bg-transparent caret-volt`

---

## CALCULS STANDARDS

```typescript
// Impact annuel
annualSavings = monthlySavings * 12

// Projection 5 ans (compound 7%)
fiveYearAmount = calculateCompoundGrowth(monthlySavings, 5, 0.07)

// Formule compound growth
FV = PMT × [((1 + r)^n - 1) / r]
// où r = taux mensuel (0.07/12), n = mois (5*12)
```

---

## ANTI-PATTERNS

- **Emojis dans l'UI** → Utiliser Lucide icons
- **Strings hardcodés** → Utiliser i18n ou labels localisés
- **Oublier haptic** → `haptic.light()`, `haptic.medium()`, `haptic.heavy()`
- **Oublier analytics** → `trackEvent()` aux transitions
- **Animations slide** → Préférer fade only pour stabilité mobile
- **Console.log** → Sont stripped en production mais à éviter
- **Imports relatifs profonds** → Utiliser `@/` aliases

---

## MISSIONS DE RÉFÉRENCE

Pour les patterns avancés, consulter:
- **La Purge**: `src/features/quests/pilotage/cut-subscription/`
- **Traque Invisible**: `src/features/quests/pilotage/micro-expenses/`
- **Budget 50/30/20**: `src/features/quests/pilotage/budget-50-30-20/`
- **Le Cockpit (Reste à Vivre)**: `src/features/quests/pilotage/reste-a-vivre/`
