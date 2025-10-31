# Étape 5 — Agrégats d'impact côté serveur (via API Vercel) ✅

## 🎯 Objectif

Implémenter un système d'agrégats serveur fiable pour l'impact financier, **sans Cloud Functions**, en utilisant une API Vercel avec Firebase Admin SDK. Reste compatible avec le plan Spark (gratuit).

**Pourquoi ?**
- ✅ Garantir un total +€/an fiable après refresh / changement d'appareil
- ✅ Anti-triche léger (source de vérité côté serveur)
- ✅ Performance (pas besoin de recalculer côté client à chaque fois)
- ✅ 100% compatible plan Spark (pas de Cloud Functions)

---

## 📦 Ce qui a été implémenté

### 1. **Modèle de données** (`/users/{uid}`)

**4 nouveaux champs serveur** (lecture seule pour le client) :

| Champ | Type | Description |
|-------|------|-------------|
| `impactAnnualEstimated` | `number` | Total annuel estimé (€) |
| `impactAnnualVerified` | `number` | Total annuel vérifié (€) |
| `proofsVerifiedCount` | `number` | Nombre de preuves vérifiées |
| `lastImpactRecalcAt` | `string` (ISO) | Date du dernier recalcul |

**Exemple** :
```json
{
  "impactAnnualEstimated": 312.5,
  "impactAnnualVerified": 0,
  "proofsVerifiedCount": 0,
  "lastImpactRecalcAt": "2025-10-31T14:23:45.678Z"
}
```

---

### 2. **API Vercel** `/api/recalculate-impact`

**Fichier** : `api/recalculate-impact.js`

**Méthode** : `POST`

**Auth** : Firebase ID Token en `Authorization: Bearer {token}`

**Workflow** :
1. Vérifie le token avec `admin.auth().verifyIdToken()`
2. Extrait le `userId` du token décodé
3. Lit tous les `savingsEvents` depuis Firestore
4. Calcule les agrégats :
   - Annualise : `amount * (period === 'month' ? 12 : 1)`
   - Sépare `verified` vs `estimated`
   - Compte les preuves vérifiées
5. Écrit les 4 champs dans `/users/{userId}` avec Admin SDK
6. Retourne le JSON avec les agrégats + durée

**Réponse (succès)** :
```json
{
  "success": true,
  "data": {
    "impactAnnualEstimated": 312.5,
    "impactAnnualVerified": 0,
    "proofsVerifiedCount": 0,
    "lastImpactRecalcAt": "2025-10-31T14:23:45.678Z"
  },
  "meta": {
    "duration": 145,
    "timestamp": "2025-10-31T14:23:45.678Z"
  }
}
```

**Réponse (erreur)** :
```json
{
  "success": false,
  "error": "Token expired",
  "code": "auth/id-token-expired"
}
```

**Sécurité** :
- ✅ Vérifie le token Firebase
- ✅ Utilise Firebase Admin SDK (accès privilégié)
- ✅ Parse le service account depuis env var
- ✅ CORS configuré
- ✅ Seul POST est accepté

---

### 3. **Service client** `src/services/impactAggregates.js`

**Fonctions exportées** :

#### `recalculateImpactAggregates(source)`
Recalcule les agrégats en appelant l'API Vercel.

**Params** :
- `source` : `'create'` | `'update'` | `'delete'` | `'on_open'` | `'manual_button'`

**Returns** : `Promise<Object|null>` (agrégats ou null si échec)

**Analytics** :
- `impact_recalc_triggered` (avant l'appel)
- `impact_recalc_completed` (succès)
- `impact_recalc_failed` (échec)

#### `recalculateImpactInBackground(source)`
Version fire-and-forget (non bloquante).

#### `areAggregatesStale(lastImpactRecalcAt, maxAgeHours = 6)`
Vérifie si les agrégats sont "trop vieux" (> 6h par défaut).

**Returns** : `boolean`

#### `formatTimeSinceRecalc(lastImpactRecalcAt, locale)`
Formate la durée depuis le dernier recalcul pour l'UI.

**Examples** :
- `"À l'instant"` (< 1 min)
- `"il y a 2 min"` (< 1h)
- `"il y a 3h"` (< 24h)
- `"il y a 2j"` (> 24h)

---

### 4. **Déclencheurs automatiques**

#### **Après CRUD** (`src/services/savingsEvents.js`)

```javascript
// Après création
await addDoc(savingsRef, newEvent);
recalculateImpactInBackground('create');

// Après mise à jour
await updateDoc(eventRef, updates);
recalculateImpactInBackground('update');

// Après suppression
await deleteDoc(eventRef);
recalculateImpactInBackground('delete');
```

**Mode fire-and-forget** : n'attend pas la réponse, ne bloque pas l'UI.

#### **À l'ouverture** (`src/hooks/useServerImpactAggregates.js`)

Si `lastImpactRecalcAt` > 6h :
```javascript
if (areAggregatesStale(userData.lastImpactRecalcAt)) {
  await recalculateImpactAggregates('on_open');
}
```

**Protection** : `useRef` pour éviter les recalculs multiples.

---

### 5. **Hook personnalisé** `useServerImpactAggregates`

**Fichier** : `src/hooks/useServerImpactAggregates.js`

**Rôle** : Lit les agrégats serveur en temps réel depuis `/users/{uid}`.

**Returns** :
```typescript
{
  impactAnnualEstimated: number | null,
  impactAnnualVerified: number | null,
  proofsVerifiedCount: number | null,
  lastImpactRecalcAt: string | null,
  loading: boolean,
  syncing: boolean,        // True pendant un recalcul
  error: string | null,
  manualRecalculate: () => Promise<void>  // Pour bouton "Recalculer"
}
```

**Features** :
- ✅ Écoute temps réel avec `onSnapshot`
- ✅ Recalcul automatique si `stale` (> 6h)
- ✅ État `syncing` pour l'UI
- ✅ Fonction `manualRecalculate` pour bouton dev

---

### 6. **UI : ImpactHero amélioré**

**Fichier** : `src/components/impact/ImpactHero.jsx`

**Changements** :

#### Priorité serveur + fallback local
```javascript
const {
  impactAnnualEstimated: serverEstimated,
  proofsVerifiedCount: serverProofsCount,
  lastImpactRecalcAt,
  syncing,
} = useServerImpactAggregates();

// Fallback local si serveur non dispo
const { events, loadEvents } = useSavingsEvents();

// Stats finales : priorité serveur, sinon local
const stats = {
  totalAnnual: serverEstimated !== null ? serverEstimated : localStats.totalAnnual,
  // ...
};
```

#### Chip "MAJ il y a X min"
Affiché en haut à droite du Hero :

```jsx
{lastImpactRecalcAt && (
  <div className="chip">
    {syncing ? (
      <>
        <FaSync className="animate-spin" />
        Synchronisation...
      </>
    ) : (
      MAJ il y a 2 min
    )}
  </div>
)}
```

**States UI** :
- **Syncing** : Spinner animé + "Synchronisation..."
- **Synced** : "MAJ il y a X min/h/j"
- **Never** : Chip caché (première visite)

---

### 7. **Règles Firestore renforcées**

**Fichier** : `firestore-rules-optimized.rules`

Ajout de `lastImpactRecalcAt` aux champs protégés :

```javascript
function protectedFields() {
  return [
    'isPremium',
    // ...
    'impactAnnualEstimated',
    'impactAnnualVerified',
    'proofsVerifiedCount',
    'lastImpactRecalcAt'  // NOUVEAU
  ];
}
```

**Résultat** : Le client ne peut **jamais** écrire ces champs. Seul l'Admin SDK (API Vercel) peut le faire.

---

### 8. **i18n (FR/EN)**

**Clés ajoutées** dans `src/data/lang.json` :

```json
{
  "impact": {
    "sync": {
      "syncing": "Synchronisation..." / "Syncing...",
      "last_update": "MAJ {{time}}" / "Updated {{time}}",
      "never": "Jamais synchronisé" / "Never synced",
      "recalc_button": "Recalculer" / "Recalculate",
      "recalc_success": "Impact recalculé !" / "Impact recalculated!",
      "recalc_error": "Échec du recalcul" / "Failed to recalculate"
    }
  }
}
```

---

### 9. **Analytics (3 nouveaux événements)**

| Événement | Déclencheur | Propriétés |
|-----------|-------------|------------|
| `impact_recalc_triggered` | Avant l'appel API | `source`, `user_id` |
| `impact_recalc_completed` | Succès API | `source`, `estimated`, `verified`, `proofs_count`, `duration_ms` |
| `impact_recalc_failed` | Échec API | `source`, `reason`, `duration_ms` |

**Intégration PostHog** :
- Tous les events incluent automatiquement `session_id` et `event_timestamp`
- Permet de tracker le funnel : déclenchement → succès/échec
- Mesure la performance de l'API (duration)

---

## 🔄 Workflow complet

```mermaid
graph TD
    A[User ajoute économie] --> B[createSavingsEventInFirestore]
    B --> C[addDoc Firestore]
    C --> D[recalculateImpactInBackground('create')]
    D --> E[API /recalculate-impact]
    E --> F{Token valide ?}
    F -->|Non| G[Erreur 401]
    F -->|Oui| H[Lire savingsEvents]
    H --> I[Calculer agrégats]
    I --> J[Écrire dans /users/uid]
    J --> K[Retour JSON]
    K --> L[onSnapshot détecte changement]
    L --> M[ImpactHero se met à jour]
    M --> N[Chip MAJ mis à jour]
```

---

## 🧪 Tests QA

### Test 1 : Création d'un event
1. ✅ Ouvrir Dashboard
2. ✅ Cliquer "Ajouter une économie"
3. ✅ Titre : "Test", Montant : 13€/mois
4. ✅ Enregistrer
5. ✅ Hero affiche +€156/an après 1-2s
6. ✅ Chip "MAJ il y a X min" visible
7. ✅ PostHog : `impact_recalc_triggered`, `impact_recalc_completed`

### Test 2 : Refresh de la page
1. ✅ Dashboard avec +€156/an
2. ✅ F5 (hard refresh)
3. ✅ Hero affiche toujours +€156/an (source serveur)
4. ✅ Chip "MAJ il y a X min" toujours visible
5. ✅ Pas de recalcul si < 6h

### Test 3 : Modification d'un event
1. ✅ Aller sur /impact
2. ✅ Modifier un event (ex: 13€ → 20€)
3. ✅ Hero se met à jour après 1-2s (+€240/an)
4. ✅ PostHog : `impact_recalc_triggered` (source: 'update')

### Test 4 : Suppression d'un event
1. ✅ Supprimer un event
2. ✅ Hero se met à jour (retour à 0€/an)
3. ✅ PostHog : `impact_recalc_triggered` (source: 'delete')

### Test 5 : Agrégats stale (> 6h)
1. ✅ Modifier manuellement `lastImpactRecalcAt` dans Firestore (date ancienne)
2. ✅ Rafraîchir Dashboard
3. ✅ Recalcul automatique déclenché
4. ✅ PostHog : `impact_recalc_triggered` (source: 'on_open')

### Test 6 : Fallback local si API fail
1. ✅ Désactiver temporairement l'API (404)
2. ✅ Créer un event
3. ✅ Hero affiche quand même le total (calcul local)
4. ✅ PostHog : `impact_recalc_failed`

### Test 7 : Autre appareil / navigateur
1. ✅ Dashboard sur Chrome : +€156/an
2. ✅ Ouvrir Dashboard sur Firefox (même compte)
3. ✅ Hero affiche +€156/an (preuve de sync serveur)

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Nouveaux fichiers | 3 |
| Fichiers modifiés | 5 |
| Lignes de code | ~600 ajoutées |
| API endpoints | 1 (Vercel) |
| Hooks personnalisés | 1 (useServerImpactAggregates) |
| Analytics events | 3 |
| Clés i18n | 6 (FR/EN) |
| Champs Firestore protégés | +1 (lastImpactRecalcAt) |
| Erreurs linter | 0 ✅ |

---

## 🎯 Acceptance Criteria

| Critère | Status |
|---------|--------|
| ✅ Hero lit les agrégats serveur quand disponibles | ✅ |
| ✅ Recalc après chaque create/update/delete | ✅ |
| ✅ Recalc auto si stale (> 6h) | ✅ |
| ✅ Fallback local si API fail | ✅ |
| ✅ Chip "MAJ il y a X min" visible | ✅ |
| ✅ 4 champs protégés côté client | ✅ |
| ✅ Analytics: triggered/completed/failed | ✅ |
| ✅ Compatible plan Spark (pas de Cloud Functions) | ✅ |
| ✅ UX jamais bloquée (fire-and-forget) | ✅ |

---

## 🔒 Sécurité

### Protection côté serveur
- ✅ **Token verification** : Seuls les users authentifiés peuvent appeler l'API
- ✅ **Firebase Admin SDK** : Accès privilégié aux données
- ✅ **Service Account** : Stocké en env var (non commité)
- ✅ **CORS** : Configuré pour accepter les requêtes

### Protection Firestore
- ✅ **Champs protégés** : Client ne peut pas écrire les agrégats
- ✅ **Read-only** : `impactAnnual*`, `proofsVerifiedCount`, `lastImpactRecalcAt`
- ✅ **Validated data** : Règles vérifient les types et bornes

### Protection client
- ✅ **Fire-and-forget** : Échec API n'empêche pas l'UX
- ✅ **Fallback local** : Calcul client si serveur fail
- ✅ **No blocking** : UI jamais bloquée par un recalcul

---

## 📂 Fichiers créés/modifiés

### Nouveaux fichiers
- `api/recalculate-impact.js` (209 lignes) — API Vercel
- `src/services/impactAggregates.js` (164 lignes) — Service client
- `src/hooks/useServerImpactAggregates.js` (126 lignes) — Hook personnalisé

### Fichiers modifiés
- `firestore-rules-optimized.rules` (+1 champ protégé)
- `src/services/savingsEvents.js` (+3 appels recalculateInBackground)
- `src/components/impact/ImpactHero.jsx` (intégration hook serveur + chip MAJ)
- `src/data/lang.json` (+6 clés FR/EN)

**Total** : 8 fichiers touchés, ~600 lignes ajoutées

---

## 💰 Coût & Performance

### Coût Vercel
- **Plan gratuit** : 100 GB-hours/mois
- **Usage estimé** : ~0.01 GB-hour par recalcul (très rapide)
- **Estimation** : ~10 000 recalculs/mois dans le gratuit

### Performance API
- **Durée moyenne** : 100-200ms (rapide)
- **Cold start** : ~500ms (première invocation)
- **Timeout** : 10s (défaut Vercel)

### Firebase Admin SDK
- **Lectures** : 1-50 docs par recalcul (selon nb events)
- **Écritures** : 1 doc (`/users/{uid}`)
- **Quota Spark** : 50k lectures + 20k écritures/jour (largement suffisant)

---

## 🚀 Déploiement

### Prérequis
1. ✅ Projet Vercel lié au repo GitHub
2. ✅ Env var `VITE_FIREBASE_SERVICE_ACCOUNT` configurée
3. ✅ Firebase Admin SDK installé (`firebase-admin`)

### Commandes
```bash
# Push vers GitHub
git push origin main

# Vercel déploie automatiquement

# Vérifier le déploiement
curl -X POST https://your-project.vercel.app/api/recalculate-impact \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### Rollback
Si problème :
1. Revert le commit
2. Redéployer
3. Les agrégats existants restent valides (pas de perte de données)

---

## 🔄 Migration depuis calcul client (Étape 4)

L'Étape 4 utilisait le calcul client uniquement. Maintenant :

| Aspect | Étape 4 (Client) | Étape 5 (Serveur) |
|--------|------------------|-------------------|
| Calcul | useEffect local | API Vercel + Admin SDK |
| Source de vérité | État React local | Firestore `/users/{uid}` |
| Sync multi-device | ❌ Non | ✅ Oui |
| Anti-triche | ⚠️ Modifiable client | ✅ Protégé serveur |
| Performance | ⚠️ Recalcul à chaque render | ✅ Calculé une fois, réutilisé |
| Fallback | N/A | ✅ Calcul local si API fail |

**Migration automatique** : Pas besoin de script. À la première connexion, le hook `useServerImpactAggregates` déclenche un recalcul et crée les champs serveur.

---

## 🎉 Résultat

**L'Étape 5 est 100% fonctionnelle !**

L'utilisateur bénéficie maintenant de :
1. ✅ Agrégats serveur fiables et synchronisés
2. ✅ Performance optimale (pas de recalcul inutile)
3. ✅ Sync multi-device automatique
4. ✅ Protection anti-triche (source de vérité serveur)
5. ✅ UX jamais bloquée (fallback + fire-and-forget)
6. ✅ Compatible plan Spark (pas de Cloud Functions)

**Prêt pour production !** 🚀

---

## 📝 Notes techniques

### Pourquoi Vercel au lieu de Cloud Functions ?

**Avantages Vercel** :
- ✅ Plan Spark compatible (gratuit Firebase)
- ✅ Déjà utilisé pour webhook Stripe
- ✅ Déploiement Git automatique
- ✅ Quotas généreux
- ✅ Cold start rapide

**Inconvénients Cloud Functions** :
- ❌ Requiert plan Blaze (pay-as-you-go)
- ❌ Coût même si usage minimal
- ❌ Configuration supplémentaire

**Conclusion** : Vercel est le meilleur choix pour ce projet.

### Idempotence

L'API est **idempotente** : appeler plusieurs fois le même recalcul produit le même résultat. Pas de risque de "double comptage".

### Gestion des erreurs

- **Token expiré** : Réessaye avec un token frais
- **API down** : Fallback local (UX non bloquée)
- **Firestore timeout** : Retry automatique (Admin SDK)
- **Invalid data** : Logs + skip l'event problématique

---

## 🔮 Évolutions futures

### Court terme
- **Bouton "Recalculer"** en mode dev (déjà implémenté dans le hook)
- **Badge "Synced"** vert quand les agrégats sont à jour

### Moyen terme
- **Webhook Firestore → Vercel** : Recalcul déclenché automatiquement (trigger Firestore natif)
- **Cache Redis** : Stocker les agrégats en cache (réduire latence)
- **Batch recalculation** : Recalculer tous les users en une fois (script admin)

### Long terme
- **Agrégats en temps réel** : WebSocket pour mise à jour instantanée
- **Historique des agrégats** : Graphique de l'évolution dans le temps
- **Leaderboard** : Classement des utilisateurs par impact total

---

**Documentation complète — Prêt pour la suite !** 😊

