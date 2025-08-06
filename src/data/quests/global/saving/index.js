// Import des quêtes d'épargne globales
import { emergencyFund101 } from './emergency-fund-101.js';
import { savingStrategies } from './saving-strategies.js';

// Export de toutes les quêtes d'épargne globales
export const globalSavingQuests = [
  emergencyFund101,
  savingStrategies
];

// Export individuel pour compatibilité
export { emergencyFund101, savingStrategies }; 