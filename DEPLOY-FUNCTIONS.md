# Déploiement Cloud Functions - Guide rapide

## Problème : Firebase CLI non installé

```bash
firebase: command not found
```

## Solution : 3 options

### Option 1 : Installer Firebase CLI globalement (recommandé)

```bash
# Corriger les permissions npm
sudo chown -R $(whoami) ~/.npm

# Installer Firebase CLI
npm install -g firebase-tools

# Vérifier l'installation
firebase --version
```

### Option 2 : Utiliser npx (sans installation)

```bash
# Utiliser npx directement
npx firebase-tools login
npx firebase-tools deploy --only functions
```

### Option 3 : Installer localement dans le projet

```bash
# Installer dans node_modules local
npm install --save-dev firebase-tools

# Utiliser via npx
npx firebase login
npx firebase deploy --only functions
```

---

## Déploiement étape par étape

### 1. Se connecter à Firebase

```bash
# Avec CLI globale
firebase login

# Ou avec npx
npx firebase-tools login
```

Cela ouvrira ton navigateur pour l'authentification Google.

### 2. Vérifier le projet

```bash
# Avec CLI globale
firebase projects:list

# Ou avec npx
npx firebase-tools projects:list
```

Tu devrais voir `financequest-pwa` dans la liste.

### 3. Déployer les Cloud Functions

```bash
# Avec CLI globale
firebase deploy --only functions

# Ou avec npx
npx firebase-tools deploy --only functions
```

⏱️ Le déploiement prend ~2-3 minutes.

### 4. Vérifier le déploiement

```bash
# Lister les functions déployées
firebase functions:list

# Voir les logs
firebase functions:log --only aggregateSavingsImpact
```

---

## Déploiement rapide via Vercel API (alternative)

Si tu utilises déjà Vercel, tu peux aussi déployer via leurs API endpoints pour éviter Firebase CLI localement.

Mais je recommande **Option 1** (Firebase CLI globale) pour avoir tous les outils disponibles.

---

## Test après déploiement

### 1. Créer un savings event via Quick Win

Dans l'app localhost, utilise le Quick Win modal pour créer un événement (ex: Netflix 12.99€/mois).

### 2. Vérifier les logs Cloud Function

```bash
firebase functions:log --only aggregateSavingsImpact --limit 10
```

Tu devrais voir :
```
✅ Aggregates updated for user Y1iJLrdOonaAvIx5dijeBlI2r8D2: {
  estimated: 155.88,
  verified: 0,
  count: 0
}
```

### 3. Vérifier Firestore

Console Firebase > Firestore > `/users/{uid}`

Champs ajoutés :
- `impactAnnualEstimated: 155.88`
- `impactAnnualVerified: 0`
- `proofsVerifiedCount: 0`
- `lastImpactRecalcAt: Timestamp`

### 4. Vérifier l'UI

Le Hero devrait afficher automatiquement "+€156/an" (sans reload).

---

## Troubleshooting

### Erreur "Missing permissions"

```bash
# Vérifier le compte de service
firebase projects:list

# Se reconnecter
firebase logout
firebase login
```

### Timeout lors du déploiement

```bash
# Augmenter le timeout
firebase deploy --only functions --force
```

### Functions non déclenchées

```bash
# Vérifier les logs d'erreur
firebase functions:log | grep ERROR

# Redéployer
firebase deploy --only functions
```

---

## Commandes utiles

```bash
# Logs en temps réel
firebase functions:log --only aggregateSavingsImpact

# Shell interactif
firebase functions:shell

# Émulateurs locaux
firebase emulators:start --only functions,firestore

# Supprimer une function
firebase functions:delete recomputeUserImpact
```

---

## Pour plus tard : CI/CD

Automatiser le déploiement avec GitHub Actions :

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Functions
on:
  push:
    branches: [main]
    paths: ['functions/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd functions && npm ci
      - run: firebase deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Générer le token :
```bash
firebase login:ci
```

