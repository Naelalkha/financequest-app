# ⚡ Activer le thème VOLT - Guide rapide

**Pour passer immédiatement au nouveau design Volt**

---

## 🚀 3 étapes pour activer

### Étape 1: Ouvrir Dashboard.jsx

```bash
src/components/pages/Dashboard.jsx
```

### Étape 2: Remplacer les imports (lignes 18-20)

**AVANT:**
```javascript
import DashboardHeader from '../dashboard/DashboardHeader';
import DashboardScoreboard from '../dashboard/DashboardScoreboard';
import DashboardBentoStats from '../dashboard/DashboardBentoStats';
```

**APRÈS:**
```javascript
import DashboardHeader from '../dashboard/DashboardHeader';  // ✅ Déjà Volt
import DashboardScoreboardV2 from '../dashboard/DashboardScoreboardV2';  // ⚡ Nouveau
import DashboardBentoStatsV2 from '../dashboard/DashboardBentoStatsV2';  // ⚡ Nouveau
```

### Étape 3: Remplacer dans le JSX (lignes ~295-315)

**AVANT:**
```jsx
<DashboardScoreboard
  impactAnnual={(impactAnnualEstimated || 0) + localImpactBoost}
  currency={userData?.currency || '€'}
  onStartQuest={handleStartQuest}
  isLoading={isGenerating}
/>

{/* ... */}

<DashboardBentoStats
  badges={badges}
  recentImpact={recentImpact}
/>
```

**APRÈS:**
```jsx
<DashboardScoreboardV2
  impactAnnual={(impactAnnualEstimated || 0) + localImpactBoost}
  currency={userData?.currency || '€'}
  onStartQuest={handleStartQuest}
  isLoading={isGenerating}
/>

{/* ... */}

<DashboardBentoStatsV2
  badges={badges}
  recentImpact={recentImpact}
/>
```

---

## ✨ C'est tout !

Sauvegarde le fichier et le nouveau design Volt s'active immédiatement !

---

## 🎨 Changements visuels

Tu verras instantanément:
- ⚡ **Couleur Volt** (#E2FF00) partout au lieu de Gold
- 🔢 **RollingCounter** qui anime les chiffres
- 🏅 **Badges Chrome/Silver** avec effet grayscale
- ✨ **Brand icon rond** avec effet volt glow
- 🌈 **Level ring** avec gradient white→volt
- 💫 **Impact values** en volt au lieu de emerald

---

## 🔍 Vérification rapide

Après activation, vérifie:
1. Dashboard se charge ✅
2. Scoreboard affiche en Volt ✅
3. Chiffres roulent quand ils changent ✅
4. Badges sont argentés/chrome ✅
5. Brand icon est Volt rond ✅

---

## 🔙 Rollback (si besoin)

Pour revenir à l'ancien design:

**Étape 1:** Re-importer les anciens composants
```javascript
import DashboardScoreboard from '../dashboard/DashboardScoreboard';
import DashboardBentoStats from '../dashboard/DashboardBentoStats';
```

**Étape 2:** Replacer dans le JSX
```jsx
<DashboardScoreboard ... />
<DashboardBentoStats ... />
```

Les anciens composants sont toujours là, pas supprimés !

---

## 📚 Documentation

Si tu veux en savoir plus:
- **Guide complet:** `VOLT-THEME-MIGRATION.md`
- **Résumé:** `REFONTE-COMPLETE-SUMMARY.md`

---

**Enjoy the Volt! ⚡**

