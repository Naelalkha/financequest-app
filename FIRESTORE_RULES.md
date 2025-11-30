# 🔐 Firestore Security Rules

## Fichier principal

**`firestore.rules`** - Règles de sécurité Firestore optimisées pour FinanceQuest

## Déploiement

### Option 1 : Via Firebase Console
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet FinanceQuest
3. **Firestore Database** → **Rules**
4. Copier/coller le contenu de `firestore.rules`
5. Cliquer sur **Publish**

### Option 2 : Via Firebase CLI
```bash
# Installer Firebase CLI si nécessaire
npm install -g firebase-tools

# Se connecter
firebase login

# Déployer uniquement les règles Firestore
firebase deploy --only firestore:rules
```

## 🎯 Permissions configurées

### ✅ Users (`/users/{userId}`)
- ✅ **Create** : Utilisateur peut créer son propre profil (sans champs protégés)
- ✅ **Read** : Utilisateur peut lire son propre profil
- ✅ **Update** : Utilisateur peut mettre à jour son profil (XP, level autorisés via increment)
- ✅ **Delete** : Utilisateur peut supprimer son compte

**Champs protégés** (non modifiables côté client) :
- `isPremium`, `premiumStatus`, `stripeCustomerId`, etc.
- `totalXP`, `level`, `longestStreak` (sauf via increment)
- `impactAnnualEstimated`, `impactAnnualVerified`

### ✅ User Quests (`/userQuests/{questDocId}`)
- ✅ **Create** : Utilisateur peut démarrer une quête pour lui-même
- ✅ **Read** : Utilisateur peut lire ses propres quêtes
- ✅ **Update** : Utilisateur peut mettre à jour sa progression
- ✅ **Delete** : Utilisateur peut supprimer sa progression

**Format du doc ID** : `{userId}_{questId}`

### ✅ Savings Events (`/users/{userId}/savingsEvents/{eventId}`)
- ✅ **Create** : Utilisateur peut ajouter des économies
- ✅ **Read** : Utilisateur peut lire ses économies
- ✅ **Update** : Utilisateur peut modifier (sauf `verified`, `source`, `questId`)
- ✅ **Delete** : Utilisateur peut supprimer

### ✅ Daily Challenges (`/dailyChallenges/{challengeId}`)
- ✅ **Create** : Utilisateur peut créer son défi quotidien
- ✅ **Read** : Utilisateur peut lire ses défis
- ✅ **Update** : Utilisateur peut mettre à jour le statut
- ✅ **Delete** : Utilisateur peut supprimer

### 📖 Quests (Lecture seule)
- ✅ **Read** : Tous les utilisateurs peuvent lire le contenu des quêtes
- ❌ **Write** : Interdit (géré côté admin/backend)

## 🧪 Test des règles

```bash
# Tester les règles localement
firebase emulators:start --only firestore
```

## 📝 Notes importantes

1. **Increment autorisé** : Les règles permettent l'utilisation de `increment()` pour l'XP
2. **Document inexistant** : Les règles permettent la création même si le document n'existe pas encore (`resource == null`)
3. **Validation métier** : Faite côté client/service, pas dans les règles
4. **Champs requis** : Vérifiés via `hasAll()` à la création

## 🔄 Autres fichiers

- `firestore-rules-optimized.rules` - Version de référence (ne pas modifier)
- ~~`firestore-rules-test-simple.rules`~~ - Supprimé (consolidation)

---

**Dernière mise à jour** : 2025-11-23
**Version** : Production-ready
