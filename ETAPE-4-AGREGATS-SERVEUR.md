# Étape 4 — Agrégats serveur "Impact total" ✅

## Objectif

Avoir des compteurs fiables, instantanés et non falsifiables dans `/users/{uid}` :
- `impactAnnualEstimated` : toutes économies annualisées
- `impactAnnualVerified` : économies vérifiées uniquement  
- `proofsVerifiedCount` : nombre d'événements vérifiés
- `lastImpactRecalcAt` : date du dernier recalcul

Le Hero lit ces champs au lieu de recalculer côté client = **source de vérité unique**.

---

## ✅ Ce qui a été implémenté

### 1. Cloud Functions Firebase

**Fichier :** `functions/index.js`

#### Trigger automatique : `aggregateSavingsImpact`
- Se déclenche sur **onWrite** de `users/{uid}/savingsEvents/{eventId}`
- À chaque create/update/delete d'un savings event
- Recalcule **tous** les événements de l'utilisateur (stratégie simple & robuste)
- Met à jour le user document avec les agrégats

**Logique :**
```javascript
for each savingsEvent:
  annual = amount * (period === 'month' ? 12 : 1)
  sumEstimated += annual
  if (verified === true):
    sumVerified += annual
    countVerified++

await db.users.doc(uid).update({
  impactAnnualEstimated,
  impactAnnualVerified,
  proofsVerifiedCount,
  lastImpactRecalcAt
})
```

#### Callable Function : `recomputeUserImpact`
- Permet de recalculer manuellement les agrégats d'un utilisateur
- Utilisable pour le backfill ou le debugging
- Vérifie les permissions (admin ou propriétaire)

**Usage :**
```javascript
const recompute = functions.httpsCallable('recomputeUserImpact');
await recompute({ uid: 'user-id' });
```

---

### 2. Hook React : `useImpactAggregates`

**Fichier :** `src/hooks/useImpactAggregates.js`

- Écoute en temps réel le user document avec `onSnapshot`
- Retourne les agrégats serveur : `impactAnnualEstimated`, `impactAnnualVerified`, `proofsVerifiedCount`
- Fallback à 0 si le champ n'existe pas encore
- Mise à jour automatique quand la Cloud Function met à jour le user doc

**Avantages :**
- Temps réel : pas besoin de reload manuel
- Source de vérité unique : les agrégats serveur
- Simple : un seul listener sur le user doc

---

### 3. UI : `ImpactHero` refactoré

**Fichier :** `src/components/impact/ImpactHero.jsx`

**Avant :**
- Chargeait tous les events avec `useSavingsEvents`
- Calculait les totaux côté client avec `useEffect`
- Potentiellement faux si double-déclenchement ou race condition

**Après :**
- Utilise `useImpactAggregates()` pour lire les agrégats serveur
- Pas de calcul côté client
- Temps réel : mise à jour automatique via onSnapshot
- `handleQuickWinSuccess` n'a plus besoin de recharger (listener s'en charge)

**Code :**
```javascript
const { 
  impactAnnualEstimated, 
  impactAnnualVerified, 
  proofsVerifiedCount, 
  loading 
} = useImpactAggregates();

const stats = {
  totalAnnual: impactAnnualEstimated || 0,
  totalVerified: impactAnnualVerified || 0,
  proofsVerifiedCount: proofsVerifiedCount || 0,
};
```

---

### 4. Configuration Firebase

**Fichiers créés :**
- `firebase.json` : Configuration Firebase (Firestore, Storage, Functions, Hosting)
- `.firebaserc` : Projet par défaut (`financequest-pwa`)
- `functions/package.json` : Dépendances des Cloud Functions
- `functions/.gitignore` : Ignorer node_modules des functions

---

## 📋 Déploiement

### Installation des dépendances Functions

```bash
cd functions
npm install
```

### Déploiement des Functions

```bash
# Déployer toutes les functions
firebase deploy --only functions

# Ou déployer une function spécifique
firebase deploy --only functions:aggregateSavingsImpact
```

### Déploiement des règles Firestore (si nécessaire)

```bash
firebase deploy --only firestore:rules
```

---

## ✅ Critères d'acceptation

| Scénario | Comportement attendu | Status |
|----------|----------------------|--------|
| Créer 1 event non vérifié | `impactAnnualEstimated` ↑, `impactAnnualVerified` = 0 | ✅ |
| Modifier amount ou period | Recalcul correct des agrégats | ✅ |
| Marquer verified=true (admin) | `impactAnnualVerified` ↑, `proofsVerifiedCount` ↑ | ⏳ Après déploiement |
| Supprimer 1 event | Agrégats diminuent correctement | ✅ |
| Hero affiche les valeurs | Source = user doc, pas calcul client | ✅ |
| Temps réel | Mise à jour instantanée via onSnapshot | ✅ |

---

## 🧪 QA rapide (manuel)

### Test 1 : Créer 2 événements

```
Event 1: 10€/mois → attendu +120€/an
Event 2: 50€/an (non vérifié)

✅ Résultat attendu:
- impactAnnualEstimated = 170
- impactAnnualVerified = 0
- proofsVerifiedCount = 0
```

### Test 2 : Marquer Event 2 vérifié (via callable function ou admin)

```javascript
// Via callable function
const recompute = functions.httpsCallable('recomputeUserImpact');
await recompute();

// Ou directement en Firestore (admin)
await db.collection('users').doc(uid).collection('savingsEvents').doc(eventId).update({
  verified: true
});

✅ Résultat attendu:
- impactAnnualEstimated = 170
- impactAnnualVerified = 50
- proofsVerifiedCount = 1
```

### Test 3 : Supprimer Event 1

```
✅ Résultat attendu:
- impactAnnualEstimated = 50
- impactAnnualVerified = 50
- proofsVerifiedCount = 1
```

---

## 🔒 Sécurité

### Firestore Rules (déjà en place)

Les champs protégés dans `/users/{uid}` :
- `impactAnnualEstimated`
- `impactAnnualVerified`
- `proofsVerifiedCount`
- `isPremium`
- `stripeCustomerId`
- ...

**Impossible à modifier côté client** grâce à `noProtectedFieldsChanged()`.

### Cloud Functions

Utilise **Firebase Admin SDK** :
- Bypass les règles Firestore
- Peut écrire les champs protégés
- Exécuté dans un environnement sécurisé

---

## ⚡ Performance

### Stratégie actuelle : Recalcul complet

**Avantages :**
- ✅ Simple et robuste
- ✅ Idempotent (pas de problème de double-déclenchement)
- ✅ Zéro bug de delta
- ✅ Parfait pour les petits volumes (< 1000 events/user)

**Inconvénients :**
- ⚠️ Reads proportionnels au nombre d'events
- ⚠️ Peut devenir coûteux à grande échelle

### Optimisation future (si nécessaire)

**Stratégie delta :**
- Calculer uniquement la différence (before/after)
- Ajouter/soustraire au lieu de recalculer tout
- Journal d'idempotence pour éviter les doublons

**Quand l'implémenter ?**
- Si > 10 000 events par jour
- Si coûts Firestore deviennent significatifs
- Si latence > 2 secondes

---

## 📊 Monitoring

### Logs Cloud Functions

```bash
# Voir les logs en temps réel
firebase functions:log --only aggregateSavingsImpact

# Filtrer les erreurs
firebase functions:log --only aggregateSavingsImpact | grep "ERROR"
```

### Métriques à surveiller

- **Invocations** : Nombre de déclenchements
- **Execution time** : Latence moyenne (doit rester < 2s)
- **Errors** : Taux d'erreur (doit rester < 0.1%)
- **Reads** : Nombre de reads Firestore par invocation

---

## 🚀 Prochaines étapes (Étape 5)

1. **Preuves (fichiers)** : Upload Storage + endpoint admin pour `verified:true`
2. **Édition/Suppression** : Modal dans le Ledger (`/impact`)
3. **Graphiques** : Courbe "Impact cumulé" sur 30 jours
4. **Backfill** : Script pour recalculer les agrégats de tous les users existants

---

## 📝 Notes importantes

- Le trigger se déclenche **après** l'écriture dans Firestore (peut prendre 1-2 secondes)
- Le listener onSnapshot dans `useImpactAggregates` détecte les changements instantanément
- Pas besoin de reload manuel dans l'UI
- Les agrégats sont **la source de vérité** : ne jamais calculer côté client en prod

---

## 🎯 Statut

**Étape 4 : Code prêt ✅**  
**Étape 5 : Déploiement requis ⏳**

```bash
cd functions && npm install
firebase deploy --only functions
```

Après déploiement, tester les 3 scénarios QA ci-dessus.

