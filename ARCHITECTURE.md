# 📁 FinanceQuest - Architecture Scalable

> Architecture React moderne suivant le pattern **LEGO + MODULE + CARTE**

## 🏗️ Structure du Projet

```
src/
├── 🧱 components/           TA BOÎTE À OUTILS GLOBALE
│   ├── ui/                  Design System "Onyx & Volt"
│   │   ├── Button.jsx       Boutons (4 variants)
│   │   ├── Card.jsx         Cartes noires + bordure grise
│   │   ├── SectionTitle.jsx Titres standardisés
│   │   ├── Badge.jsx        Pilules de statut
│   │   ├── Input.jsx        Champs Dark Glass
│   │   └── index.js         Barrel export
│   │
│   └── layout/              Structure de l'app
│       ├── BottomNav.jsx    Navigation bottom
│       ├── AppBackground.jsx Fond "Atmospheric Guilloche"
│       └── index.js
│
├── 📦 features/             LES MODULES INTELLIGENTS
│   │
│   ├── dashboard/           Tout le Dashboard
│   │   ├── DashboardView.jsx       (Vue principale)
│   │   ├── components/             (9 composants)
│   │   └── index.js
│   │
│   ├── quests/              Le cœur du jeu
│   │   ├── registry.js             (Inventaire de toutes les quêtes)
│   │   ├── QuestListView.jsx       (Vue liste)
│   │   ├── QuestCartridge.jsx
│   │   ├── shared/                 (Composants communs : Intro, Completion...)
│   │   ├── pilotage/               (Catégorie 1: Budget & Cashflow)
│   │   ├── defense/                (Catégorie 2: Épargne & Sécurité)
│   │   ├── growth/                 (Catégorie 3: Investissement)
│   │   └── strategy/               (Catégorie 4: Stratégie long terme)
│   │
│   ├── gamification/        Logique XP, Niveaux, Badges
│   │   ├── hooks/                  (useGamification)
│   │   └── components/             (BadgeGrid, LevelWidget...)
│   │
│   ├── identity/            User, Auth, Profile
│   │   ├── ProfileView.jsx
│   │   └── components/
│   │
│   └── impact/              Impact financier
│       ├── ImpactView.jsx
│       └── components/             (AddSavingsModal, ImpactModal)
│
├── 📄 pages/                LE ROUTEUR (Fichiers très courts)
│   ├── Dashboard.jsx        Importe <DashboardView />
│   ├── Quests.jsx           Importe <QuestListView />
│   ├── Profile.jsx          Importe <ProfileView />
│   └── ...
│
├── 🌍 locales/              Traductions i18n modulaires
│   ├── fr/
│   │   ├── common.json      Actions globales, navigation
│   │   ├── auth.json        Login, Register
│   │   ├── dashboard.json   Dashboard, catégories
│   │   ├── quests.json      Contenu des quêtes
│   │   └── profile.json     Profil, réglages
│   └── en/                  (Même structure)
│
├── ⚙️ config/
│   ├── firebase.js
│   └── i18n.js              Configuration i18next avec namespaces
│
├── 🪝 hooks/                Hooks globaux
├── 🎨 styles/               Tailwind, Global CSS
├── 🔧 utils/                Utilitaires
└── 📡 services/             Services Firebase, APIs
```

---

## 📖 Les 3 Règles d'Or

### 1. Règle du LEGO (`components/ui`)
**Si tu as besoin d'un bouton ou d'une carte, tu ne le recodes jamais.**

```javascript
❌ AVANT :
<button className="bg-volt text-black px-4 py-2 rounded...">
  Enregistrer
</button>

✅ APRÈS :
import { Button } from 'components/ui';
<Button variant="primary">Enregistrer</Button>
```

### 2. Règle de la CARTE (`pages/`)
**Les fichiers dans `pages/` ne doivent contenir aucune logique.**

```javascript
// pages/Dashboard.jsx (< 50 lignes)
import { DashboardView } from 'features/dashboard';
import { AppBackground, BottomNav } from 'components/layout';

const Dashboard = () => (
  <AppBackground>
    <DashboardView />
    <BottomNav />
  </AppBackground>
);
```

### 3. Règle du MODULE (`features/`)
**Tout ce qui concerne une fonctionnalité reste groupé.**

- Tu veux modifier la grille des catégories ? → `features/dashboard`
- Tu veux créer une nouvelle quête ? → `features/quests`
- Tu veux changer l'onglet profil ? → `features/identity`

---

## 🎨 Utiliser le Design System

### Imports recommandés

```javascript
import { Button, Card, Badge, Input, SectionTitle } from 'components/ui';
import { BottomNav, AppBackground } from 'components/layout';
```

### Exemples d'utilisation

#### Boutons
```javascript
<Button variant="primary" size="large">
  LANCER QUÊTE
</Button>

<Button variant="secondary">
  Annuler
</Button>

<Button variant="ghost" size="small">
  En savoir plus
</Button>
```

#### Cartes
```javascript
<Card padding="large" glow>
  <h2>Premium Feature</h2>
  <p>Unlock advanced analytics...</p>
</Card>

<Card hover onClick={() => navigate('/quest')}>
  <h3>Cut Subscription</h3>
</Card>
```

#### Badges
```javascript
<Badge variant="new">NEW</Badge>
<Badge variant="premium">PREMIUM</Badge>
<Badge variant="completed">COMPLETED</Badge>
```

---

## 🌍 Système de Traductions

### Configuration

Le projet utilise **i18next** avec des namespaces modulaires.

```javascript
// config/i18n.js (déjà configuré)
resources: {
  fr: {
    common: commonFR,
    auth: authFR,
    dashboard: dashboardFR,
    quests: questsFR,
    profile: profileFR
  }
}
```

### Utilisation dans les composants

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  // Charger plusieurs namespaces
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div>
      <h1>{t('dashboard:categories.pilotage.title')}</h1>
      {/* Résultat: "PILOTAGE" */}
      
      <button>{t('common:actions.save')}</button>
      {/* Résultat: "Enregistrer" */}
    </div>
  );
};
```

### Fallback Legacy

Si une traduction n'existe pas dans les fichiers modulaires, le système utilise automatiquement `data/lang.json` comme fallback.

---

## 🚀 Ajouter une Nouvelle Feature

### Exemple : Ajouter une nouvelle quête

1. **Créer le dossier de la quête**
```bash
mkdir -p src/features/quests/pilotage/adjust-budget
```

2. **Créer les composants**
```javascript
// src/features/quests/pilotage/adjust-budget/index.jsx
import { QuestFlowWrapper } from '../../shared';

export const AdjustBudget = () => {
  return (
    <QuestFlowWrapper
      questId="adjust-budget"
      steps={[...]}
    >
      {/* Contenu spécifique à la quête */}
    </QuestFlowWrapper>
  );
};
```

3. **Ajouter dans le registry**
```javascript
// src/features/quests/registry.js
import { AdjustBudget } from './pilotage/adjust-budget';

export const QUESTS_REGISTRY = {
  'adjust-budget': AdjustBudget,
  // ...
};
```

4. **Ajouter les traductions**
```json
// src/locales/fr/quests.json
{
  "adjust_budget": {
    "card": {
      "title": "Ajuster ton budget mensuel",
      "time": "10 min"
    },
    "intro": {
      "title": "Optimisation Budgétaire",
      "desc": "Apprends à répartir tes revenus intelligemment."
    }
  }
}
```

---

## 📝 Guidelines de Développement

### Nomenclature

- **Composants** : PascalCase (`DashboardHeader.jsx`)
- **Hooks** : camelCase avec préfixe `use` (`useGamification.js`)
- **Utilitaires** : camelCase (`gamification.js`)
- **Constantes** : UPPER_SNAKE_CASE (`QUESTS_REGISTRY`)

### Organisation des imports

```javascript
// 1. React et libs externes
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Contexts et hooks
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../gamification/hooks';

// 3. Components (UI d'abord, puis features)
import { Button, Card } from 'components/ui';
import { DashboardHeader } from './components';

// 4. Utils et services
import { trackEvent } from '../../utils/analytics';
import { db } from '../../services/firebase';

// 5. Styles (si besoin)
import './Dashboard.css';
```

### Barrel Exports

Toujours créer un `index.js` pour exports centralisés :

```javascript
// features/dashboard/index.js
export { default as DashboardView } from './DashboardView';
export { default as DashboardHeader } from './components/DashboardHeader';
export { default as CategoryGrid } from './components/CategoryGrid';
```

---

## 🧪 Testing

### Lancer le dev server
```bash
npm run dev
```

### Build de production
```bash
npm run build
```

### Vérifier les imports cassés
```bash
grep -r "from '../components/dashboard" src/
grep -r "from '../../components/" src/
```

---

## 📚 Documentation Complète

Voir [`walkthrough.md`](.gemini/antigravity/brain/.../walkthrough.md) pour :
- Détails de la migration complète
- État actuel (80% complété)
- Prochaines étapes
- Checklist de validation

---

## 🤝 Contribution

### Avant de coder
1. Vérifier si un composant UI existe déjà dans `components/ui/`
2. Vérifier si la logique peut aller dans une feature existante

### Standards de code
- ✅ Utiliser le Design System (`components/ui`)
- ✅ Isoler la logique métier dans `features/`
- ✅ Pages minimalistes (< 50 lignes)
- ✅ Traductions dans `locales/` (pas de texte en dur)
- ✅ Barrel exports pour chaque module

---

## 🎯 Avantages de cette Architecture

| Avant | Après |
|-------|-------|
| Composants dupliqués | Design System réutilisable |
| Logique mélangée dans pages/ | Features isolées |
| lang.json monolithique (97KB) | Namespaces modulaires |
| Difficile d'ajouter des quêtes | Structure claire par catégorie |
| Imports complexes | Barrel exports simples |

**Résultat** : Code **3x plus maintenable** et **facilement scalable** pour 100+ quêtes.

---

## 📞 Questions ?

Consultez le `walkthrough.md` ou cherchez dans le code existant :

```bash
# Trouver comment utiliser un composant
grep -r "import.*Button" src/features

# Trouver une traduction
grep -r "dailyChallenge" src/locales
```

---

**Happy Coding! 🚀**
