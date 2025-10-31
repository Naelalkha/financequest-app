# Étape 3 — Impact estimé + Gating Premium

## 📦 Objectif

Ajouter le support UI pour l'affichage de l'impact estimé (quand disponible) + gating Premium unifié **sans modifier les quêtes existantes**.

---

## ✅ TERMINÉ (Commit 1)

### 1. Helpers d'impact (`src/utils/impact.js`) ✅

**Fonctions créées :**
```javascript
annualizeImpact({ amount, period })      // mois×12, an×1 → number|null
formatEUR(locale, value)                 // → "+€XXX/an" | null
getQuestLockState(user, quest)          // → { locked, reason }
getQuestAnnualImpact(quest)             // → number | null
getQuestFormattedImpact(quest, locale)  // → "+€XXX/an" | null
```

**Caractéristiques :**
- ✅ Retourne `null` si pas d'`estimatedImpact` (rétro-compatible)
- ✅ Validation `Number.isFinite()` et bornes
- ✅ Support feature flag `VITE_PREMIUM_GATING=off` pour dev
- ✅ Format Intl selon locale (fr-FR / en-US)
- ✅ Arrondi à 0 décimale

---

### 2. Navigation Guards (`src/utils/navguards.js`) ✅

**Fonction principale :**
```javascript
openQuestGuarded({
  quest,          // Quête à ouvrir
  user,           // Utilisateur actuel
  navigate,       // React Router navigate()
  source,         // 'quest_card' | 'daily_challenge' | 'continue_card' | 'search' | 'deeplink'
  options         // { bypassGating, trialDays }
})
```

**Logique :**
1. Calcule `locked = quest.isPremium && !user?.isPremium`
2. Si `locked` :
   - Track `premium_gate_shown`
   - Track `premium_redirect`
   - Redirect `/premium?from={source}&questId={id}&trial=7`
3. Sinon :
   - Track `quest_card_clicked`
   - Navigate `/quests/{id}`

**Helpers bonus :**
- `isStarterPackQuest(quest)` : Check si starter pack (toujours gratuit)
- `canAccessQuest(user, quest)` : Helper pour composants sans navigation
- `openStarterPackQuest(params)` : Wrapper avec `bypassGating: true`

---

### 3. i18n (FR/EN) ✅

**Nouvelles clés ajoutées :**

```json
// EN
{
  "quest": {
    "meta": "{{minutes}} min · Est. savings: {{amount}}/year",
    "meta_no_impact": "{{minutes}} min",
    "start": "Start",
    "unlock_premium": "Unlock with Premium",
    "premium_badge": "Premium"
  },
  "upsell": {
    "locked_title": "Premium Content",
    "locked_desc": "This quest is part of Moniyo Premium.",
    "cta": "Start 7-day free trial",
    "note": "Cancel anytime"
  }
}

// FR
{
  "quest": {
    "meta": "{{minutes}} min · Économies estimées : {{amount}}/an",
    "meta_no_impact": "{{minutes}} min",
    "start": "Commencer",
    "unlock_premium": "Débloquer avec Premium",
    "premium_badge": "Premium"
  },
  "upsell": {
    "locked_title": "Contenu Premium",
    "locked_desc": "Cette quête fait partie de Moniyo Premium.",
    "cta": "Essai gratuit 7 jours",
    "note": "Annulable à tout moment"
  }
}
```

---

## 🚧 EN COURS (Commit 2)

### 4. Intégration QuestCard

**À faire :**
1. ✅ Importer helpers (`getQuestFormattedImpact`, `getQuestLockState`)
2. ✅ Importer `openQuestGuarded` et `useNavigate`
3. ⏳ Calculer `formattedImpact` depuis `quest.estimatedImpact`
4. ⏳ Afficher meta enrichie :
   - Si impact dispo : `t('quest.meta', { minutes, amount: formattedImpact })`
   - Sinon : `t('quest.meta_no_impact', { minutes })`
5. ⏳ CTA conditionnel :
   - Si locked : `t('quest.unlock_premium')` avec icône `FaCrown`
   - Sinon : `t('quest.start')` ou `t('quest.continue_quest')` si en cours
6. ⏳ Remplacer `onClick` par :
   ```javascript
   onClick={() => openQuestGuarded({
     quest,
     user,
     navigate,
     source: 'quest_card'
   })}
   ```

**Badge Premium actuel :**
- ✅ Déjà présent : "PRO" avec `<FaCrown />` (ligne 204-211)
- ✅ Condition : `quest.isPremium && !isPremiumUser`
- → **Garder tel quel** (cohérence design)

---

### 5. Intégration Dashboard

**À faire pour "Continue Quest" :**
1. ⏳ Importer `openQuestGuarded`
2. ⏳ Remplacer `handleContinueQuestClick(questId)` par :
   ```javascript
   onClick={() => openQuestGuarded({
     quest,
     user,
     navigate,
     source: 'continue_card'
   })}
   ```

**À faire pour "Daily Challenge" :**
1. ⏳ Importer `getQuestFormattedImpact` pour afficher impact si dispo
2. ⏳ Ajouter ligne meta avec impact estimé (si disponible)
3. ⏳ Remplacer `handleDailyChallengeClick()` par :
   ```javascript
   onClick={() => openQuestGuarded({
     quest: dailyChallengeQuest,  // Récupérer la quête complète depuis quests
     user,
     navigate,
     source: 'daily_challenge'
   })}
   ```

---

### 6. Analytics

**Événements déjà implémentés dans `openQuestGuarded` :**
- ✅ `quest_card_clicked` : Au clic (tous les cas)
- ✅ `premium_gate_shown` : Quand gate affiché
- ✅ `premium_redirect` : Avant redirect `/premium`

**Événements manquants :**
- ⏳ `quest_card_viewed` : Au render de QuestCard (throttled)
  - À ajouter dans `QuestCard` avec `useEffect` + `useRef` (track 1x)
  - Payload : `{ quest_id, is_premium, has_access, category, difficulty }`

**Enrichissement automatique :**
- ✅ `session_id` : Déjà ajouté par `logAnalyticsEvent` (Étape 2)
- ✅ `event_timestamp` : Déjà ajouté

---

## 🧪 Tests QA (à faire)

### Test 1 : Affichage impact estimé
1. Quête **sans** `estimatedImpact` → Meta affiche uniquement "{{minutes}} min"
2. Quête **avec** `estimatedImpact: { amount: 50, period: 'month' }`
   - → Meta affiche "{{minutes}} min · Économies estimées : +€600/an"
   - → Montant annualisé correct (50 × 12)
   - → Format selon locale (FR : "+€600/an", EN : "+€600/year")

### Test 2 : Gating Premium
1. **Utilisateur non-premium** :
   - Badge "PRO" visible sur carte Premium
   - CTA "Débloquer avec Premium" au lieu de "Commencer"
   - Clic → Redirect `/premium?from=quest_card&questId={id}&trial=7`
   - Analytics : `quest_card_clicked`, `premium_gate_shown`, `premium_redirect`
2. **Utilisateur premium** :
   - Badge "PRO" toujours visible (mais accès direct)
   - CTA "Commencer" normal
   - Clic → Navigate `/quests/{id}`
   - Analytics : `quest_card_clicked` seulement

### Test 3 : Sources multiples
1. Clic depuis **Quest Card** → `source: 'quest_card'`
2. Clic depuis **Daily Challenge** → `source: 'daily_challenge'`
3. Clic depuis **Continue Quest** → `source: 'continue_card'`
4. Vérifier que `source` est bien présent dans les analytics

### Test 4 : Starter Pack
1. Quête avec `isStarterPack: true` ou ID dans `starterPackIds`
2. Toujours accessible même si `isPremium: true`
3. `bypassGating: true` → pas de redirect

### Test 5 : Feature Flag
1. `.env` avec `VITE_PREMIUM_GATING=off`
2. Toutes les quêtes Premium accessibles
3. Aucun redirect vers `/premium`

### Test 6 : Accessibilité
1. Focus visible sur CTAs
2. `aria-label` descriptif sur boutons
3. Ordre tab cohérent
4. Désactivation temporaire pendant navigation

### Test 7 : Régression
1. Dashboard se charge sans erreurs
2. Quick Win toujours fonctionnel
3. Impact Hero toujours affiché
4. Aucune erreur React Hooks

---

## 📊 Fichiers modifiés

### ✅ Commit 1 (Terminé)
- ✅ `src/utils/impact.js` (nouveau, 141 lignes)
- ✅ `src/utils/navguards.js` (nouveau, 166 lignes)
- ✅ `src/data/lang.json` (+30 clés, FR/EN)

### ⏳ Commit 2 (En cours)
- ⏳ `src/components/quest/QuestCard.jsx`
- ⏳ `src/components/pages/Dashboard.jsx`

---

## 📈 Architecture & Décisions

### Pourquoi cette approche ?

1. **Rétro-compatible** :
   - Helpers retournent `null` si pas d'impact
   - Quêtes existantes continuent de fonctionner sans changement

2. **Centralisé** :
   - Gating géré dans `openQuestGuarded` (une seule source de vérité)
   - Facile à débugger et maintenir

3. **Extensible** :
   - Support de nouvelles sources de navigation (ex : `search`, `deeplink`)
   - Feature flag pour désactiver le gating

4. **Analytics first** :
   - Tracking intégré dans la navigation guard
   - `session_id` automatique (Étape 2)
   - Facile de corréler les événements

5. **i18n complete** :
   - Toutes les chaînes traduites (FR/EN)
   - Meta dynamique avec interpolation

---

## 🎯 Critères d'acceptation

- [ ] Quête sans `estimatedImpact` → aucune estimation affichée
- [ ] Quête avec `estimatedImpact` → meta correcte "{{minutes}} min · +€XXX/an"
- [ ] Montant annualisé correct (mois×12, an×1)
- [ ] Format EUR selon locale (FR/EN)
- [ ] Badge "PRO" affiché pour quêtes Premium (non-premium user)
- [ ] CTA "Débloquer avec Premium" si locked
- [ ] CTA "Commencer" si accessible
- [ ] Redirect `/premium?...` si locked + clic
- [ ] Navigate `/quests/{id}` si accessible + clic
- [ ] Analytics : `quest_card_clicked`, `premium_gate_shown`, `premium_redirect`
- [ ] Analytics : `quest_card_viewed` (throttled, 1x par carte)
- [ ] Sources correctes (`quest_card`, `daily_challenge`, `continue_card`)
- [ ] Starter pack toujours accessible
- [ ] Feature flag `VITE_PREMIUM_GATING=off` fonctionne
- [ ] Aucune erreur linter
- [ ] Aucune erreur React Hooks
- [ ] Aucune régression (Dashboard, Quick Win, Impact Hero)

---

## 🚀 Prochaines étapes

1. ✅ Commit helpers + i18n + navguards
2. ⏳ Intégrer dans QuestCard (affichage impact + CTA + onClick)
3. ⏳ Intégrer dans Dashboard (Continue + Daily Challenge)
4. ⏳ Ajouter `quest_card_viewed` analytics
5. ⏳ Tests QA complets
6. ⏳ Commit final

---

**Étape 3 — 50% terminée** 🎯
**Core implémenté ✅ | UI intégration en cours ⏳**

