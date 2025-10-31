/**
 * Starter Pack - Quêtes FR gratuites pour nouveaux utilisateurs
 * 
 * 3 quêtes action-first avec impact immédiat :
 * 1. Couper 1 abonnement (~€156/an)
 * 2. Ajuster le taux de prélèvement (~€120/an)
 * 3. Programmer 20€/semaine d'épargne (~€960/an)
 * 
 * Total impact potentiel : ~€1 236/an
 */

export { cutSubscription } from './cut-subscription';
export { adjustTaxRate } from './adjust-tax-rate';
export { weeklySavings } from './weekly-savings';

// Helper pour récupérer toutes les quêtes Starter Pack
export const getAllStarterQuests = () => {
  const { cutSubscription } = require('./cut-subscription');
  const { adjustTaxRate } = require('./adjust-tax-rate');
  const { weeklySavings } = require('./weekly-savings');
  
  return [
    cutSubscription,
    adjustTaxRate,
    weeklySavings
  ];
};

