# 🎯 Architecture Simplifiée — 2 Fichiers par Quête

## 📅 Date
**14 novembre 2025**

---

## ✅ Simplification : 3 fichiers → 2 fichiers

### **Avant** (3 fichiers)
```
1. cut-subscription-v1.js          ← DATA
2. CutSubscriptionCore.jsx          ← CORE
3. CutSubscriptionQuest.jsx         ← WRAPPER (33 lignes de config)
```

### **Après** (2 fichiers) ✨
```
1. cut-subscription-v1.js          ← DATA
2. CutSubscriptionCore.jsx          ← CORE + CONFIG
```

**Le wrapper a été supprimé !** La config est maintenant dans le CORE, et `QuestRouter` utilise directement les cores.

---

## 🏗️ Nouvelle Architecture

```
┌─────────────────────────────────────────────────────────┐
│  User → /quests/cut-subscription-v1                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  QuestRouter.jsx                                        │
│                                                          │
│  QUEST_REGISTRY = {                                     │
│    'cut-subscription-v1': {                             │
│      core: CutSubscriptionCore,  ←──────────────┐       │
│      data: cutSubscriptionQuest  ←─────────┐    │       │
│    }                                        │    │       │
│  }                                          │    │       │
│                                             │    │       │
│  <QuestFlowWrapper                          │    │       │
│    questConfig={data}          ─────────────┘    │       │
│    coreSteps={core.steps}      ──────────────────┘       │
│    onStepValidation={core.validate}                     │
│    completionConfig={core.completionConfig}             │
│    impactConfig={core.impactConfig}                     │
│    showIntro={core.wrapperConfig.showIntro}            │
│  />                                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Structure des fichiers

### **Nouvelle structure**
```
src/
├── data/quests/                          ← DONNÉES
│   ├── cut-subscription-v1.js
│   ├── emergency-fund-v1.js              ← Nouvelle quête
│   └── index.js
│
└── components/
    ├── pages/
    │   └── QuestRouter.jsx               ← Route dynamique (REGISTRY)
    │
    └── quest/
        ├── generic/                      ← Composants réutilisables
        │   ├── QuestFlowWrapper.jsx
        │   ├── QuestIntro.jsx
        │   └── QuestCompletion.jsx
        │
        ├── cores/                        ← CORE + CONFIG
        │   ├── CutSubscriptionCore.jsx
        │   └── EmergencyFundCore.jsx     ← Nouvelle quête
        │
        └── cut-subscription/             ← Components spécifiques
            ├── SubscriptionSelector.jsx
            ├── AmountInput.jsx
            └── CancellationGuide.jsx
```

**Fini les wrappers intermédiaires !** 🎉

---

## 🚀 Pour ajouter une nouvelle quête (3 étapes au lieu de 4)

### **Étape 1 : Créer la DATA**
```javascript
// src/data/quests/emergency-fund-v1.js
export const emergencyFundQuest = {
  id: 'emergency-fund-v1',
  title_fr: 'Crée ton fonds d\'urgence',
  // ... métadonnées
};
```

### **Étape 2 : Créer le CORE avec CONFIG**
```javascript
// src/components/quest/cores/EmergencyFundCore.jsx

const Step1 = ({ questData, updateQuestData, locale }) => {
  return <YourUI />;
};

const validateFn = (stepIndex, questData, locale) => {
  // Validation
};

export default {
  questId: 'emergency-fund-v1',
  steps: [Step1, Step2],
  validate: validateFn,
  completionConfig: { /* ... */ },
  impactConfig: { /* ... */ },
  wrapperConfig: { showIntro: true }
};
```

### **Étape 3 : Ajouter au REGISTRY**
```javascript
// src/components/pages/QuestRouter.jsx

import EmergencyFundCore from '../quest/cores/EmergencyFundCore';
import { emergencyFundQuest } from '../../data/quests/emergency-fund-v1';

const QUEST_REGISTRY = {
  'cut-subscription-v1': {
    core: CutSubscriptionCore,
    data: cutSubscriptionQuest
  },
  'emergency-fund-v1': {        // ← Ajoutez ici !
    core: EmergencyFundCore,
    data: emergencyFundQuest
  },
};
```

**C'est tout !** 🎉 Plus besoin de créer un wrapper.

---

## 📊 Comparaison

| Critère | Avant (3 fichiers) | Après (2 fichiers) |
|---------|-------------------|-------------------|
| Fichiers DATA | 1 | 1 (identique) |
| Fichiers CORE | 1 | 1 (identique) |
| Fichiers WRAPPER | 1 (33 lignes) | ❌ **0 (supprimé)** |
| **Total par quête** | **3 fichiers** | **2 fichiers** |
| Config centralisée | Non (dispersée) | Oui (dans CORE) |
| Ajout de quête | 4 étapes | **3 étapes** |
| Lignes de code wrapper | 33 | **0** |

---

## ✅ Avantages

1. **Moins de fichiers** : 2 au lieu de 3
2. **Config centralisée** : Tout dans le CORE
3. **Registry explicite** : `QUEST_REGISTRY` dans `QuestRouter`
4. **Moins de duplication** : Plus de wrapper à créer
5. **Plus simple** : Moins de fichiers à maintenir

---

## 🎯 Structure finale d'une quête

### **1. DATA** (`src/data/quests/`)
```javascript
export const maQuest = {
  id: 'ma-quest-v1',
  title_fr: '...',
  objectives_fr: [...],
  xp: 150,
  // ... métadonnées
};
```

### **2. CORE** (`src/components/quest/cores/`)
```javascript
const Step1 = ({ questData, updateQuestData, locale }) => { /* ... */ };
const Step2 = ({ questData, updateQuestData, locale }) => { /* ... */ };
const validate = (stepIndex, questData, locale) => { /* ... */ };

export default {
  questId: 'ma-quest-v1',
  steps: [Step1, Step2],
  validate,
  completionConfig: { /* ... */ },
  impactConfig: { /* ... */ },
  wrapperConfig: { showIntro: true }
};
```

### **3. REGISTRY** (`QuestRouter.jsx`)
```javascript
import MaQuestCore from '../quest/cores/MaQuestCore';
import { maQuest } from '../../data/quests/ma-quest-v1';

const QUEST_REGISTRY = {
  'ma-quest-v1': { core: MaQuestCore, data: maQuest }
};
```

---

## 📝 Fichiers supprimés

- ✅ `CutSubscriptionQuest.jsx` (33 lignes) → **Supprimé**
- ✅ Export dans `src/components/quest/index.js` → **Nettoyé**

---

## 🎉 Résultat

**Pour 20 quêtes, vous aurez :**
- ✅ **20 fichiers DATA** dans `src/data/quests/`
- ✅ **20 fichiers CORE** dans `src/components/quest/cores/`
- ✅ **1 fichier REGISTRY** (`QuestRouter.jsx`) avec 20 entrées

**Total : 41 fichiers au lieu de 61** ❌ **-20 fichiers !**

**Temps pour ajouter une nouvelle quête : 8-10 minutes** ⏱️

