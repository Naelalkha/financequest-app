# 🏗️ Architecture des Quêtes V2 - Documentation

## 📅 Date de refactorisation
**14 novembre 2025**

---

## 🎯 Objectif

Refactoriser l'architecture des quêtes pour une **modularité maximale** :
- ✅ Composants génériques réutilisables (intro, fin, wrapper)
- ✅ Composants "core" spécifiques par quête
- ✅ Ajout de nouvelles quêtes en **10 minutes** au lieu de copier/coller 500+ lignes

---

## 📦 Structure des fichiers

```
src/
├── components/
│   ├── pages/
│   │   ├── QuestRouter.jsx           ← 🆕 Routeur dynamique /quests/:id
│   │   └── [autres pages...]
│   │
│   └── quest/
│       ├── generic/                  ← Composants réutilisables
│       │   ├── QuestFlowWrapper.jsx  ← Orchestrateur (steps, progression, Firestore)
│       │   ├── QuestIntro.jsx        ← 🆕 Page d'intro générique (icône, objectifs, badges)
│       │   ├── QuestCompletion.jsx   ← Page de fin générique (confetti, récap, XP)
│       │   └── index.js              ← Exports
│       │
│       ├── cores/                    ← Cœurs spécifiques par quête
│       │   ├── CutSubscriptionCore.jsx ← Steps pour "Couper 1 abonnement"
│       │   ├── EmergencyFundCore.jsx   ← (future quête)
│       │   └── index.js              ← Exports
│       │
│       ├── CutSubscriptionQuest.jsx  ← Point d'entrée (35 lignes au lieu de 539 !)
│       └── [composants partagés...]  ← SubscriptionSelector, AmountInput, etc.
```

---

## 🔧 Composants créés

### 0️⃣ **QuestRouter.jsx** (Routeur dynamique) 🆕

**Responsabilités :**
- ✅ Route `/quests/:id` → Composant de quête correspondant
- ✅ Mapping centralisé des IDs vers composants
- ✅ Redirection vers `/quests` si ID inconnu
- ✅ Facile à étendre : ajoutez juste une ligne !

**Usage :**
```javascript
// Dans App.jsx
<Route path="/quests/:id" element={<QuestRouter />} />

// Dans QuestRouter.jsx - Ajouter une nouvelle quête
const QUEST_COMPONENTS = {
  'cut-subscription-v1': CutSubscriptionQuest,
  'emergency-fund-v1': EmergencyFundQuest,  // ← Ajoutez ici !
};
```

**Avantages :**
- 🚀 **Une seule route** au lieu d'une route par quête
- 📦 **Scalable** : ajout de quête = 1 ligne d'import + 1 ligne dans le mapper
- 🔒 **Type-safe** : les IDs non mappés redirigent automatiquement
- 🧹 **Propre** : centralisé dans un seul fichier

---

### 1️⃣ **QuestIntro.jsx** (Page d'intro générique) 🆕

**Affiche :**
- 🎯 Icône principale géante avec animation
- 📋 Titre de la quête (style Impact, énorme)
- 📝 Description
- 🏅 Badges (difficulté, durée, XP, impact estimé)
- ✅ Objectifs (bullets numérotés)
- 🔑 Prérequis (si présents)
- 💡 Fun fact (si présent dans le premier step)
- 🚀 Bouton "Commencer la quête"

**Props :**
```javascript
<QuestIntro
  questConfig={cutSubscriptionQuest}  // Config complète de la quête
  onStart={handleStart}                // Callback pour démarrer
/>
```

**Usage dans QuestFlowWrapper :**
```javascript
<QuestFlowWrapper
  questId="cut-subscription-v1"
  questConfig={cutSubscriptionQuest}   // Config complète nécessaire
  showIntro={true}                     // Activer l'intro (par défaut true)
  {...otherProps}
/>
```

**Désactiver l'intro :**
Si vous voulez que la quête démarre direct sur le premier step :
```javascript
showIntro={false}
```

---

### 2️⃣ **QuestFlowWrapper.jsx** (Orchestrateur générique)

**Responsabilités :**
- ✅ Gestion des `currentStep` + navigation (next/back)
- ✅ Sauvegarde/chargement progression Firestore (`userQuests` collection)
- ✅ Analytics (tracking events)
- ✅ Header sticky avec :
  - Barre de progression visuelle
  - Indicateurs de steps (dots)
  - Badge XP
- ✅ AppBackground + layout responsive
- ✅ Affichage des core steps + QuestCompletion
- ✅ Modal Impact (AddSavingsModal)
- ✅ Confetti à la completion
- ✅ Redirection vers `/impact` après succès

**Props :**
```javascript
<QuestFlowWrapper
  questId="string"                     // Ex: 'cut-subscription-v1'
  questConfig={{ xp, title, ... }}     // Config de base
  coreSteps={[StepComponent1, ...]}    // Array de composants React
  onStepValidation={validateFn}        // Fonction de validation
  completionConfig={{ ... }}           // Config pour QuestCompletion
  impactConfig={{ title, period }}     // Config pour AddSavingsModal
/>
```

---

### 3️⃣ **QuestCompletion.jsx** (Fin générique)

**Affiche :**
- 🎉 Emoji + titre de félicitations animé
- 💰 Montant annuel économisé (énorme, style Impact)
- 🏆 Card récap avec :
  - Orbes décoratifs animés
  - Service name
  - Montant annuel/mensuel
  - XP gagnés
- ✨ Bouton "Ajouter à mon Impact"
- 👁️ Bouton "Voir mon Impact"

**Props :**
```javascript
<QuestCompletion
  questData={{ serviceName, monthlyAmount, ... }}
  xp={120}
  title={{ fr: '...', en: '...' }}
  message={fn or object}               // Message personnalisé
  onAddToImpact={fn}
  onViewImpact={fn}
  showImpactButton={true}
  customContent={ReactNode}            // Contenu spécifique optionnel
/>
```

---

### 4️⃣ **CutSubscriptionCore.jsx** (Core spécifique)

**Exports :**
- `SelectSubscriptionStep` : Sélection du service (SubscriptionSelector)
- `AmountInputStep` : Saisie du montant mensuel (AmountInput)
- `CancellationGuideStep` : Guide d'annulation (CancellationGuide)
- `validateCutSubscriptionStep` : Fonction de validation par step
- `cutSubscriptionCompletionConfig` : Config pour la page de fin
- `cutSubscriptionImpactConfig` : Config pour le modal Impact

**Structure :**
```javascript
export default {
  steps: [Step1, Step2, Step3],
  validate: validateFn,
  completionConfig: { ... },
  impactConfig: { ... }
}
```

---

### 5️⃣ **QuestRouter.jsx** (Registry centralisé) ⚡ SIMPLIFIÉ

**Plus besoin de wrapper intermédiaire !** Le router utilise directement DATA + CORE.

```javascript
import QuestFlowWrapper from '../quest/generic/QuestFlowWrapper';
import CutSubscriptionCore from '../quest/cores/CutSubscriptionCore';
import { cutSubscriptionQuest } from '../../data/quests/cut-subscription-v1';

const QUEST_REGISTRY = {
  'cut-subscription-v1': {
    core: CutSubscriptionCore,
    data: cutSubscriptionQuest
  },
  // 'emergency-fund-v1': { core: EmergencyFundCore, data: emergencyFundQuest },
};

const QuestRouter = () => {
  const { id } = useParams();
  const { core, data } = QUEST_REGISTRY[id];
  
  return (
    <QuestFlowWrapper
      questId={id}
      questConfig={data}
      coreSteps={core.steps}
      onStepValidation={core.validate}
      completionConfig={core.completionConfig}
      impactConfig={core.impactConfig}
      showIntro={core.wrapperConfig?.showIntro ?? true}
    />
  );
};
```

**Résultat : 2 fichiers par quête au lieu de 3 !**

---

## 🚀 Comment ajouter une nouvelle quête ? (3 étapes)

### Étape 1 : Créer la DATA

```javascript
// src/data/quests/emergency-fund-v1.js

export const emergencyFundQuest = {
  id: 'emergency-fund-v1',
  title_fr: 'Crée ton fonds d\'urgence',
  xp: 150,
  // ... métadonnées complètes
};
```

### Étape 2 : Créer le CORE avec CONFIG

```javascript
// src/components/quest/cores/EmergencyFundCore.jsx

const Step1 = ({ questData, updateQuestData, locale }) => {
  return <YourUI />;
};

const Step2 = ({ questData, updateQuestData, locale }) => {
  return <YourUI />;
};

const validate = (stepIndex, questData, locale) => {
  // Validation par step
  return { valid: true/false, message: '...' };
};

export default {
  questId: 'emergency-fund-v1',
  steps: [Step1, Step2],
  validate,
  completionConfig: { title: { fr: '...', en: '...' } },
  impactConfig: { title: (data) => `...`, period: 'month' },
  wrapperConfig: { showIntro: true }  // Config optionnelle
};
```

### Étape 3 : Ajouter au REGISTRY

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

**C'est tout ! 🎉**

La route `/quests/:id` utilise automatiquement le REGISTRY !

---

## 📊 Gains de la refactorisation

| Avant | Après |
|-------|-------|
| ❌ 539 lignes par quête | ✅ **2 fichiers** (DATA + CORE) |
| ❌ Code dupliqué (intro/outro) | ✅ Composants réutilisables |
| ❌ Logique Firestore répétée | ✅ Centralisée dans QuestFlowWrapper |
| ❌ Analytics répétés | ✅ Centralisés |
| ❌ Wrapper intermédiaire | ✅ **Supprimé** (registry direct) |
| ❌ Difficile à maintenir | ✅ 1 seul endroit à modifier |
| ❌ Incohérence de style | ✅ Style uniforme |
| ❌ 2h pour créer une quête | ✅ **8-10 min** pour créer une quête |

---

## 🔄 Prochaines étapes (optionnelles)

1. ✅ ~~**Créer QuestIntro.jsx**~~ → **FAIT ! Page d'intro magnifique avec animations**
2. **Migrer les autres quêtes** vers cette architecture (actuellement dans `quests-archive/`)
3. ✅ ~~**Supprimer la route spéciale** `/quests/cut-subscription-v1`~~ → **FAIT ! Routing dynamique en place**
4. **Créer des types de steps supplémentaires** (quiz, curseur, toggle, etc.)

---

## 📝 Notes techniques

### Gestion de la progression

La progression est sauvegardée dans Firestore :

```javascript
// Collection: userQuests
// Document ID: {userId}_{questId}
{
  userId: 'abc123',
  questId: 'cut-subscription-v1',
  currentStep: 2,
  questData: { serviceName: 'Netflix', monthlyAmount: 13.99 },
  status: 'active', // ou 'completed'
  progress: 75, // Pourcentage
  startedAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp (si completed)
}
```

### Props injectées dans les steps

Chaque step reçoit automatiquement :
```javascript
{
  questData: {},                  // État partagé de la quête
  updateQuestData: (newData) => {},  // Fonction pour mettre à jour
  onNext: () => {},               // Passer au step suivant (optionnel)
  locale: 'fr' | 'en'             // Langue actuelle
}
```

---

## ✅ Checklist de validation

- [x] QuestFlowWrapper créé et testé
- [x] QuestIntro créé (page d'intro magnifique avec animations)
- [x] QuestCompletion créé et testé
- [x] CutSubscriptionCore créé avec config complète
- [x] CutSubscriptionQuest **supprimé** (wrapper inutile)
- [x] QuestRouter créé avec REGISTRY (routing dynamique)
- [x] Routing simplifié : `/quests/:id` au lieu de routes individuelles
- [x] Architecture simplifiée : **2 fichiers** par quête au lieu de 3
- [x] Aucune erreur de lint
- [x] Architecture documentée
- [ ] Tests manuels de la quête complète (intro → steps → completion)
- [ ] Migration des autres quêtes (plus tard)

---

## 🎯 Résultat

**Vous avez maintenant une architecture modulaire, scalable et maintenable !**

Pour ajouter une nouvelle quête :
1. Créez le core (steps spécifiques)
2. Créez le point d'entrée (35 lignes)
3. Ajoutez la route

**Temps estimé : 10-15 minutes** au lieu de 2h+ ! 🚀

