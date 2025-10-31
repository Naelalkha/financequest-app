// Import des quêtes de gestion de dettes globales
import { creditScoreBasics } from './credit-score-basics.js';
import { debtAvalanche } from './debt-avalanche.js';

// Export de toutes les quêtes de gestion de dettes globales
export const globalDebtsQuests = [
  creditScoreBasics,
  debtAvalanche
];

// Export individuel pour compatibilité
export { creditScoreBasics, debtAvalanche }; 