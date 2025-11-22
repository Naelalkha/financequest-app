# 🗂️ Structure Visuelle des Quêtes

## 📐 Architecture complète

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                        FINANCEQUEST APP                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
                ▼                                   ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│    📊 DATA LAYER          │       │    🎨 UI LAYER            │
│  src/data/quests/         │       │  src/components/quest/    │
└───────────────────────────┘       └───────────────────────────┘
                │                                   │
                │                                   │
        ┌───────┴───────┐               ┌──────────┴──────────┐
        │               │               │                      │
        ▼               ▼               ▼                      ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐
│   Config    │ │  Helpers    │ │  Generic    │ │  Cores           │
│   Files     │ │             │ │  Components │ │  (spécifiques)   │
└─────────────┘ └─────────────┘ └─────────────┘ └──────────────────┘
       │               │               │                      │
       ▼               ▼               ▼                      ▼
                                                              
cut-subscription-v1.js              QuestIntro.jsx     CutSubscriptionCore.jsx
emergency-fund-v1.js                QuestFlowWrapper   EmergencyFundCore.jsx
compare-insurance-v1.js             QuestCompletion    CompareInsuranceCore.jsx
```

---

## 🔄 Flow d'une requête utilisateur

```
Utilisateur clique sur une quête
         │
         ▼
┌──────────────────────────┐
│  /quests/cut-sub-v1      │ ← URL
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     QuestRouter.jsx      │ ← Map ID → Composant
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ CutSubscriptionQuest.jsx │ ← Wrapper
└────────────┬─────────────┘
             │
             ├─── Import DATA from: src/data/quests/cut-subscription-v1.js
             │
             ├─── Import CORE from: src/components/quest/cores/CutSubscriptionCore.jsx
             │
             └─── Pass to: QuestFlowWrapper
                           │
                           ▼
              ┌────────────────────────┐
              │  QuestFlowWrapper      │
              │  (orchestrateur)       │
              └────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  Intro   │  →   │  Steps   │  →   │  Finish  │
  │ (generic)│      │ (core)   │      │ (generic)│
  └──────────┘      └──────────┘      └──────────┘
```

---

## 📦 Exemple concret : "Cut Subscription"

```
┌─────────────────────────────────────────────────────────────┐
│                  CUT SUBSCRIPTION QUEST                     │
└─────────────────────────────────────────────────────────────┘

DATA (src/data/quests/cut-subscription-v1.js)
├── id: 'cut-subscription-v1'
├── xp: 120
├── duration: 6
├── title_fr: 'Coupe 1 abonnement inutile'
├── objectives_fr: ['Repère', 'Annule', 'Ajoute']
├── icons: { main: FaTrash }
├── colors: { primary: '#DC2626' }
└── estimatedImpact: { amount: 13, period: 'month' }
         │
         │ Import
         ▼
WRAPPER (src/components/quest/CutSubscriptionQuest.jsx)
└── <QuestFlowWrapper
      questId="cut-subscription-v1"
      questConfig={cutSubscriptionQuest}    ← Import DATA
      coreSteps={CutSubscriptionCore.steps} ← Import CORE
    />
         │
         ├─── DATA utilisée par QuestIntro (affichage)
         │
         └─── CORE utilisée par QuestFlowWrapper (steps)
                     │
                     ▼
CORE (src/components/quest/cores/CutSubscriptionCore.jsx)
├── Step 1: <SubscriptionSelector />
├── Step 2: <AmountInput />
└── Step 3: <CancellationGuide />
         │
         │ Render
         ▼
    User Interface
```

---

## 🎯 Séparation des responsabilités

```
┌──────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│                  (src/data/quests/)                      │
│                                                          │
│  🎯 Quoi : Métadonnées, textes, config                  │
│  📊 Format : JavaScript objects                          │
│  🔧 Modifiable par : Équipe produit, content writers    │
│  ♻️ Réutilisable : Oui (API, admin, tests)              │
│                                                          │
│  Exemples :                                              │
│  • Titre de la quête                                     │
│  • Description                                           │
│  • Objectifs (bullets)                                   │
│  • Impact estimé                                         │
│  • Icônes, couleurs                                      │
│  • XP, durée, difficulté                                 │
└──────────────────────────────────────────────────────────┘
                            ▲
                            │ Import
                            │
┌──────────────────────────────────────────────────────────┐
│                       UI LAYER                           │
│               (src/components/quest/)                    │
│                                                          │
│  🎨 Quoi : Composants React, logic d'interaction         │
│  📊 Format : JSX components                              │
│  🔧 Modifiable par : Développeurs front-end              │
│  ♻️ Réutilisable : Composants génériques oui             │
│                                                          │
│  Exemples :                                              │
│  • Formulaire de saisie                                  │
│  • Validation d'input                                    │
│  • Animation                                             │
│  • Gestion d'état local                                  │
│  • Handlers onClick, onChange                            │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Exemple : Ajouter "Emergency Fund" quest

### **Étape 1 : DATA**
```javascript
// src/data/quests/emergency-fund-v1.js

export const emergencyFundQuest = {
  id: 'emergency-fund-v1',
  title_fr: 'Crée ton fonds d\'urgence',
  // ... toutes les métadonnées
};
```

### **Étape 2 : CORE**
```javascript
// src/components/quest/cores/EmergencyFundCore.jsx

const Step1 = ({ questData, updateQuestData }) => {
  // UI pour calculer l'objectif
};

export default {
  steps: [Step1, Step2],
  validate: validateFn
};
```

### **Étape 3 : WRAPPER**
```javascript
// src/components/quest/EmergencyFundQuest.jsx

import { emergencyFundQuest } from '../../data/quests/emergency-fund-v1';
import EmergencyFundCore from './cores/EmergencyFundCore';

export default () => (
  <QuestFlowWrapper
    questConfig={emergencyFundQuest}
    coreSteps={EmergencyFundCore.steps}
  />
);
```

### **Étape 4 : ROUTER**
```javascript
// src/components/pages/QuestRouter.jsx

const QUEST_COMPONENTS = {
  'emergency-fund-v1': EmergencyFundQuest,
};
```

---

## 🔗 Flux de données complet

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks quest card in /quests                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
        navigate('/quests/cut-subscription-v1')
                  │
                  ▼
        ┌─────────────────────┐
        │   QuestRouter       │ ← Map ID to component
        └─────────┬───────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │  CutSubscriptionQuest        │
   │                              │
   │  Import DATA:                │
   │  ├─ cutSubscriptionQuest ────┼─── src/data/quests/
   │                              │
   │  Import CORE:                │
   │  └─ CutSubscriptionCore ─────┼─── src/components/quest/cores/
   │                              │
   └──────────┬───────────────────┘
              │
              ▼
   ┌──────────────────────────────┐
   │  QuestFlowWrapper            │
   │  (orchestrator)              │
   │                              │
   │  Props:                      │
   │  • questConfig (DATA)        │
   │  • coreSteps (UI)            │
   └──────────┬───────────────────┘
              │
              ├─── currentStep = -1 → QuestIntro (uses questConfig)
              │
              ├─── currentStep = 0  → CoreStep[0] (SubscriptionSelector)
              │
              ├─── currentStep = 1  → CoreStep[1] (AmountInput)
              │
              ├─── currentStep = 2  → CoreStep[2] (CancellationGuide)
              │
              └─── currentStep = 3  → QuestCompletion (uses questData)
```

---

## 🎯 Points clés à retenir

### ✅ DATA (`src/data/quests/`)
- **Un fichier par quête** : `{nom}-v{version}.js`
- **Contenu** : métadonnées, textes, config
- **Modifiable par** : toute l'équipe (même non-dev)
- **Format** : JavaScript object (facilement transformable en JSON)

### ✅ CORE (`src/components/quest/cores/`)
- **Un fichier par quête** : `{Nom}Core.jsx`
- **Contenu** : steps React, validation UI
- **Modifiable par** : développeurs React
- **Format** : Composants React + validation logic

### ✅ WRAPPER (`src/components/quest/`)
- **Un fichier par quête** : `{Nom}Quest.jsx`
- **Contenu** : point d'entrée (35 lignes)
- **Rôle** : faire le lien entre DATA et CORE
- **Format** : Composant React simple

### ✅ GENERIC (`src/components/quest/generic/`)
- **Composants réutilisables** : QuestIntro, QuestFlowWrapper, QuestCompletion
- **Contenu** : logic commune à toutes les quêtes
- **Modifiable par** : lead dev (rarement)
- **Rôle** : éviter la duplication de code

---

## 📊 Comparaison avec d'autres patterns

### ❌ **Pattern monolithique** (évité)
```
src/components/quest/
└── CutSubscriptionQuest.jsx (539 lignes)
    ├─ Données hardcodées
    ├─ Textes dans le JSX
    ├─ Logic UI
    └─ Gestion état
```
**Problèmes** : duplication, difficile à maintenir

### ✅ **Pattern séparé** (adopté)
```
src/
├── data/quests/
│   └── cut-subscription-v1.js (config)
│
└── components/quest/
    ├── cores/
    │   └── CutSubscriptionCore.jsx (UI)
    └── CutSubscriptionQuest.jsx (wrapper 35L)
```
**Avantages** : clarté, maintenabilité, scalabilité

---

## 🚀 Prêt pour 100+ quêtes !

Avec cette structure, ajouter 100 quêtes = **répéter ce pattern 100 fois** :

```
1 quête = 3 fichiers
├─ 1 fichier DATA     (src/data/quests/)
├─ 1 fichier CORE     (src/components/quest/cores/)
└─ 1 fichier WRAPPER  (src/components/quest/)
     + 1 ligne dans QuestRouter
```

**Temps par quête : 10-15 minutes** ⚡

