# Quêtes Actionnables - Documentation

## 🎯 Vision

Les nouvelles quêtes sont **actionnables** : elles guident l'utilisateur vers des actions concrètes qui génèrent des **économies réelles mesurables**.

Contrairement aux anciennes quêtes "éducatives" (archivées), chaque quête actionnable :
- ✅ Propose une action concrète à faire
- ✅ Guide pas à pas l'utilisateur
- ✅ Enregistre l'économie réalisée
- ✅ Met à jour l'Impact total immédiatement

## 📁 Structure

```
quests/
├── index.js                    # Export central + helpers
├── cut-subscription-v1.js      # Quête #1 : Couper un abonnement
└── README.md                   # Cette documentation
```

## 🏗️ Anatomie d'une Quête

Chaque quête est un objet JavaScript avec la structure suivante :

### Métadonnées
```javascript
{
  id: 'quest-id',               // Identifiant unique
  version: '1.0',               // Version de la quête
  type: 'action',               // Type : action | challenge | habit
  
  // Configuration
  starterPack: true,            // Apparaît dans le Starter Pack
  category: 'budget',           // Catégorie principale
  tags: ['quickwin'],           // Tags pour filtrage
  difficulty: 'beginner',       // beginner | intermediate | advanced | expert
  duration: 8,                  // Durée en minutes
  
  // Récompenses
  xp: 120,                      // Points d'expérience
  isPremium: false,             // Gratuit ou premium
  badges: ['badge_id'],         // Badges débloqués
  
  // Impact
  estimatedImpact: {
    amount: 13,                 // Montant moyen
    period: 'month',            // month | year | week | day | once
    annual: 156,                // Impact annuel (calculé)
    currency: 'EUR'
  }
}
```

### Contenu i18n
```javascript
content: {
  fr: {
    title: "Titre de la quête",
    subtitle: "Sous-titre accrocheur",
    description: "Description complète...",
    objectives: ["Objectif 1", "Objectif 2"],
    
    cta: {
      start: "Je commence",
      continue: "Continuer",
      // ... autres CTAs
    },
    
    steps: {
      intro: { /* contenu step intro */ },
      choose: { /* contenu step choose */ },
      // ... autres steps
    },
    
    toast: {
      saved: "Message de succès",
      error: "Message d'erreur"
    }
  },
  en: { /* idem en anglais */ }
}
```

### Steps (Flow)
```javascript
steps: [
  {
    id: 'intro',
    type: 'info',              // info | select_amount | checklist | impact_prompt | finish
    order: 1,
    skippable: false,
    required: true,
    
    // Validation (si applicable)
    validation: {
      amount: {
        required: true,
        type: 'number',
        min: 0.01,
        max: 1000
      }
    },
    
    // Analytics
    analytics: {
      view: 'quest_step_viewed',
      complete: 'quest_step_completed'
    }
  },
  // ... autres steps
]
```

### Intégrations
```javascript
integrations: {
  // Impact system
  impact: {
    enabled: true,
    component: 'AddSavingsModal',
    updateOnSuccess: true
  },
  
  // Gamification
  gamification: {
    enabled: true,
    xpReward: 120,
    badges: ['badge_id']
  },
  
  // Analytics
  analytics: {
    provider: 'firebase',
    events: { /* liste des événements */ }
  }
}
```

## 🎮 Types de Steps

### 1. `info` - Introduction / Information
Affiche du contenu informatif avec un CTA pour continuer.

```javascript
{
  id: 'intro',
  type: 'info',
  // Contenu dans content.{lang}.steps.intro
}
```

### 2. `select_amount` - Sélection + Montant
Permet de sélectionner un service/item et entrer un montant.

```javascript
{
  id: 'choose',
  type: 'select_amount',
  validation: {
    service: { required: true },
    amount: { 
      required: true,
      type: 'number',
      min: 0.01,
      max: 1000 
    }
  }
}
```

### 3. `checklist` - Liste de tâches
Guide l'utilisateur à travers une série d'actions.

```javascript
{
  id: 'confirm',
  type: 'checklist',
  skippable: true,
  skipCTA: 'cta.later'
  // Items de checklist dans content.{lang}.steps.confirm.checklist
}
```

### 4. `impact_prompt` - Enregistrer l'économie
Ouvre le modal d'ajout d'économie avec préfill.

```javascript
{
  id: 'impact',
  type: 'impact_prompt',
  modalConfig: {
    component: 'AddSavingsModal',
    prefill: {
      title: '{service}',
      amount: '{amount}',
      period: 'month',
      questId: 'quest-id',
      source: 'quest'
    }
  },
  duplicateDetection: {
    enabled: true,
    checkSameDay: true
  }
}
```

### 5. `finish` - Célébration finale
Affiche les résultats et propose les prochaines actions.

```javascript
{
  id: 'finish',
  type: 'finish',
  celebration: {
    enabled: true,
    type: 'confetti'
  },
  actions: [
    {
      id: 'view_impact',
      label: 'cta.viewImpact',
      type: 'primary',
      route: '/impact'
    }
  ]
}
```

## 📊 Analytics

Chaque quête tracke automatiquement :

### Événements principaux
- `quest_started` - Quête démarrée
- `quest_step_viewed` - Step affiché
- `quest_step_completed` - Step complété
- `quest_step_skipped` - Step sauté
- `quest_completed` - Quête terminée

### Événements Impact
- `impact_add_prompt_shown` - Modal impact affiché
- `impact_add_confirmed` - Économie ajoutée
- `impact_add_dismissed` - Modal fermé sans ajouter
- `prevented_duplicate` - Doublon détecté et évité

### Paramètres trackés
```javascript
{
  quest_id: 'cut-subscription-v1',
  user_id: 'xxx',
  time_spent: 360, // secondes
  result_annual: 156, // économie annuelle
  service: 'netflix',
  amount_month: 13
}
```

## 🔧 Utilisation dans l'App

### Import
```javascript
import { 
  allQuests, 
  starterPackQuests,
  getQuestById,
  getLocalizedQuest,
  getAvailableQuests,
  getRecommendedQuests 
} from '@/data/quests';
```

### Récupérer une quête
```javascript
// Par ID
const quest = getQuestById('cut-subscription-v1');

// Avec localisation
const localizedQuest = getLocalizedQuest('cut-subscription-v1', 'fr-FR');
```

### Filtrer les quêtes disponibles
```javascript
const userProfile = {
  isPremium: false,
  completedQuestIds: ['cut-subscription-v1'],
  country: 'fr-FR'
};

const available = getAvailableQuests(userProfile, 'fr-FR');
```

### Recommandations
```javascript
const recommended = getRecommendedQuests(userProfile, 3);
// Retourne 3 quêtes recommandées
```

### Stats
```javascript
import { getQuestsStats } from '@/data/quests';

const stats = getQuestsStats();
// {
//   total: 1,
//   free: 1,
//   premium: 0,
//   starter: 1,
//   totalPotentialImpact: 156,
//   byCategory: [...],
//   byDifficulty: [...]
// }
```

## 🎨 UI Components Nécessaires

Pour implémenter les quêtes, vous aurez besoin de ces composants :

### 1. QuestCard
Affiche une quête dans la liste.
```jsx
<QuestCard 
  quest={quest}
  locale={locale}
  onStart={() => navigateTo(`/quest/${quest.id}`)}
/>
```

### 2. QuestStepRenderer
Rend dynamiquement chaque type de step.
```jsx
<QuestStepRenderer
  step={currentStep}
  quest={quest}
  locale={locale}
  onComplete={handleStepComplete}
  onSkip={handleStepSkip}
/>
```

### 3. Modal Components
- `AddSavingsModal` - Déjà existant, pour l'ajout d'économies
- `DuplicateWarningModal` - Pour prévenir les doublons

### 4. Celebration Components
- `Confetti` - Animation de célébration
- `FinishCard` - Carte de fin avec résultats

## 🔐 Sécurité & Validation

### Côté Client
- Validation des montants (Number.isFinite, min, max)
- Validation des champs requis
- UI feedback immédiat

### Côté Serveur (Firestore Rules)
```
// Protections en place :
- verified: server_only
- source: server_only (forcé à 'quest')
- questId: server_only
- timestamp: serverTimestamp()
```

### Duplicate Detection
Logique douce côté client :
1. Cherche événements du même jour
2. Même questId
3. Même service (title contains)
4. Montant ±20%
5. → Prompt confirmation si trouvé

## 📝 Créer une Nouvelle Quête

### 1. Créer le fichier
```bash
touch src/data/quests/ma-quete-v1.js
```

### 2. Structure de base
```javascript
export const maQueteQuest = {
  id: 'ma-quete-v1',
  version: '1.0',
  type: 'action',
  // ... métadonnées
  
  content: {
    fr: { /* contenu FR */ },
    en: { /* contenu EN */ }
  },
  
  steps: [ /* flow */ ],
  
  integrations: { /* config */ }
};

export default maQueteQuest;
```

### 3. Ajouter à l'index
```javascript
// dans index.js
import maQueteQuest from './ma-quete-v1.js';

export { maQueteQuest };

export const allQuests = [
  cutSubscriptionQuest,
  maQueteQuest, // <- ajouter ici
];
```

### 4. Tester
- Flow complet
- Validation des champs
- Ajout Impact
- Analytics
- i18n FR + EN
- Mobile responsive

## 🚀 Roadmap

### Phase 1 : Starter Pack (5 quêtes)
1. ✅ Couper un abonnement (FAIT)
2. ⏳ Ajuster le taux de prélèvement
3. ⏳ Réduire frais bancaires
4. ⏳ Optimiser forfait mobile
5. ⏳ Challenge No-Spend Week

### Phase 2 : Quick Wins (5 quêtes)
6. Vendre 5 objets inutilisés
7. Setup Cashback apps
8. Négocier assurance
9. Optimiser courses alimentaires
10. Annuler carte de crédit à frais

### Phase 3 : Projets Long Terme (5 quêtes)
11. Renégocier crédit immobilier
12. Optimiser déclaration fiscale
13. Side Hustle setup
14. Investissement auto
15. Plan retraite

## 📞 Support

Pour toute question sur la structure des quêtes ou l'implémentation :
- Voir les exemples dans `cut-subscription-v1.js`
- Consulter ce README
- Tester avec `getQuestsStats()` pour debug

