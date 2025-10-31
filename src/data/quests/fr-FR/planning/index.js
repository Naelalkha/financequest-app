// Import des quêtes de planification françaises
import { retraiteFrance } from './retraite-france.js';
import { adjustTaxRate } from './adjust-tax-rate.js';

// Export de toutes les quêtes de planification françaises
export const frPlanningQuests = [
  adjustTaxRate, // Starter Pack (en premier)
  retraiteFrance
];

// Export individuel pour compatibilité
export { retraiteFrance, adjustTaxRate }; 