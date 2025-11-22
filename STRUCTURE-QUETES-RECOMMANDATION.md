# 🗂️ Structure des Quêtes - Recommandation Architecture

## 📅 Date
**14 novembre 2025**

---

## 🎯 Structure actuelle analysée

Vous avez **deux dossiers distincts** avec des rôles complémentaires :

### 1️⃣ **`src/data/quests/`** - DONNÉES / CONFIGURATION
```
src/data/quests/
├── cut-subscription-v1.js       ← Config complète de la quête
├── index.js                      ← Exports & collections
├── questHelpers.js               ← Utilitaires (localizeQuest)
├── IMPLEMENTATION-GUIDE.md       ← Documentation
└── README.md                     ← Guide général
```

**Contient :**
- ✅ Métadonnées (id, catégorie, difficulté, durée, XP)
- ✅ Textes localisés (title_fr, title_en, objectives, etc.)
- ✅ Impact estimé
- ✅ Couleurs, icônes
- ✅ Structure des steps (description, validation rules)
- ✅ Récompenses, badges

**Rôle :** 📊 **SOURCE DE VÉRITÉ** pour les données

---

### 2️⃣ **`src/components/quest/`** - COMPOSANTS UI
```
src/components/quest/
├── generic/                      ← Composants réutilisables
│   ├── QuestFlowWrapper.jsx      ← Orchestrateur
│   ├── QuestIntro.jsx            ← Intro générique
│   └── QuestCompletion.jsx       ← Fin générique
│
├── cores/                        ← Logic UI spécifique par quête
│   └── CutSubscriptionCore.jsx   ← Steps React de la quête
│
├── CutSubscriptionQuest.jsx      ← Point d'entrée (lien DATA ↔ UI)
│
└── [composants partagés]         ← SubscriptionSelector, AmountInput, etc.
```

**Contient :**
- ✅ Composants React
- ✅ Logic d'interaction utilisateur
- ✅ Validation UI
- ✅ Handlers d'événements
- ✅ Rendu visuel

**Rôle :** 🎨 **PRÉSENTATION** et logique d'interface

---

## ✅ RECOMMANDATION : Séparation DATA / UI

### **Structure recommandée pour une nouvelle quête**

```
📁 src/
  │
  ├─ 📁 data/quests/                          ← DONNÉES
  │   ├── cut-subscription-v1.js
  │   ├── emergency-fund-v1.js                ← Nouvelle quête (DATA)
  │   ├── compare-insurance-v1.js             ← Nouvelle quête (DATA)
  │   ├── index.js                            ← Export toutes les quêtes
  │   └── questHelpers.js
  │
  ├─ 📁 components/pages/
  │   └── QuestRouter.jsx                     ← REGISTRY (DATA ↔ CORE)
  │
  └─ 📁 components/quest/                     ← UI
      ├─ 📁 generic/                          ← Composants réutilisables
      │   ├── QuestFlowWrapper.jsx
      │   ├── QuestIntro.jsx
      │   └── QuestCompletion.jsx
      │
      ├─ 📁 cores/                            ← Logic UI + CONFIG
      │   ├── CutSubscriptionCore.jsx         ← CORE complet
      │   ├── EmergencyFundCore.jsx           ← Nouvelle quête (CORE)
      │   ├── CompareInsuranceCore.jsx        ← Nouvelle quête (CORE)
      │   └── index.js
      │
      └─ 📁 cut-subscription/                 ← Components spécifiques
          ├── SubscriptionSelector.jsx
          ├── AmountInput.jsx
          └── CancellationGuide.jsx
```

**Plus de wrappers intermédiaires !** ✨

---

## 📋 Checklist pour ajouter une nouvelle quête (3 étapes)

### **Étape 1 : Créer la DATA** dans `src/data/quests/`

```javascript
// src/data/quests/emergency-fund-v1.js

import { FaPiggyBank, FaCheckCircle } from 'react-icons/fa';

export const emergencyFundQuest = {
  id: 'emergency-fund-v1',
  category: 'protect',
  difficulty: 'beginner',
  duration: 10,
  xp: 150,
  isPremium: false,
  starterPack: true,
  
  title_fr: 'Crée ton fonds d\'urgence',
  title_en: 'Build your emergency fund',
  title: 'Crée ton fonds d\'urgence',
  
  description_fr: 'Protège-toi des imprévus en 10 min',
  description_en: 'Protect yourself from surprises in 10 min',
  description: 'Protège-toi des imprévus en 10 min',
  
  objectives_fr: [
    'Calcule ton objectif d\'épargne',
    'Ouvre un livret dédié',
    'Mets en place un virement automatique'
  ],
  objectives_en: [
    'Calculate your savings goal',
    'Open a dedicated account',
    'Set up automatic transfer'
  ],
  
  estimatedImpact: {
    amount: 50,
    period: 'month'
  },
  
  icons: {
    main: FaPiggyBank,
    steps: [FaCheckCircle]
  },
  
  colors: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: 'from-emerald-50 to-green-50',
    darkBackground: 'from-emerald-900/20 to-green-900/20'
  },
  
  // ... autres propriétés
};

export default emergencyFundQuest;
```

### **Étape 2 : Ajouter à l'index** dans `src/data/quests/index.js`

```javascript
import cutSubscriptionQuest from './cut-subscription-v1.js';
import emergencyFundQuest from './emergency-fund-v1.js';  // ← Ajouter

export { cutSubscriptionQuest, emergencyFundQuest };       // ← Ajouter

export const allQuests = [
  cutSubscriptionQuest,
  emergencyFundQuest,  // ← Ajouter
];
```

### **Étape 3 : Créer le CORE UI** dans `src/components/quest/cores/`

```javascript
// src/components/quest/cores/EmergencyFundCore.jsx

const Step1Component = ({ questData, updateQuestData, locale }) => {
  // Logic UI pour calculer l'objectif
  return <YourCustomUI />;
};

const Step2Component = ({ questData, updateQuestData, locale }) => {
  // Logic UI pour ouvrir le livret
  return <YourCustomUI />;
};

const validateEmergencyFund = (stepIndex, questData, locale) => {
  // Validation par step
  return { valid: true/false, message: '...' };
};

export default {
  steps: [Step1Component, Step2Component],
  validate: validateEmergencyFund,
  completionConfig: {
    title: { fr: 'Fonds créé !', en: 'Fund created!' }
  },
  impactConfig: {
    title: (data) => `Épargne — ${data.amount}€/mois`,
    period: 'month'
  }
};
```

### **Étape 3 : Ajouter au REGISTRY** dans `src/components/pages/QuestRouter.jsx`

```javascript
import { CutSubscriptionQuest } from '../quest';
import EmergencyFundQuest from '../quest/EmergencyFundQuest';  // ← Ajouter

const QUEST_COMPONENTS = {
  'cut-subscription-v1': CutSubscriptionQuest,
  'emergency-fund-v1': EmergencyFundQuest,  // ← Ajouter
};
```

**C'est tout ! 🎉**

---

## 🎯 Pourquoi cette séparation DATA / UI ?

| Critère | Avantage |
|---------|----------|
| **Clarté** | Les données sont séparées de la présentation |
| **Testabilité** | On peut tester les données sans UI |
| **Réutilisabilité** | Les données peuvent être utilisées ailleurs (API, admin, etc.) |
| **Localisation** | Tous les textes centralisés dans `data/` |
| **Maintenabilité** | Modifier un texte = 1 fichier (`data/`), pas 5 composants |
| **Scalabilité** | Ajouter 100 quêtes = structure claire et prévisible |
| **Type safety** | Les types des données peuvent être validés séparément |

---

## 📐 Principe de séparation

```
┌─────────────────────────────────────────┐
│         src/data/quests/                │
│                                         │
│  • Métadonnées (id, xp, durée)         │
│  • Textes localisés (fr/en)            │
│  • Impact estimé                        │
│  • Icônes, couleurs                     │
│  • Structure des steps                  │
│                                         │
│  📊 SOURCE DE VÉRITÉ                    │
└────────────────┬────────────────────────┘
                 │
                 │ Import
                 ▼
┌─────────────────────────────────────────┐
│      src/components/quest/              │
│                                         │
│  • QuestFlowWrapper (orchestrateur)     │
│  • QuestIntro (générique)               │
│  • QuestCompletion (générique)          │
│  • Cores (UI spécifique par quête)     │
│  • Points d'entrée (wrappers)           │
│                                         │
│  🎨 PRÉSENTATION                        │
└─────────────────────────────────────────┘
```

---

## ✅ Bénéfices de cette structure

### 1. **Un seul endroit pour les textes**
```javascript
// ✅ BIEN : Tous les textes dans data/
title_fr: 'Coupe 1 abonnement',
description_fr: 'Gagne €156/an en 5 min',
objectives_fr: ['Repère', 'Annule', 'Ajoute']

// ❌ MAL : Textes éparpillés dans les composants
<h1>{currentLang === 'fr' ? 'Coupe...' : 'Cut...'}</h1>
```

### 2. **Validation centralisée**
```javascript
// data/quests/emergency-fund-v1.js
validation: {
  minAmount: 50,
  maxAmount: 5000
}

// Le core UI utilise cette config, pas de valeurs hardcodées
```

### 3. **Facilité de migration**
```javascript
// Si demain vous voulez un CMS admin, les données sont déjà séparées
import { allQuests } from '@/data/quests';

// API endpoint
GET /api/quests → renvoie allQuests
```

### 4. **Tests unitaires**
```javascript
// Test des données (sans UI)
import { emergencyFundQuest } from '@/data/quests/emergency-fund-v1';
expect(emergencyFundQuest.xp).toBeGreaterThan(0);

// Test UI (sans données)
render(<EmergencyFundCore questData={mockData} />);
```

---

## 📝 Conventions de nommage

### **Fichiers DATA** (`src/data/quests/`)
```
{nom-quete}-v{version}.js
```

Exemples :
- `cut-subscription-v1.js`
- `emergency-fund-v1.js`
- `compare-insurance-v2.js` (si vous refaites la v1)

### **Fichiers UI CORE** (`src/components/quest/cores/`)
```
{NomQuete}Core.jsx
```

Exemples :
- `CutSubscriptionCore.jsx`
- `EmergencyFundCore.jsx`
- `CompareInsuranceCore.jsx`

### **Fichiers UI WRAPPER** (`src/components/quest/`)
```
{NomQuete}Quest.jsx
```

Exemples :
- `CutSubscriptionQuest.jsx`
- `EmergencyFundQuest.jsx`
- `CompareInsuranceQuest.jsx`

---

## 🎯 Résumé : Où ajouter quoi ?

| Quoi ? | Où ? | Exemples |
|--------|------|----------|
| **Métadonnées** | `src/data/quests/` | id, xp, durée, catégorie |
| **Textes** | `src/data/quests/` | title, description, objectives |
| **Config visuelle** | `src/data/quests/` | icons, colors |
| **Structure steps** | `src/data/quests/` | steps: [{ id, type, ... }] |
| **Composants React** | `src/components/quest/cores/` | Steps UI spécifiques |
| **Validation UI** | `src/components/quest/cores/` | validateFn, rules |
| **Point d'entrée** | `src/components/quest/` | Wrapper QuestFlowWrapper |

---

## 🚀 Prochaines quêtes à créer (exemples)

### **Starter Pack** (quick wins)
1. ✅ `cut-subscription-v1` - Déjà fait
2. 📋 `negotiate-phone-plan-v1` - Négocier forfait mobile
3. 📋 `find-cheaper-insurance-v1` - Comparer assurances
4. 📋 `cancel-unused-gym-v1` - Annuler salle de sport

### **Protection**
5. 📋 `emergency-fund-v1` - Fonds d'urgence
6. 📋 `document-safe-v1` - Coffre-fort documents
7. 📋 `beneficiary-setup-v1` - Bénéficiaires

### **Épargne**
8. 📋 `automatic-savings-v1` - Virement automatique
9. 📋 `52-week-challenge-v1` - Challenge 52 semaines
10. 📋 `round-up-savings-v1` - Arrondi à l'euro

---

## ✅ Checklist finale

Quand vous ajoutez une nouvelle quête, vérifiez :

- [ ] **DATA créée** dans `src/data/quests/{nom}-v1.js`
- [ ] **DATA exportée** dans `src/data/quests/index.js`
- [ ] **CORE UI créé** dans `src/components/quest/cores/{Nom}Core.jsx`
- [ ] **WRAPPER créé** dans `src/components/quest/{Nom}Quest.jsx`
- [ ] **ROUTE ajoutée** dans `src/components/pages/QuestRouter.jsx`
- [ ] **Tests manuels** : intro → steps → completion
- [ ] **Textes FR/EN** vérifiés
- [ ] **Impact estimé** configuré

---

## 🎉 Conclusion

**Recommandation finale :**

✅ **Utilisez les DEUX dossiers avec leurs rôles distincts :**

1. `src/data/quests/` → **Source de vérité** (métadonnées, textes, config)
2. `src/components/quest/cores/` → **Logic UI** spécifique par quête
3. `src/components/quest/` → **Wrappers** + composants génériques

Cette séparation vous donnera :
- 📊 **Clarté** : chaque chose à sa place
- 🔧 **Maintenabilité** : facile à modifier
- 🚀 **Scalabilité** : structure qui supporte 100+ quêtes
- 🧪 **Testabilité** : data et UI testables séparément

**Temps pour ajouter une nouvelle quête : 10-15 minutes** ⏱️

