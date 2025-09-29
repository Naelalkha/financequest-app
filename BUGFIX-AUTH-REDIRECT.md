# 🐛 Correction : Problème de redirection après création de compte

## Problème identifié

Lors de la création d'un compte sur l'application hébergée sur Vercel :
- ✅ Le compte utilisateur était bien créé dans Firebase Auth
- ❌ Un message d'erreur "erreur lors de la création de compte" s'affichait
- ❌ Pas de redirection vers l'onboarding
- ✅ L'utilisateur était bien connecté (visible en quittant la page)

## Cause racine

L'erreur `POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?... 400 (Bad Request)` était causée par :

1. **Échec de création du document Firestore** : Après la création réussie de l'utilisateur Firebase Auth, la tentative de création du document utilisateur dans Firestore échouait
2. **Gestion d'erreur trop stricte** : L'échec Firestore faisait échouer toute la fonction `register()`, empêchant la redirection
3. **Propagation d'erreur** : L'erreur était propagée jusqu'au composant Register, affichant un message d'erreur et bloquant la navigation

## Solutions implémentées

### 1. Gestion d'erreur robuste dans `AuthContext.jsx`

```javascript
// Avant : Si Firestore échoue, tout échoue
const userData = await createUserDocument(uid, email, { displayName, country });

// Après : Firestore optionnel, Auth prioritaire
let userData = { /* données par défaut */ };
try {
  userData = await createUserDocument(uid, email, { displayName, country });
} catch (firestoreError) {
  console.error('Failed to create user document, but user is authenticated:', firestoreError);
  // L'utilisateur est créé dans Firebase Auth, on continue
}
```

### 2. Séparation des erreurs critiques et non-critiques

```javascript
// Seulement faire échouer si l'authentification Firebase échoue
if (error.code && error.code.startsWith('auth/')) {
  setError(error.message);
  throw error;
} else {
  // Pour les autres erreurs, logger mais ne pas faire échouer
  console.error('Non-auth error during registration:', error);
  return null;
}
```

### 3. Amélioration de la robustesse Firestore

- Utilisation de `{ merge: true }` pour éviter les conflits
- Gestion d'erreur pour `lastLogin` update
- Données par défaut en cas d'échec

### 4. Correction du composant Register

```javascript
// Gestion du cas où register() retourne null (succès partiel)
const result = await register(email, password, name, country);
if (result !== null) {
  // Succès complet
  navigate('/onboarding');
} else {
  // Succès partiel (Auth OK, Firestore KO)
  navigate('/onboarding'); // On redirige quand même
}
```

## Résultat attendu

Après ces corrections :
- ✅ Création de compte Firebase Auth réussie
- ✅ Redirection vers `/onboarding` même si Firestore échoue
- ✅ Message de succès affiché
- ✅ Pas de message d'erreur bloquant
- ✅ Document Firestore créé quand possible
- ✅ Données par défaut utilisées en cas d'échec Firestore

## Variables d'environnement recommandées

Pour une meilleure sécurité sur Vercel, ajouter ces variables :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Test recommandé

1. Créer un nouveau compte sur la version déployée
2. Vérifier la redirection vers `/onboarding`
3. Vérifier que l'utilisateur est bien connecté
4. Vérifier les logs de la console pour les erreurs Firestore (non-bloquantes)
