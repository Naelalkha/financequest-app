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
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
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
    emoji: '🔴',
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/20',
    borderClass: 'border-red-500/30',
    labelFr: 'CRITIQUE',
    labelEn: 'CRITICAL',
    descFr: 'Risque élevé de découvert',
    descEn: 'High overdraft risk'
  },
  TENDU: {
    emoji: '🟠',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/20',
    borderClass: 'border-orange-500/30',
    labelFr: 'TENDU',
    labelEn: 'TIGHT',
    descFr: 'Marge de manoeuvre limitée',
    descEn: 'Limited wiggle room'
  },
  OK: {
    emoji: '🟢',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    labelFr: 'OK',
    labelEn: 'OK',
    descFr: 'Situation stable',
    descEn: 'Stable situation'
  },
  CONFORT: {
    emoji: '✨',
    colorClass: 'text-volt',
    bgClass: 'bg-volt/20',
    borderClass: 'border-volt/30',
    labelFr: 'CONFORT',
    labelEn: 'COMFORT',
    descFr: 'Excellente marge de sécurité',
    descEn: 'Excellent safety margin'
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
    stat: '53%',
    textFr: "des Français passent dans le rouge au moins une fois par an.",
    textEn: "of French people go overdrawn at least once a year.",
    source: 'Banque de France 2023'
  },
  {
    id: 'cost-fees',
    titleFr: 'LE COÛT CACHÉ',
    titleEn: 'THE HIDDEN COST',
    badge: 'IMPACT',
    badgeColor: 'amber',
    stat: '156€',
    textFr: "de frais de découvert en moyenne chaque année.",
    textEn: "in overdraft fees on average each year.",
    source: 'CLCV 2023'
  },
  {
    id: 'protection',
    titleFr: 'LA SOLUTION',
    titleEn: 'THE SOLUTION',
    badge: 'MÉTHODE',
    badgeColor: 'emerald',
    stat: 'RAV',
    textFr: "Le Reste À Vivre : ta marge de sécurité anti-découvert.",
    textEn: "Disposable Income: your anti-overdraft safety margin.",
    source: 'Méthode Moniyo'
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
    titleFr: 'ACTIVE TES GARDE-FOUS',
    titleEn: 'ACTIVATE YOUR SAFEGUARDS',
    iconName: 'Bell',
    bodyFr: "Alertes SMS, virements auto, négociation découverts... **Des filets de sécurité gratuits**.",
    bodyEn: "SMS alerts, auto-transfers, overdraft negotiation... **Free safety nets**."
  }
];

// ===== STRATÉGIES GARDE-FOUS =====

export const strategies: Strategy[] = [
  {
    id: 'auto-transfer',
    labelFr: 'Virement automatique épargne',
    labelEn: 'Automatic savings transfer',
    descFr: 'Programme un virement auto le jour de ton salaire',
    descEn: 'Schedule auto-transfer on payday',
    iconName: 'ArrowRightCircle',
    monthlyImpact: 30,
    isProtection: false,
    requiresBankCall: false
  },
  {
    id: 'sms-alert',
    labelFr: 'Alerte SMS solde bas',
    labelEn: 'Low balance SMS alert',
    descFr: 'Reçois une alerte quand ton solde descend',
    descEn: 'Get alerted when balance drops',
    iconName: 'Bell',
    monthlyImpact: 0,
    isProtection: true,
    requiresBankCall: false
  },
  {
    id: 'delay-debits',
    labelFr: 'Décaler les prélèvements au 5',
    labelEn: 'Delay debits to the 5th',
    descFr: 'Évite les prélèvements avant le salaire',
    descEn: 'Avoid debits before payday',
    iconName: 'Calendar',
    monthlyImpact: 15,
    isProtection: false,
    requiresBankCall: true
  },
  {
    id: 'negotiate-overdraft',
    labelFr: 'Négocier le découvert autorisé',
    labelEn: 'Negotiate authorized overdraft',
    descFr: 'Obtiens un filet de sécurité gratuit',
    descEn: 'Get a free safety net',
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
    "Décaler mes prélèvements au 5 du mois",
    "Activer les alertes SMS de solde bas",
    "Connaître mon découvert autorisé actuel",
    "Négocier un découvert autorisé gratuit"
  ],
  pointsEn: [
    "Move my debits to the 5th of the month",
    "Activate low balance SMS alerts",
    "Know my current authorized overdraft",
    "Negotiate a free authorized overdraft"
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
