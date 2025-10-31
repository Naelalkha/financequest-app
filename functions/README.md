# Cloud Functions Firebase - FinanceQuest

## Installation

```bash
cd functions
npm install
```

## Déploiement

### Toutes les functions

```bash
firebase deploy --only functions
```

### Une function spécifique

```bash
firebase deploy --only functions:aggregateSavingsImpact
firebase deploy --only functions:recomputeUserImpact
```

## Functions disponibles

### 1. `aggregateSavingsImpact` (Trigger)

**Type :** Firestore Trigger (onWrite)  
**Path :** `users/{uid}/savingsEvents/{eventId}`

**Description :**  
Se déclenche automatiquement à chaque création, modification ou suppression d'un savings event. Recalcule les agrégats d'impact et met à jour le user document.

**Agrégats calculés :**
- `impactAnnualEstimated` : Total annualisé de toutes les économies
- `impactAnnualVerified` : Total annualisé des économies vérifiées
- `proofsVerifiedCount` : Nombre d'événements vérifiés
- `lastImpactRecalcAt` : Timestamp du dernier recalcul

### 2. `recomputeUserImpact` (Callable)

**Type :** HTTPS Callable Function  
**Auth :** Requise

**Description :**  
Permet de recalculer manuellement les agrégats d'un utilisateur. Utile pour le backfill ou le debugging.

**Usage côté client :**

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const recompute = httpsCallable(functions, 'recomputeUserImpact');

// Recalculer pour l'utilisateur connecté
const result = await recompute();
console.log(result.data); // { success: true, estimated: 170, verified: 50, ... }

// Admin: recalculer pour un autre utilisateur
const result = await recompute({ uid: 'other-user-id' });
```

## Testing local

### Émulateurs Firebase

```bash
firebase emulators:start --only functions,firestore
```

### Shell interactif

```bash
firebase functions:shell
```

## Logs

### Voir les logs en temps réel

```bash
firebase functions:log --only aggregateSavingsImpact
```

### Filtrer les erreurs

```bash
firebase functions:log | grep ERROR
```

## Configuration requise

- Node.js 18+
- Firebase CLI : `npm install -g firebase-tools`
- Authentification : `firebase login`

## Environnement

Les functions utilisent automatiquement le projet configuré dans `.firebaserc`.

Pour changer de projet :

```bash
firebase use <project-id>
```

## Monitoring

Firebase Console > Functions > Dashboard :
- Invocations
- Execution time
- Memory usage
- Errors

## Troubleshooting

### Erreur "Missing permissions"

Vérifier que le compte de service Firebase a les bonnes permissions IAM.

### Trigger ne se déclenche pas

1. Vérifier les logs : `firebase functions:log`
2. Vérifier le path Firestore exact
3. Déployer à nouveau

### Timeout

Augmenter le timeout dans `index.js` :

```javascript
exports.aggregateSavingsImpact = functions
  .runWith({ timeoutSeconds: 120 })
  .firestore.document('users/{uid}/savingsEvents/{eventId}')
  .onWrite(...);
```

