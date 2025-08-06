// Import des quêtes de budget françaises
import { livretA } from './livret-a.js';
import { pel } from './pel.js';

// Export de toutes les quêtes de budget françaises
export const frBudgetingQuests = [
  livretA,
  pel
];

// Export individuel pour compatibilité
export { livretA, pel }; 