// Import des quêtes de planification financière globales
import { moneyMindset } from './money-mindset.js';
import { insuranceEssentials } from './insurance-essentials.js';
import { fireMovement } from './fire-movement.js';
import { taxOptimization } from './tax-optimization.js';

// Export de toutes les quêtes de planification financière globales
export const globalPlanningQuests = [
  moneyMindset,
  insuranceEssentials,
  fireMovement,
  taxOptimization
];

// Export individuel pour compatibilité
export { moneyMindset, insuranceEssentials, fireMovement, taxOptimization }; 