/**
 * Anti-Overdraft Quest - Insight Data
 *
 * Données, calculs RAV, et stratégies garde-fous
 */

// ===== TYPES =====

export type RiskLevel = 'CRITIQUE' | 'TENDU' | 'OK' | 'CONFORT';

export interface RAVResult {
  rav: number;              // Montant RAV
  ratio: number;            // RAV / Revenus (0-1)
  riskLevel: RiskLevel;
}

export interface RiskLevelConfig {
  emoji: string;           // Deprecated - use iconName instead
  colorClass: string;
  bgClass: string;
  borderClass: string;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  iconName: string;        // Lucide icon name
}

export interface Strategy {
  id: string;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  iconName: string;
  monthlyImpact: number;
  isProtection: boolean;
  requiresBankCall: boolean;
}

// ===== CONSTANTES RAV =====

export const RAV_THRESHOLDS = {
  CRITIQUE: 0.10,    // < 10%
  TENDU: 0.20,       // 10-20%
  OK: 0.30,          // 20-30%
  // CONFORT: > 30%
};

export const RISK_LEVELS: Record<RiskLevel, RiskLevelConfig> = {
  CRITIQUE: {
    emoji: '',
    colorClass: 'text-volt',
    bgClass: 'bg-neutral-900/80',
    borderClass: 'border-2 border-dashed border-volt/50 shadow-[0_0_15px_rgba(226,255,0,0.15)]',
    labelFr: 'CRITIQUE',
    labelEn: 'CRITICAL',
    descFr: 'Zone rouge. Agis maintenant.',
    descEn: 'Red zone. Act now.',
    iconName: 'AlertTriangle'
  },
  TENDU: {
    emoji: '',
    colorClass: 'text-volt/80',
    bgClass: 'bg-neutral-900/80',
    borderClass: 'border border-volt/40 shadow-[0_0_12px_rgba(226,255,0,0.1)]',
    labelFr: 'TENDU',
    labelEn: 'TIGHT',
    descFr: 'Marge serrée. Vigilance requise.',
    descEn: 'Tight margin. Stay vigilant.',
    iconName: 'AlertCircle'
  },
  OK: {
    emoji: '',
    colorClass: 'text-volt',
    bgClass: 'bg-neutral-900/80',
    borderClass: 'border border-volt/30 shadow-[0_0_10px_rgba(226,255,0,0.08)]',
    labelFr: 'OK',
    labelEn: 'OK',
    descFr: 'Stable. Tu peux optimiser.',
    descEn: 'Stable. You can optimize.',
    iconName: 'CheckCircle2'
  },
  CONFORT: {
    emoji: '',
    colorClass: 'text-volt',
    bgClass: 'bg-neutral-900/80',
    borderClass: 'border border-volt/40 shadow-[0_0_20px_rgba(226,255,0,0.15)]',
    labelFr: 'CONFORT',
    labelEn: 'COMFORT',
    descFr: 'Blindé. Tu es safe.',
    descEn: 'Solid. You\'re safe.',
    iconName: 'Sparkles'
  }
};

// ===== SOCIAL PROOF (Protocol page 0) =====

export interface SocialProofSlide {
  id: string;
  titleFr: string;
  titleEn: string;
  badge: string;
  badgeColor: 'red' | 'amber' | 'emerald' | 'volt';
  stat: string;
  textFr: string;
  textEn: string;
  source: string;
}

export const socialProofSlides: SocialProofSlide[] = [
  {
    id: 'overdraft-reality',
    titleFr: 'LA RÉALITÉ',
    titleEn: 'THE REALITY',
    badge: 'STATS',
    badgeColor: 'red',
    stat: '45%',
    textFr: "des Français passent dans le rouge.",
    textEn: "of French people go overdrawn at least once a year.",
    source: 'Banque de France 2024'
  },
  {
    id: 'average-overdraft',
    titleFr: 'LE PATTERN',
    titleEn: 'THE PATTERN',
    badge: 'TIMING',
    badgeColor: 'amber',
    stat: '223€',
    textFr: "découvert moyen — le 18 du mois pour 24% des gens.",
    textEn: "average overdraft — on the 18th for 24% of people.",
    source: 'Étude bancaire 2024'
  },
  {
    id: 'cost-fees',
    titleFr: 'LE COÛT CACHÉ',
    titleEn: 'THE HIDDEN COST',
    badge: 'IMPACT',
    badgeColor: 'red',
    stat: '145€',
    textFr: "de frais de découvert en moyenne chaque année.",
    textEn: "in overdraft fees on average each year.",
    source: 'Étude bancaire 2024'
  }
];

// ===== PRO TIPS / MÉTHODE (Protocol page 1) =====

export interface ProTip {
  id: string;
  titleFr: string;
  titleEn: string;
  iconName: string;
  bodyFr: string;
  bodyEn: string;
}

export const proTips: ProTip[] = [
  {
    id: 'calculate',
    titleFr: 'CALCULE TON RAV',
    titleEn: 'CALCULATE YOUR RAV',
    iconName: 'Calculator',
    bodyFr: "**Revenus - Charges fixes** = Reste À Vivre. C'est ta marge de manoeuvre mensuelle.",
    bodyEn: "**Income - Fixed expenses** = Disposable Income. It's your monthly wiggle room."
  },
  {
    id: 'evaluate',
    titleFr: 'ÉVALUE TON RISQUE',
    titleEn: 'EVALUATE YOUR RISK',
    iconName: 'Shield',
    bodyFr: "Un RAV < 20% de tes revenus ? Tu es en zone de risque. **L'objectif : 30%+**",
    bodyEn: "RAV < 20% of your income? You're in the danger zone. **Target: 30%+**"
  },
  {
    id: 'protect',
    titleFr: 'ACTIVE TES PROTECTIONS',
    titleEn: 'ACTIVATE YOUR PROTECTIONS',
    iconName: 'Bell',
    bodyFr: "Alertes SMS, virements auto, découvert négocié... **Des protections 100% gratuites**.",
    bodyEn: "SMS alerts, auto-transfers, overdraft negotiation... **Free protections**."
  }
];

// ===== STRATÉGIES GARDE-FOUS =====

export const strategies: Strategy[] = [
  {
    id: 'auto-transfer',
    labelFr: 'Virement auto épargne',
    labelEn: 'Auto savings transfer',
    descFr: 'Épargne auto dès le salaire',
    descEn: 'Auto-save on payday',
    iconName: 'ArrowRightLeft',
    monthlyImpact: 0,
    isProtection: true,
    requiresBankCall: false
  },
  {
    id: 'delay-debits',
    labelFr: 'Décaler prélèvements',
    labelEn: 'Delay debits',
    descFr: 'Après le salaire = zéro stress',
    descEn: 'After payday = zero stress',
    iconName: 'Calendar',
    monthlyImpact: 0,
    isProtection: true,
    requiresBankCall: true
  },
  {
    id: 'sms-alert',
    labelFr: 'Alerte solde bas',
    labelEn: 'Low balance alert',
    descFr: 'Prévenu avant le rouge',
    descEn: 'Warned before overdraft',
    iconName: 'Bell',
    monthlyImpact: 0,
    isProtection: true,
    requiresBankCall: false
  },
  {
    id: 'negotiate-overdraft',
    labelFr: 'Découvert autorisé',
    labelEn: 'Authorized overdraft',
    descFr: 'Filet de sécurité gratuit',
    descEn: 'Free safety net',
    iconName: 'Shield',
    monthlyImpact: 0,
    isProtection: true,
    requiresBankCall: true
  }
];

// ===== SCRIPT BANQUE =====

export interface BankCallScript {
  introFr: string;
  introEn: string;
  pointsFr: string[];
  pointsEn: string[];
  outroFr: string;
  outroEn: string;
}

export const bankCallScript: BankCallScript = {
  introFr: "Bonjour, je suis client(e) et je souhaite optimiser la gestion de mon compte.",
  introEn: "Hello, I'm a customer and I'd like to optimize my account management.",
  pointsFr: [
    "Décaler mes prélèvements au **5 du mois**",
    "Activer les **alertes SMS** de solde bas",
    "Connaître mon **découvert autorisé** actuel",
    "Négocier un **découvert autorisé gratuit**"
  ],
  pointsEn: [
    "Move my debits to the **5th of the month**",
    "Activate **low balance SMS alerts**",
    "Know my current **authorized overdraft**",
    "Negotiate a **free authorized overdraft**"
  ],
  outroFr: "Merci de votre aide.",
  outroEn: "Thank you for your help."
};

// ===== CALCULS =====

/**
 * Calcule le Reste À Vivre et le niveau de risque
 */
export const calculateRAV = (revenus: number, chargesFixes: number): RAVResult => {
  const rav = Math.max(0, revenus - chargesFixes);
  const ratio = revenus > 0 ? rav / revenus : 0;

  let riskLevel: RiskLevel;
  if (ratio < RAV_THRESHOLDS.CRITIQUE) {
    riskLevel = 'CRITIQUE';
  } else if (ratio < RAV_THRESHOLDS.TENDU) {
    riskLevel = 'TENDU';
  } else if (ratio < RAV_THRESHOLDS.OK) {
    riskLevel = 'OK';
  } else {
    riskLevel = 'CONFORT';
  }

  return { rav, ratio, riskLevel };
};

/**
 * Calcule l'impact mensuel total des stratégies sélectionnées
 */
export const calculateTotalImpact = (selectedStrategies: string[]): number => {
  return strategies
    .filter(s => selectedStrategies.includes(s.id))
    .reduce((sum, s) => sum + s.monthlyImpact, 0);
};

/**
 * Vérifie si des stratégies nécessitent un appel banque
 */
export const hasStrategiesRequiringCall = (selectedStrategies: string[]): boolean => {
  return strategies
    .filter(s => selectedStrategies.includes(s.id))
    .some(s => s.requiresBankCall);
};

/**
 * Compte les stratégies de protection (sans impact direct)
 */
export const countProtectionStrategies = (selectedStrategies: string[]): number => {
  return strategies
    .filter(s => selectedStrategies.includes(s.id) && s.isProtection)
    .length;
};

/**
 * Récupère les stratégies sélectionnées qui nécessitent un appel
 */
export const getStrategiesRequiringCall = (selectedStrategies: string[]): Strategy[] => {
  return strategies.filter(s => selectedStrategies.includes(s.id) && s.requiresBankCall);
};

// ===== OPTION B: STRATÉGIES PRIORISÉES PAR NIVEAU DE RISQUE =====

/**
 * Ordre de priorité des stratégies selon le niveau de risque
 * - CRITIQUE/TENDU : Urgence = alertes et négociation d'abord
 * - OK/CONFORT : Optimisation = épargne auto d'abord
 */
export const STRATEGY_PRIORITY: Record<RiskLevel, string[]> = {
  CRITIQUE: ['sms-alert', 'negotiate-overdraft', 'delay-debits', 'auto-transfer'],
  TENDU: ['sms-alert', 'delay-debits', 'negotiate-overdraft', 'auto-transfer'],
  OK: ['auto-transfer', 'delay-debits', 'sms-alert', 'negotiate-overdraft'],
  CONFORT: ['auto-transfer', 'delay-debits', 'sms-alert', 'negotiate-overdraft']
};

/**
 * Messages contextuels selon le niveau de risque
 */
export interface RiskMessage {
  fr: string;
  en: string;
  priorityLabelFr: string;
  priorityLabelEn: string;
}

export const RISK_MESSAGES: Record<RiskLevel, RiskMessage> = {
  CRITIQUE: {
    fr: "Priorité absolue : sécurise ton compte.",
    en: "Top priority: secure your account.",
    priorityLabelFr: "URGENCE",
    priorityLabelEn: "URGENT"
  },
  TENDU: {
    fr: "Marge serrée. Active tes protections.",
    en: "Tight margin. Activate your protections.",
    priorityLabelFr: "RECOMMANDÉ",
    priorityLabelEn: "RECOMMENDED"
  },
  OK: {
    fr: "Tu gères. Voici comment renforcer.",
    en: "You're managing. Here's how to strengthen.",
    priorityLabelFr: "CONSEILLÉ",
    priorityLabelEn: "ADVISED"
  },
  CONFORT: {
    fr: "Tu es safe ! Voici comment optimiser encore plus.",
    en: "You're safe! Here's how to optimize even more.",
    priorityLabelFr: "BONUS",
    priorityLabelEn: "BONUS"
  }
};

/**
 * Frais de découvert estimés par niveau de risque (par an)
 * Basé sur la fréquence probable de découvert selon le RAV
 */
export const ESTIMATED_OVERDRAFT_FEES: Record<RiskLevel, { amount: number; frequencyFr: string; frequencyEn: string }> = {
  CRITIQUE: {
    amount: 220,
    frequencyFr: "Si tu passais à découvert ~2x/mois",
    frequencyEn: "If you went overdrawn ~2x/month"
  },
  TENDU: {
    amount: 160,
    frequencyFr: "Si tu passais à découvert ~1-2x/mois",
    frequencyEn: "If you went overdrawn ~1-2x/month"
  },
  OK: {
    amount: 110,
    frequencyFr: "Si tu passais à découvert occasionnellement",
    frequencyEn: "If you went overdrawn occasionally"
  },
  CONFORT: {
    amount: 60,
    frequencyFr: "Même si tu passes rarement à découvert",
    frequencyEn: "Even if you rarely go overdrawn"
  }
};

/**
 * Récupère les stratégies ordonnées selon le niveau de risque
 */
export const getStrategiesForRiskLevel = (riskLevel: RiskLevel): Strategy[] => {
  const priority = STRATEGY_PRIORITY[riskLevel];
  return priority.map(id => strategies.find(s => s.id === id)!);
};

/**
 * Calcule les frais de découvert évités (impact repensé)
 * Basé sur le niveau de risque et le nombre de garde-fous activés
 */
export const calculateAvoidedFees = (riskLevel: RiskLevel, selectedStrategies: string[]): number => {
  if (selectedStrategies.length === 0) return 0;

  const baseFees = ESTIMATED_OVERDRAFT_FEES[riskLevel].amount;

  // Chaque garde-fou réduit le risque de découvert
  // 1 stratégie = 40%, 2 = 70%, 3 = 85%, 4 = 95%
  const reductionRates = [0, 0.40, 0.70, 0.85, 0.95];
  const reductionRate = reductionRates[Math.min(selectedStrategies.length, 4)];

  return Math.round(baseFees * reductionRate);
};

/**
 * Vérifie si une stratégie est prioritaire pour un niveau de risque donné
 * (les 2 premières dans l'ordre sont considérées prioritaires)
 */
export const isStrategyPriority = (strategyId: string, riskLevel: RiskLevel): boolean => {
  const priority = STRATEGY_PRIORITY[riskLevel];
  const index = priority.indexOf(strategyId);
  return index >= 0 && index < 2;
};
