# 🎮 Guide de Création de Quêtes Moniyo

Ce guide documente l'architecture et les conventions pour créer de nouvelles quêtes dans l'application Moniyo.

---

## 📁 Structure d'un dossier de quête

```
pilotage/[quest-name]/
├── [QuestName]Flow.jsx      # Contrôleur principal (orchestration des phases)
├── index.js                  # Exports publics
├── metadata.js               # Configuration et métadonnées
├── insightData.js            # Contenu localisé (slides, tips, impacts)
├── assets/                   # Images 3D, icônes spécifiques
│   └── icon.png
└── screens/                  # Composants d'écran
    ├── ProtocolScreen.jsx    # Phase 1: Briefing
    ├── ExecutionScreen.jsx   # Phase 2: Action utilisateur
    └── DebriefScreen.jsx     # Phase 3: Résultats
```

---

## 🔄 Phases disponibles

Chaque quête suit un flux en **3 phases minimum** :

| Phase | Nom recommandé | Description |
|-------|----------------|-------------|
| 1 | `PROTOCOL` / `BRIEFING` | Introduction, social proof, tactiques |
| 2 | `EXECUTION` | Action principale de l'utilisateur |
| 3 | `DEBRIEF` | Résultats, XP, impact financier |

### Phases optionnelles

Pour des quêtes plus complexes, tu peux ajouter des phases intermédiaires :

```javascript
// Dans le Flow.jsx
const [phase, setPhase] = useState('PROTOCOL');

// Exemples de phases additionnelles :
// - 'ANALYSIS' : Analyse de données avant exécution
// - 'CONFIRMATION' : Double validation
// - 'BONUS' : Écran bonus après débrief
```

---

## 📦 Fichiers à créer

### 1. `metadata.js` - Configuration obligatoire

```javascript
export const myQuestQuest = {
    // ===== IDENTIFIANTS (obligatoire) =====
    id: 'my-quest',              // kebab-case, unique
    i18nKey: 'myQuest',          // Clé dans quests.json

    // ===== CATÉGORISATION =====
    category: 'pilotage',        // pilotage | croissance | defense | strategie
    country: 'fr-FR',
    difficulty: 'beginner',      // beginner | intermediate | advanced

    // ===== RÉCOMPENSES =====
    xp: 120,                     // Points d'expérience
    duration: 5,                 // Minutes estimées

    // ===== FLAGS =====
    isPremium: false,
    starterPack: true,           // Visible dans le starter pack
    order: 3,                    // Ordre d'affichage

    // ===== IMPACT FINANCIER =====
    estimatedImpact: {
        type: 'savings',          // 'savings' | 'earnings' | 'one-time' | 'none'
        amount: 50,               // Montant estimé
        period: 'month'           // 'month' | 'year' | 'one-time' | null
    },

    // ===== VISUELS =====
    icons: {
        main: require('./assets/icon.png')
    },

    colors: {
        primary: '#E2FF00',       // Volt yellow par défaut
        secondary: '#1A1A1A',
        accent: '#FFFFFF'
    }
};
```

### 2. `insightData.js` - Contenu localisé

Ce fichier contient tout le contenu textuel de la quête, bilingue (fr/en) :

```javascript
// ===== CAROUSEL SOCIAL PROOF (ProtocolScreen) =====
export const socialProofSlides = {
    fr: [
        {
            id: 'slide-1',
            title: 'TITRE DU SLIDE',
            stat: '85%',
            text: "Description du statistique...",
            source: 'Source Research 2023'
        }
    ],
    en: [/* même structure */]
};

// ===== TIPS / TACTIQUES (ProtocolScreen) =====
export const proTips = {
    fr: [
        {
            id: 'tip-1',
            title: 'TITRE ACTION',
            iconName: 'Search',  // Lucide icon name
            body: "Description avec **texte en gras**..."
        }
    ],
    en: [/* même structure */]
};

// ===== IMPACT CONCRET (DebriefScreen) =====
export const getConcreteImpact = (amount, locale = 'fr') => {
    // Retourne { icon: '☕', text: "C'est X cafés..." }
};
```

### 3. `[QuestName]Flow.jsx` - Contrôleur principal

Voir `Flow.template.jsx` pour le modèle complet.

---

## 🎨 Types d'ExecutionScreen

### Type 1: Sélection dans une grille (cut-subscription)
- Grille d'options (Netflix, Spotify, etc.)
- Champ personnalisé
- Input montant

### Type 2: Slider + Calcul (micro-expenses)
- Sélection catégorie
- Slider pour montant journalier
- Projection temporelle

### Type 3: Quiz / Questionnaire (future)
- Questions à choix multiples
- Score final

### Type 4: Formulaire multi-étapes (future)
- Wizard avec sous-étapes
- Validation par étape

---

## 🔌 Intégration avec le registre

Après création, **enregistrer la quête** dans `registry.js` :

```javascript
// src/features/quests/registry.js
import { myQuestQuest, MyQuestFlow } from './pilotage/my-quest';

// Ajouter au questRegistry
export const questRegistry = {
    // ...autres quêtes
    'my-quest': {
        metadata: myQuestQuest,
        Flow: MyQuestFlow
    }
};
```

---

## 🌍 Traductions i18n

Ajouter les traductions dans `/public/locales/{lang}/quests.json` :

```json
{
    "myQuest": {
        "title": "Titre de la Quête",
        "description": "Description courte...",
        "codename": "NOM DE CODE",
        "steps": {
            "step1": "Étape 1...",
            "step2": "Étape 2..."
        }
    }
}
```

---

## ✅ Checklist de création

- [ ] Copier le dossier `_template` vers `pilotage/[quest-name]`
- [ ] Renommer tous les fichiers (TemplateFlow → MyQuestFlow)
- [ ] Remplir `metadata.js` avec les vraies valeurs
- [ ] Créer `insightData.js` avec le contenu bilingue
- [ ] Personnaliser les 3 screens
- [ ] Ajouter les assets 3D dans `/assets/`
- [ ] Enregistrer dans `registry.js`
- [ ] Ajouter les traductions dans `quests.json` (fr + en)
- [ ] Tester le flow complet

---

## 📚 Exemples de référence

| Quête | Type Execution | Fonctionnalité clé |
|-------|----------------|-------------------|
| `cut-subscription` | Grille + Input | Sélection service + montant |
| `micro-expenses` | Slider + Projection | Calcul temporel dynamique |

Pour chaque nouvelle quête, **s'inspirer des implémentations existantes** dans `/pilotage/`.

---

## 🔧 Composants partagés disponibles

```javascript
// Import depuis shared
import {
    XPCard,
    StreakCard,
    CompoundCard,
    ConcreteImpactCard
} from '../../shared';
```

Ces composants sont utilisés dans `DebriefScreen` pour afficher les récompenses.
