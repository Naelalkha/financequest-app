// Import des quêtes de budget globales
import { budgetBasics } from './budget-basics.js';
import { expenseTracking } from './expense-tracking.js';
import { basicBanking } from './basic-banking.js';
import { sideHustleFinance } from './side-hustle-finance.js';
import { cutSubscription } from './cut-subscription.js';

// Export de toutes les quêtes de budget globales
export const globalBudgetingQuests = [
  cutSubscription, // Starter Pack (en premier)
  budgetBasics,
  expenseTracking,
  basicBanking,
  sideHustleFinance
];

// Export individuel pour compatibilité
export { budgetBasics, expenseTracking, basicBanking, sideHustleFinance, cutSubscription }; 