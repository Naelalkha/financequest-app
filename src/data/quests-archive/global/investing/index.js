// Import des quêtes d'investissement globales
import { investingBasics } from './investing-basics.js';
import { cryptoIntro } from './crypto-intro.js';
import { realEstateBasics } from './real-estate-basics.js';

// Export de toutes les quêtes d'investissement globales
export const globalInvestingQuests = [
  investingBasics,
  cryptoIntro,
  realEstateBasics
];

// Export individuel pour compatibilité
export { investingBasics, cryptoIntro, realEstateBasics }; 