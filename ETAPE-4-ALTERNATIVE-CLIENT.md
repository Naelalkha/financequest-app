# Étape 4 — Alternative : Calcul côté client (plan Spark)

## 🎯 Contexte

Le projet est actuellement sur le **plan Spark (gratuit)** qui ne supporte pas les Cloud Functions.

Pour déployer les Cloud Functions, il faudrait upgrader vers **Blaze (pay-as-you-go)**.

## ✅ Solution actuelle : Calcul côté client

### Implémentation

`ImpactHero` calcule les agrégats localement :
- Utilise `useSavingsEvents()` pour charger les événements
- Calcule `totalAnnual`, `totalVerified`, `proofsVerifiedCount` dans un `useEffect`
- Recharge les événements après Quick Win avec `loadEvents()`

### Avantages

- ✅ Fonctionne avec le plan Spark (gratuit)
- ✅ Pas de configuration supplémentaire
- ✅ Pas de coûts
- ✅ Suffisant pour le MVP/démarrage

### Inconvénients

- ⚠️ Calcul côté client (potentiellement modifiable par un utilisateur avancé)
- ⚠️ Nécessite de charger tous les événements pour calculer le total
- ⚠️ Pas de source de vérité serveur centralisée

---

## 🔄 Migration future vers Cloud Functions (quand Blaze)

Quand tu upgraderas vers Blaze, la migration est simple :

### 1. Upgrader Firebase vers Blaze

```bash
# Aller sur Firebase Console
https://console.firebase.google.com/project/financequest-pwa/usage/details

# Cliquer "Upgrade to Blaze"
# Configurer les alertes (ex: 10€/mois)
```

### 2. Déployer les Cloud Functions

```bash
npx firebase-tools deploy --only functions
```

### 3. Basculer ImpactHero

Remplacer dans `src/components/impact/ImpactHero.jsx` :

```javascript
// Remplacer
import { useSavingsEvents } from '../../hooks/useSavingsEvents';

// Par
import { useImpactAggregates } from '../../hooks/useImpactAggregates';

// Et utiliser
const { impactAnnualEstimated, impactAnnualVerified, proofsVerifiedCount } = useImpactAggregates();
```

C'est tout ! Le reste du code est déjà prêt.

---

## 🚀 Alternative : Vercel/Cloudflare Functions

Tu as mentionné héberger sur Vercel/Cloudflare. Tu peux implémenter les agrégats là-bas :

### Option A : Vercel Serverless Functions

```javascript
// api/aggregate-savings.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!admin.apps.length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, eventId } = req.body;

  try {
    // Recalculer les agrégats (même logique que Cloud Function)
    const eventsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('savingsEvents')
      .get();

    let sumEstimated = 0;
    let sumVerified = 0;
    let countVerified = 0;

    eventsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data || typeof data.amount !== 'number') return;

      const annual = data.amount * (data.period === 'month' ? 12 : 1);
      sumEstimated += annual;

      if (data.verified === true) {
        sumVerified += annual;
        countVerified += 1;
      }
    });

    // Mettre à jour le user document
    await db.collection('users').doc(userId).update({
      impactAnnualEstimated: Math.round(sumEstimated * 100) / 100,
      impactAnnualVerified: Math.round(sumVerified * 100) / 100,
      proofsVerifiedCount: countVerified,
      lastImpactRecalcAt: new Date(),
    });

    return res.status(200).json({ success: true, estimated: sumEstimated, verified: sumVerified });
  } catch (error) {
    console.error('Error aggregating savings:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### Appeler depuis le client

```javascript
// Après création/modification d'un savings event
await fetch('/api/aggregate-savings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.uid, eventId: newEvent.id }),
});
```

### Option B : Webhook Firestore → Vercel

Firestore ne supporte pas les webhooks directs, mais tu peux :
1. Utiliser une Cloud Function minimale (juste pour trigger)
2. Qui appelle ton endpoint Vercel
3. Vercel fait le calcul

**Mais** : Nécessite quand même Blaze pour la Cloud Function trigger.

---

## 💰 Coûts estimés si tu passes à Blaze

### Quota gratuit mensuel

- **Invocations** : 2 000 000 (2M)
- **Compute time** : 400 000 GB-seconds
- **Network egress** : 5 GB

### Ton usage estimé

Pour 1000 utilisateurs actifs avec 10 savings events/mois chacun :
- **Invocations** : 10 000/mois (bien en dessous de 2M)
- **Coût** : **0€/mois** (dans le quota gratuit)

Pour 10 000 utilisateurs actifs :
- **Invocations** : 100 000/mois
- **Coût** : **0€/mois** (toujours dans le quota)

**Conclusion** : Tu ne paierais probablement **rien** pendant longtemps.

---

## 📊 Comparaison des solutions

| Solution | Coût | Complexité | Sécurité | Recommended |
|----------|------|------------|----------|-------------|
| **Calcul client** | 0€ | Faible | ⚠️ Modifiable | ✅ Pour démarrer |
| **Cloud Functions** | 0€ (quota gratuit) | Moyenne | ✅ Sécurisé | ✅ Pour production |
| **Vercel Functions** | 0€ (quota gratuit) | Moyenne | ✅ Sécurisé | 🤔 Si déjà sur Vercel |

---

## 🎯 Recommandation

**Maintenant :**
- ✅ Reste sur calcul client (implémenté)
- ✅ Fonctionne parfaitement pour le MVP
- ✅ 0 coût, 0 configuration

**Quand tu as tes premiers utilisateurs payants :**
- Upgrade vers Blaze
- Déploie les Cloud Functions (code déjà prêt)
- Bascule `ImpactHero` vers `useImpactAggregates`

**Migration = 2 minutes de travail** car tout le code est déjà écrit ! 🚀

---

## 📝 Files à conserver pour plus tard

- ✅ `functions/index.js` : Cloud Functions prêtes
- ✅ `src/hooks/useImpactAggregates.js` : Hook pour lire les agrégats serveur
- ✅ `firebase.json` : Configuration Firebase
- ✅ `ETAPE-4-AGREGATS-SERVEUR.md` : Documentation complète

Tout est prêt pour une migration rapide quand tu voudras ! 😊

