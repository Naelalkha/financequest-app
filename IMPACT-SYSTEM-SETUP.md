# Système d'Impact / Économies - Documentation Setup

## 📋 Vue d'ensemble

Ce document détaille l'implémentation du système de suivi des économies réelles générées par les quêtes complétées dans FinanceQuest.

## 🏗️ Architecture

### Structure des données

```
/users/{uid}
  - impactAnnualEstimated: number (calculé serveur)
  - impactAnnualVerified: number (calculé serveur)
  - proofsVerifiedCount: number (calculé serveur)
  
  /savingsEvents/{eventId}
    - id: string
    - title: string
    - questId: string
    - amount: number (0 - 100,000)
    - period: 'month' | 'year'
    - verified: boolean (serveur uniquement)
    - proof: { type, url?, note? } | null
    - source: 'quest' | 'manual'
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Storage

```
/proofs/{uid}/{eventId}/{filename}
  - Formats acceptés: images (JPEG, PNG, GIF, WebP), PDF
  - Taille max: 5 MB
  - Accès: propriétaire uniquement
```

## 🔒 Sécurité

### Firestore Rules

#### Champs protégés (users)
Les champs suivants ne peuvent être modifiés que par le serveur :
- `isPremium`, `premiumStatus`, `stripeCustomerId`, etc.
- `impactAnnualEstimated`, `impactAnnualVerified`
- `proofsVerifiedCount`

#### SavingsEvents (sous-collection)

**Validation stricte :**
- ✅ Ownership: seul le propriétaire peut CRUD ses événements
- ✅ Champs requis: title, amount, period, source, timestamps
- ✅ Types validés: string, number, enum, timestamp
- ✅ Bornes: amount entre 0 et 100,000
- ✅ `verified` forcé à `false` à la création
- ✅ `verified` non modifiable côté client
- ✅ `proof` nullable ou map valide

### Storage Rules

- ✅ Structure `/proofs/{uid}/{eventId}/{filename}`
- ✅ Accès lecture/écriture: propriétaire uniquement
- ✅ Validation type: images ou PDF uniquement
- ✅ Taille max: 5 MB

## 📦 Services & Hooks

### Services

#### `savingsEvents.js`
CRUD complet pour les événements d'économie :
- `createSavingsEventInFirestore()` - Utilise `serverTimestamp()`
- `updateSavingsEventInFirestore()` - Protection `verified` et `createdAt`
- `deleteSavingsEventFromFirestore()`
- `getAllSavingsEvents()` - Avec pagination (limit: 50 par défaut)
- `getSavingsEventById()`
- `calculateTotalSavings()`
- `getSavingsByQuest()`

#### `proofUpload.js`
Gestion des uploads de preuves :
- `validateProofFile()` - Validation type et taille
- `uploadProofFile()` - Upload vers Storage
- `deleteProofFile()` - Suppression
- `updateProofFile()` - Remplacement atomique

### Hooks React

#### `useSavingsEvents()`
Hook principal (pas de chargement auto) :
```javascript
const { 
  events, loading, error,
  loadEvents, createEvent, updateEvent, deleteEvent,
  getEventById, getTotalSavings, getEventsByQuest 
} = useSavingsEvents();
```

#### `useQuestSavings(questId)`
Événements d'une quête spécifique :
```javascript
const { questEvents, loading, error } = useQuestSavings(questId);
```

#### `useSavingsStats()`
Statistiques globales (à utiliser dans Dashboard) :
```javascript
const { stats, loading, error, reload } = useSavingsStats();
// stats: { total, count, byPeriod, verified, pending }
```

## ⚡ Optimisations Performance

### 1. Pas de chargement automatique
`useSavingsEvents()` ne charge **PAS** automatiquement tous les événements au montage pour éviter la surcharge.

**Pour le Dashboard :**
- Utiliser `useSavingsStats()` qui lit les agrégats depuis `/users/{uid}`
- Les agrégats sont calculés côté serveur (étape 2)

**Pour le Ledger :**
- Appeler `loadEvents()` explicitement
- Utiliser `options.limitCount` pour la pagination
- Défaut: 50 événements maximum

### 2. Timestamps serveur
Tous les timestamps utilisent `serverTimestamp()` pour :
- Cohérence entre clients
- Respect strict des règles Firestore
- Éviter les problèmes de timezone

### 3. Pagination
```javascript
// Charger les 50 premiers
await loadEvents({ limitCount: 50 });

// Charger plus (à implémenter avec startAfter)
await loadEvents({ limitCount: 50, startAfter: lastDoc });
```

## 🌐 i18n

### Clés ajoutées

**impact.*** (FR/EN)
- `hero_title`, `hero_sub`
- `cta_quickwin`, `cta_continue`
- `see_ledger`
- `proofs_none`, `proofs_one`, `proofs_pending`, `proofs_verified`

**quest.card.*** (FR/EN)
- `eta_minutes`: "{{minutes}} min"
- `impact_estimated`: "Est. savings: {{amount}}"

**daily.challenge.*** (FR/EN)
- `title`, `eta`, `impact`

## 🔄 Types TypeScript/JSDoc

`src/types/savingsEvent.js` fournit :
- Types complets JSDoc
- `isValidSavingsEvent()` - Validation côté client
- `createSavingsEvent()` - Helper création
- `DEFAULT_SAVINGS_EVENT` - Valeurs par défaut
- `PROTECTED_SAVINGS_FIELDS` - Liste des champs protégés

## 🚀 Prochaines étapes

1. **Étape 1** : Interface utilisateur
   - Composants d'affichage
   - Formulaires de création/édition
   - Upload de preuves

2. **Étape 2** : Calcul serveur (Firebase Functions)
   - Agrégation automatique des économies
   - Mise à jour des champs dans `/users/{uid}`
   - Vérification des preuves (optionnel)

3. **Étape 3** : Dashboard Impact
   - Graphiques d'évolution
   - Vue par période
   - Badges & gamification

## 🧪 Tests

Pour tester les règles Firestore :
```bash
firebase emulators:start --only firestore
npm run test:rules
```

Pour tester les règles Storage :
```bash
firebase emulators:start --only storage
npm run test:storage-rules
```

## 📝 Notes importantes

- Le champ `verified` est **strictement** réservé au serveur
- Toujours utiliser `serverTimestamp()` pour les dates
- Ne jamais exposer de fonctions d'administration côté client
- Les uploads de preuves sont optionnels
- Les agrégats seront calculés par Cloud Functions (étape 2)

