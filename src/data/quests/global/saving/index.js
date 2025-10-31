// Import des quêtes d'épargne globales
import { emergencyFund101 } from './emergency-fund-101.js';
import { savingStrategies } from './saving-strategies.js';
import { weeklySavings } from './weekly-savings.js';

// Export de toutes les quêtes d'épargne globales
export const globalSavingQuests = [
  weeklySavings, // Starter Pack (en premier)
  emergencyFund101,
  savingStrategies
];

// Export individuel pour compatibilité
export { emergencyFund101, savingStrategies, weeklySavings }; 