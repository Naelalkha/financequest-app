// Import des quêtes de budget globales
import { budgetBasics } from './budget-basics.js';
import { expenseTracking } from './expense-tracking.js';
import { basicBanking } from './basic-banking.js';
import { sideHustleFinance } from './side-hustle-finance.js';

// Export de toutes les quêtes de budget globales
export const globalBudgetingQuests = [
  budgetBasics,
  expenseTracking,
  basicBanking,
  sideHustleFinance
];

// Export individuel pour compatibilité
export { budgetBasics, expenseTracking, basicBanking, sideHustleFinance }; 