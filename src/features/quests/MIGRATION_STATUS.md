# État de Migration - questHelpers vs useLocalizedQuest

## 📊 Status Actuel

### ✅ `questHelpers.js` - Conservé (Legacy Support)

**Statut:** Deprecated pour nouvelles quêtes, MAIS toujours requis

**Utilisations actuelles:**
- `src/services/dailyChallenge.js` → contient sa propre copie de `localizeQuest()`
- `src/features/quests/registry.js` → exporte et utilise `localizeQuest()`

**Quand l'utiliser:**
- ✅ Pour les anciennes quêtes avec format `title_fr`/`title_en`
- ✅ Pour le code legacy qui n'a pas encore été migré
- ⚠️ NE PAS utiliser pour nouvelles quêtes avec `i18nKey`

---

### ✨ `useLocalizedQuest` - Nouveau Standard

**Localisation:** `/src/hooks/useLocalizedQuest.js` ✅ (déplacé)

**Quand l'utiliser:**
- ✅ Pour toutes les nouvelles quêtes avec `i18nKey`
- ✅ Pour la quête `cut-subscription` (déjà migrée)
- ✅ Dans tous les composants React affichant des quêtes

**Exemple:**
```javascript
import useLocalizedQuest from '../../hooks/useLocalizedQuest';
import { cutSubscriptionQuest } from '../features/quests/pilotage/cut-subscription/metadata';

function QuestCard() {
  const quest = useLocalizedQuest(cutSubscriptionQuest);
  return <h1>{quest.title}</h1>; // "Coupe 1 abonnement inutile"
}
```

---

## 🔄 Différence avec `useLocalQuests`

Vous avez deux hooks différents :

| Hook | Rôle | Input | Output |
|------|------|-------|--------|
| **useLocalQuests** | Charge toutes les quêtes de l'utilisateur + progression | (aucun) | Liste des quêtes avec état |
| **useLocalizedQuest** | Localise UNE quête avec i18n | 1 quest object | Quest traduite |

**Ils sont complémentaires !**

```javascript
import useLocalQuests from '../../hooks/useLocalQuests';
import useLocalizedQuest from '../../hooks/useLocalizedQuest';

function QuestList() {
  // 1. Charger toutes les quêtes avec progression
  const { quests, loading } = useLocalQuests();
  
  // 2. Localiser chaque quête individuellement
  return (
    <div>
      {quests.map(quest => {
        const localizedQuest = useLocalizedQuest(quest);
        return <QuestCard key={quest.id} quest={localizedQuest} />;
      })}
    </div>
  );
}
```

---

## 🎯 Plan de Migration

### Phase actuelle : ✅ Infrastructure prête

- [x] `useLocalizedQuest` créé et déplacé vers `/hooks/`
- [x] Quête `cut-subscription` migrée vers format `i18nKey`
- [x] Traductions dans `/locales/{fr,en}/quests.json`
- [x] `questHelpers.js` documenté comme legacy

### Phase 2 : Utiliser dans les composants

- [ ] Identifier tous les composants qui affichent `cutSubscriptionQuest`
- [ ] Remplacer par `useLocalizedQuest(cutSubscriptionQuest)`
- [ ] Tester en FR et EN

### Phase 3 : Migrer autres quêtes (futures)

- [ ] Créer nouvelles quêtes avec format `i18nKey` directement
- [ ] Migrer progressivement les anciennes quêtes si nécessaire
- [ ] Une fois toutes migrées → supprimer `questHelpers.js`

---

## ✅ Résumé

**questHelpers.js :**
- ⚠️ Deprecated mais PAS obsolète
- ✅ Toujours utilisé pour le code legacy
- 🔒 À conserver jusqu'à migration complète

**useLocalizedQuest.js :**
- ✅ Nouveau standard pour quêtes avec `i18nKey`
- 📍 Correctement placé dans `/src/hooks/`
- 🎯 À utiliser pour toutes les nouvelles quêtes
