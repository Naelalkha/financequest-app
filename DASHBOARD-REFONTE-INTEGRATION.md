# 🎨 Dashboard Refonte - Guide d'Intégration

**Date:** 2025-11-22  
**Version:** 2.0  
**Statut:** ✅ Prêt à intégrer

## 📋 Vue d'ensemble

Nouveaux composants créés pour la refonte UI/UX du Dashboard, entièrement connectés au backend Firebase existant.

## ✨ Composants créés

### 1. **DashboardBentoStatsV2** 
`src/components/dashboard/DashboardBentoStatsV2.jsx`

**Remplacement de:** `DashboardBentoStats.jsx`  
**Design:** Dark mode, style "receipt" pour l'impact log

**Props:**
```javascript
{
  badges: Array,        // Liste des badges (depuis gamification)
  recentImpact: Array   // Liste d'impacts récents
}
```

**Exemple d'utilisation:**
```jsx
<DashboardBentoStatsV2
  badges={gamification?.badges || []}
  recentImpact={[
    { id: 1, label: 'Netflix Cancel', time: '2h ago', val: 15 },
    { id: 2, label: 'Coffee Skip', time: '1d ago', val: 5 },
  ]}
/>
```

---

### 2. **MissionBoardModal**
`src/components/dashboard/MissionBoardModal.jsx`

**Nouveau composant** - Modal pour afficher toutes les quêtes disponibles

**Props:**
```javascript
{
  isOpen: boolean,            // État du modal
  onClose: Function,          // Fermer le modal
  onAccept: Function(quest),  // Accepter une quête
  onAiScan: Function,         // Scan IA pour recommandations
  isScanning: boolean,        // État du scan
  activeQuestIds: Array       // IDs des quêtes actives
}
```

**Exemple d'utilisation:**
```jsx
const [showMissionBoard, setShowMissionBoard] = useState(false);

<MissionBoardModal
  isOpen={showMissionBoard}
  onClose={() => setShowMissionBoard(false)}
  onAccept={(quest) => handleStartQuest(quest)}
  onAiScan={() => handleAiScan()}
  isScanning={isGenerating}
  activeQuestIds={activeQuestIds}
/>
```

---

### 3. **SmartMissionModal**
`src/components/dashboard/SmartMissionModal.jsx`

**Nouveau composant** - Modal de recommandation IA avec reroll

**Props:**
```javascript
{
  isOpen: boolean,                      // État du modal
  onClose: Function,                    // Fermer le modal
  onAccept: Function(quest),            // Accepter la quête
  onReroll: Function() => Quest,        // Regénérer une quête
  initialQuest: Object                  // Quête initiale recommandée
}
```

**Exemple d'utilisation:**
```jsx
const [showSmartMission, setShowSmartMission] = useState(false);
const [recommendedQuest, setRecommendedQuest] = useState(null);

const handleReroll = () => {
  const newQuest = getRandomQuest(availableQuests);
  setRecommendedQuest(newQuest);
  return newQuest;
};

<SmartMissionModal
  isOpen={showSmartMission}
  onClose={() => setShowSmartMission(false)}
  onAccept={(quest) => handleStartQuest(quest)}
  onReroll={handleReroll}
  initialQuest={recommendedQuest}
/>
```

---

### 4. **CategoryGrid**
`src/components/dashboard/CategoryGrid.jsx`

**Nouveau composant** - Grille tactique des catégories de quêtes

**Props:**
```javascript
{
  onSelectCategory: Function(categoryId)  // Callback de sélection
}
```

**Catégories supportées:**
- `budget` (Wallet icon, blue)
- `savings` (PiggyBank icon, emerald)
- `investing` (TrendingUp icon, gold)
- `planning` (Target icon, purple)

**Exemple d'utilisation:**
```jsx
<CategoryGrid
  onSelectCategory={(category) => {
    console.log('Selected:', category);
    navigate(`/quests?category=${category}`);
  }}
/>
```

---

## 🔧 Configuration Tailwind

Les styles suivants ont été ajoutés à `tailwind.config.js`:

### Nouvelles couleurs
```javascript
{
  onyx: '#050505',
  'onyx-light': '#121212',
  acid: '#E5FF00',
  emerald: '#10B981',
  'bg-primary': '#0A0A0A',
  'bg-secondary': '#1A1A1A',
  'chrome-light': '#E5E5E5',
  'chrome-medium': '#A3A3A3',
  blue: '#3B82F6',
}
```

### Nouveaux box-shadows
```javascript
{
  'gold-glow': '0 0 20px rgba(251, 191, 36, 0.2)',
  'acid-glow': '0 0 20px rgba(229, 255, 0, 0.3)',
}
```

### Nouvelles fonts
```javascript
{
  space: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

---

## 📝 Traductions ajoutées

```json
{
  "dashboard": {
    "bento": {
      "badges": "Badges",
      "impactLog": "Impact Log",
      "efficiency": "Efficiency"
    }
  }
}
```

---

## 🚀 Intégration dans Dashboard.jsx

### Étape 1: Imports

```javascript
// Nouveaux composants refonte
import DashboardBentoStatsV2 from '../dashboard/DashboardBentoStatsV2';
import MissionBoardModal from '../dashboard/MissionBoardModal';
import SmartMissionModal from '../dashboard/SmartMissionModal';
import CategoryGrid from '../dashboard/CategoryGrid';
```

### Étape 2: États locaux

```javascript
const [showMissionBoard, setShowMissionBoard] = useState(false);
const [showSmartMission, setShowSmartMission] = useState(false);
const [recommendedQuest, setRecommendedQuest] = useState(null);
```

### Étape 3: Handlers

```javascript
// Ouvrir le mission board
const handleOpenMissions = () => {
  setShowMissionBoard(true);
};

// Accepter une quête
const handleAcceptQuest = async (quest) => {
  try {
    // Votre logique d'acceptation de quête
    await startQuest(quest.id);
    setShowMissionBoard(false);
    toast.success(`Quest "${quest.title}" started!`);
  } catch (error) {
    toast.error('Failed to start quest');
  }
};

// Scan IA (génère une recommandation)
const handleAiScan = () => {
  setIsGenerating(true);
  setTimeout(() => {
    const recommended = getRecommendedQuest(quests, userProgress);
    setRecommendedQuest(recommended);
    setShowMissionBoard(false);
    setShowSmartMission(true);
    setIsGenerating(false);
  }, 1500);
};

// Reroll de quête
const handleReroll = () => {
  const available = quests.filter(q => !activeQuestIds.includes(q.id));
  const random = available[Math.floor(Math.random() * available.length)];
  setRecommendedQuest(random);
  return random;
};

// Sélection de catégorie
const handleSelectCategory = (category) => {
  navigate(`/quests?category=${category}`);
};
```

### Étape 4: Intégration dans le JSX

**Option A: Remplacer DashboardBentoStats**
```jsx
{/* Ancien */}
<DashboardBentoStats
  badges={badges}
  recentImpact={recentImpact}
/>

{/* Nouveau */}
<DashboardBentoStatsV2
  badges={badges}
  recentImpact={recentImpact}
/>
```

**Option B: Ajouter CategoryGrid**
```jsx
{/* Après le Scoreboard */}
<DashboardScoreboard
  impactAnnual={impactAnnualEstimated || 0}
  currency={userData?.currency || '€'}
  onStartQuest={handleStartQuest}
  isLoading={isGenerating}
/>

{/* NOUVEAU: CategoryGrid */}
<div className="mt-6">
  <h3 className="px-6 font-sans font-bold text-white text-lg mb-2">
    {t('quests.categories.all')}
  </h3>
  <CategoryGrid onSelectCategory={handleSelectCategory} />
</div>
```

**Option C: Ajouter les modals (en fin de composant)**
```jsx
{/* Avant le </div> de fermeture */}
<BottomNav />

{/* NOUVEAUX MODALS */}
<MissionBoardModal
  isOpen={showMissionBoard}
  onClose={() => setShowMissionBoard(false)}
  onAccept={handleAcceptQuest}
  onAiScan={handleAiScan}
  isScanning={isGenerating}
  activeQuestIds={activeQuestIds}
/>

<SmartMissionModal
  isOpen={showSmartMission}
  onClose={() => setShowSmartMission(false)}
  onAccept={handleAcceptQuest}
  onReroll={handleReroll}
  initialQuest={recommendedQuest}
/>
```

---

## 🎯 Exemple complet d'intégration

```jsx
// src/components/pages/Dashboard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ... autres imports

// Nouveaux composants refonte
import DashboardBentoStatsV2 from '../dashboard/DashboardBentoStatsV2';
import MissionBoardModal from '../dashboard/MissionBoardModal';
import SmartMissionModal from '../dashboard/SmartMissionModal';
import CategoryGrid from '../dashboard/CategoryGrid';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // ... autres hooks

  // États pour les modals
  const [showMissionBoard, setShowMissionBoard] = useState(false);
  const [showSmartMission, setShowSmartMission] = useState(false);
  const [recommendedQuest, setRecommendedQuest] = useState(null);

  // Handlers
  const handleAcceptQuest = async (quest) => {
    try {
      await startQuest(quest.id);
      setShowMissionBoard(false);
      setShowSmartMission(false);
      toast.success(`Started: ${quest.title}`);
    } catch (error) {
      toast.error('Failed to start quest');
    }
  };

  const handleAiScan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const recommended = quests.find(q => !activeQuestIds.includes(q.id));
      setRecommendedQuest(recommended);
      setShowMissionBoard(false);
      setShowSmartMission(true);
      setIsGenerating(false);
    }, 1500);
  };

  const handleReroll = () => {
    const available = quests.filter(q => !activeQuestIds.includes(q.id));
    const random = available[Math.floor(Math.random() * available.length)];
    setRecommendedQuest(random);
    return random;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AppBackground variant="onyx" />

      {/* Header */}
      <DashboardHeader stats={stats} userAvatar={userAvatar} />

      {/* Scoreboard */}
      <DashboardScoreboard
        impactAnnual={impactAnnualEstimated}
        currency="€"
        onStartQuest={() => setShowMissionBoard(true)}
        isLoading={isGenerating}
      />

      {/* CategoryGrid */}
      <div className="mt-8">
        <h3 className="px-6 font-sans font-bold text-white text-lg mb-2">
          Explore by Category
        </h3>
        <CategoryGrid onSelectCategory={(cat) => navigate(`/quests?category=${cat}`)} />
      </div>

      {/* BentoStats V2 */}
      <DashboardBentoStatsV2
        badges={badges}
        recentImpact={recentImpact}
      />

      {/* Quests View */}
      <DashboardQuestsView
        activeQuests={activeQuests}
        completedQuests={completedQuests}
        onComplete={handleCompleteQuest}
        onStartQuest={() => setShowMissionBoard(true)}
        onNavigate={handleNavigateToQuest}
        isLoading={isGenerating}
      />

      <BottomNav />

      {/* MODALS */}
      <MissionBoardModal
        isOpen={showMissionBoard}
        onClose={() => setShowMissionBoard(false)}
        onAccept={handleAcceptQuest}
        onAiScan={handleAiScan}
        isScanning={isGenerating}
        activeQuestIds={activeQuestIds}
      />

      <SmartMissionModal
        isOpen={showSmartMission}
        onClose={() => setShowSmartMission(false)}
        onAccept={handleAcceptQuest}
        onReroll={handleReroll}
        initialQuest={recommendedQuest}
      />
    </div>
  );
};

export default Dashboard;
```

---

## ✅ Checklist d'intégration

- [ ] Tailwind config mis à jour
- [ ] Traductions ajoutées
- [ ] Imports des nouveaux composants
- [ ] États locaux pour les modals
- [ ] Handlers implémentés
- [ ] BentoStatsV2 intégré
- [ ] CategoryGrid ajouté
- [ ] MissionBoardModal connecté
- [ ] SmartMissionModal connecté
- [ ] Tests fonctionnels

---

## 🔍 Points d'attention

1. **Compatibilité**: Tous les composants sont 100% compatibles avec le backend Firebase existant
2. **Performance**: Les modals sont lazy-rendered (n'existent que quand ouverts)
3. **Responsive**: Tous les composants sont mobil-first et responsive
4. **Accessibilité**: Attributs ARIA ajoutés pour les boutons et modals
5. **Traductions**: Système i18n existant respecté

---

## 📊 Comparaison Avant/Après

| Élément | Avant | Après |
|---------|-------|-------|
| BentoStats | Style chrome clair | Dark mode, receipt style |
| Sélection de quête | Aucune UI dédiée | 2 modals (Board + Smart) |
| Catégories | Simple liste | Grid tactique animée |
| Backend | Firebase | Firebase (inchangé) |

---

## 🎨 Design System

### Palette de couleurs
- **Primary**: `#FBBF24` (Gold)
- **Background**: `#050505` (Onyx)
- **Secondary BG**: `#1A1A1A`
- **Accent**: `#E5FF00` (Acid)
- **Success**: `#10B981` (Emerald)

### Typography
- **Headings**: Inter (font-sans)
- **Code/Stats**: JetBrains Mono (font-mono)
- **Display**: Inter (font-space)

### Spacing
- Consistent avec le système existant (px-6, py-4, etc.)

---

## 🚀 Prochaines étapes

1. Intégrer progressivement les composants
2. Tester sur mobile et desktop
3. Ajuster les animations si nécessaire
4. Collecter les feedbacks utilisateurs
5. Itérer sur le design

---

**Créé le:** 2025-11-22  
**Dernière mise à jour:** 2025-11-22  
**Maintenu par:** AI Assistant

