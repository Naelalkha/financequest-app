# Structure des Quêtes FinanceQuest

Cette documentation décrit la nouvelle organisation des quêtes par pays et catégories.

## Structure des Dossiers

```
src/data/quests/
├── global/                      ← Quêtes valables pour tous (concepts universels)
│   ├── budgeting/
│   │   ├── budget-basics.js
│   │   ├── expense-tracking.js
│   │   ├── basic-banking.js
│   │   ├── side-hustle-finance.js
│   │   └── index.js
│   ├── saving/
│   │   ├── emergency-fund-101.js
│   │   ├── saving-strategies.js
│   │   └── index.js
│   ├── investing/
│   │   ├── investing-basics.js
│   │   ├── crypto-intro.js
│   │   ├── real-estate-basics.js
│   │   └── index.js
│   ├── debt/
│   │   ├── credit-score-basics.js
│   │   ├── debt-avalanche.js
│   │   └── index.js
│   └── planning/
│       ├── money-mindset.js
│       ├── insurance-essentials.js
│       ├── fire-movement.js
│       ├── tax-optimization.js
│       └── index.js
├── fr-FR/                       ← Spécifique France
│   ├── budgeting/
│   │   ├── livret-a.js
│   │   ├── pel.js
│   │   └── index.js
│   └── planning/
│       ├── retraite-france.js
│       └── index.js
├── en-US/                       ← Spécifique États-Unis
│   └── budgeting/
│       ├── roth-ira.js
│       ├── 401k-basics.js
│       └── index.js
├── categories.js
├── questHelpers.js
├── index.js
└── README.md
```

## Organisation

### Quêtes Globales (`global/`)
Contiennent les concepts universels de finance personnelle qui s'appliquent à tous les pays :
- **Budgeting** : Bases du budget, suivi des dépenses, banque de base
- **Saving** : Fonds d'urgence, stratégies d'épargne
- **Investing** : Bases de l'investissement, crypto, immobilier
- **Debt** : Score de crédit, gestion de la dette
- **Planning** : État d'esprit financier, assurance, FIRE, optimisation fiscale

### Quêtes Françaises (`fr-FR/`)
Contiennent les concepts spécifiques à la France :
- **Budgeting** : Livret A, PEL (Plan Épargne Logement)
- **Planning** : Système de retraite français

### Quêtes Américaines (`en-US/`)
Contiennent les concepts spécifiques aux États-Unis :
- **Budgeting** : Roth IRA, 401(k)

## Utilisation

### Récupération des quêtes par pays

```javascript
import { getQuestsByCountry, getQuestsByCategory } from './src/data/quests/index.js';

// Récupérer toutes les quêtes globales
const globalQuests = getQuestsByCountry('global', 'fr');

// Récupérer toutes les quêtes françaises
const frQuests = getQuestsByCountry('fr-FR', 'fr');

// Récupérer toutes les quêtes américaines
const usQuests = getQuestsByCountry('en-US', 'en');

// Récupérer les quêtes de budget françaises
const frBudgetingQuests = getQuestsByCategory('budgeting', 'fr', 'fr-FR');
```

### Ajout de nouvelles quêtes

1. **Pour une quête globale** : Créer le fichier dans `global/[category]/`
2. **Pour une quête française** : Créer le fichier dans `fr-FR/[category]/`
3. **Pour une quête américaine** : Créer le fichier dans `en-US/[category]/`
4. **Mettre à jour l'index** : Ajouter l'import et l'export dans le fichier `index.js` correspondant

### Structure d'une quête

Chaque quête doit avoir :
- `id` : Identifiant unique
- `category` : Catégorie (budgeting, saving, investing, debt, planning)
- `country` : Pays (global, fr-FR, en-US)
- `content` : Contenu multilingue (en, fr)
- `steps` : Étapes de la quête
- `metadata` : Métadonnées (version, tags, etc.)

## Fonctions Utilitaires

### `getQuestsByCountry(country, lang)`
Récupère toutes les quêtes d'un pays spécifique.

### `getQuestsByCategory(category, lang, country)`
Récupère les quêtes d'une catégorie spécifique pour un pays.

### `getFreeQuests(lang, country)`
Récupère les quêtes gratuites d'un pays.

### `getPremiumQuests(lang, country)`
Récupère les quêtes premium d'un pays.

### `getRecommendedQuests(completedQuestIds, userLevel, lang, country)`
Récupère les quêtes recommandées basées sur le progrès utilisateur.

## Migration

Cette structure remplace l'ancienne organisation par catégories uniquement. Les quêtes existantes ont été déplacées vers `global/` et de nouvelles quêtes spécifiques aux pays ont été ajoutées.

## Extensibilité

Pour ajouter un nouveau pays :
1. Créer le dossier `[country-code]/`
2. Créer les sous-dossiers par catégorie
3. Ajouter les imports dans `index.js`
4. Mettre à jour les fonctions de récupération 