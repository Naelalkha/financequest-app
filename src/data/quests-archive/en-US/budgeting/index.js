// Import des quêtes de budget américaines
import { rothIra } from './roth-ira.js';
import { fourZeroOneKBasics } from './401k-basics.js';

// Export de toutes les quêtes de budget américaines
export const usBudgetingQuests = [
  rothIra,
  fourZeroOneKBasics
];

// Export individuel pour compatibilité
export { rothIra, fourZeroOneKBasics }; 