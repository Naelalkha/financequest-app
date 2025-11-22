# Guide d'Implémentation - Quête "Couper un abonnement"

## 📋 Structure de la Quête

La quête `cut-subscription-v1` est maintenant structurée pour réduire la friction et intégrer directement le modal Impact dans le flow.

## 🎯 Flow Utilisateur

1. **Étape 1 (intro)** → Info avec bullets
2. **Étape 2 (choose_service)** → Saisie service + montant
3. **Étape 3 (checklist)** → Guide d'annulation (skippable)
4. **Étape 4 (impact)** → Ouverture modal AddSavingsModal prérempli

## 🔧 Implémentation UI - Étape 2

### Données à stocker

Quand l'utilisateur complète l'étape 2, stocker dans `stepAnswers['choose_service']` :

```javascript
{
  serviceName: 'Netflix',  // string
  monthlyAmount: 13        // number (0.01 - 1000)
}
```

### Parsing du texte saisi

Si l'utilisateur saisit un texte libre (ex: "Netflix - 13€/mois"), parser avec :

```javascript
// Regex fournie dans step.parsing.amountRegex
const amountRegex = /(\d+[.,]?\d*)\s*€?\s*\/?\s*mois?/i;
const match = userInput.match(amountRegex);

if (match) {
  const amountStr = match[1].replace(',', '.'); // Remplacer virgule par point
  const monthlyAmount = parseFloat(amountStr);
  
  // Validation
  if (Number.isFinite(monthlyAmount) && monthlyAmount > 0 && monthlyAmount <= 1000) {
    const serviceName = userInput.replace(amountRegex, '').trim();
    
    // Stocker dans stepAnswers
    stepAnswers['choose_service'] = {
      serviceName,
      monthlyAmount
    };
  }
}
```

### Suggestions de services (optionnel)

Si vous implémentez des chips cliquables, utiliser `step.serviceSuggestions` :

```javascript
const suggestions = step.serviceSuggestions; // ['Netflix', 'Spotify', ...]

// Au clic sur un chip, préremplir le champ service
onChipClick = (service) => {
  setServiceName(service);
  // L'utilisateur entre ensuite juste le montant
};
```

### Validation

```javascript
// Vérifier selon step.validation
const isValid = 
  serviceName && serviceName.length > 0 &&
  Number.isFinite(monthlyAmount) &&
  monthlyAmount >= 0.01 &&
  monthlyAmount <= 1000;

if (!isValid) {
  // Afficher erreur depuis step.errors_fr ou step.errors_en
  showError(step.errors_fr.amount || step.errors_en.amount);
}
```

## 🔧 Implémentation UI - Étape 4

### Ouvrir AddSavingsModal prérempli

Quand l'utilisateur arrive à l'étape 4, récupérer les données de l'étape 2 :

```javascript
const step2Data = stepAnswers['choose_service'];
// { serviceName: 'Netflix', monthlyAmount: 13 }

// Construire les valeurs initiales pour AddSavingsModal
const initialValues = {
  title: `Abonnement — ${step2Data.serviceName}`,
  amount: step2Data.monthlyAmount,
  period: 'month', // Fixe
  questId: 'cut-subscription-v1', // Fixe
  source: 'quest', // Fixe
  proof: {
    note: 'Ajouté depuis la quête' // Optionnel
  }
};

// Ouvrir le modal
setShowAddSavingsModal(true);
setSavingsInitialValues(initialValues);
```

### Détection de doublon (avant ouverture modal)

```javascript
// Vérifier si un event existe déjà aujourd'hui
const today = new Date().toISOString().split('T')[0];
const existingEvents = await getSavingsEventsForDate(today);

const duplicate = existingEvents.find(event => {
  return (
    event.questId === 'cut-subscription-v1' &&
    event.title.includes(step2Data.serviceName) &&
    Math.abs(event.amount - step2Data.monthlyAmount) / step2Data.monthlyAmount <= 0.20 // ±20%
  );
});

if (duplicate) {
  // Afficher prompt de confirmation
  const confirmed = await showDuplicatePrompt({
    title: step.toast.duplicate.title_fr,
    body: step.toast.duplicate.body_fr
      .replace('{amount}', step2Data.monthlyAmount)
      .replace('{service}', step2Data.serviceName)
  });
  
  if (!confirmed) {
    return; // Ne pas ouvrir le modal
  }
}
```

### Après succès du modal

```javascript
const handleModalSuccess = (savedEvent) => {
  // 1. Toast de succès
  const annual = step2Data.monthlyAmount * 12;
  toast.success(
    step.toast.success_fr.replace('{annual}', annual)
  );
  
  // 2. Track analytics
  trackEvent('impact_add_confirmed', {
    quest_id: 'cut-subscription-v1',
    amount_month: step2Data.monthlyAmount,
    annual: annual,
    source: 'quest'
  });
  
  // 3. Refresh Impact Hero
  refreshImpactAggregates();
  
  // 4. Afficher CTAs de fin
  setShowSuccessActions(true);
  // - "Terminer" → completeQuest()
  // - "Voir l'Impact" → navigate('/impact')
};
```

### Si utilisateur skip

```javascript
const handleSkip = () => {
  // Track analytics
  trackEvent('impact_add_dismissed', {
    quest_id: 'cut-subscription-v1'
  });
  
  // Continuer quand même à l'étape suivante (ou terminer)
  handleStepComplete({ skipped: true });
};
```

## 📊 Analytics à tracker

### Étape 2
```javascript
trackEvent('quest_step_viewed', {
  step: 'choose_service',
  quest_id: 'cut-subscription-v1'
});

trackEvent('quest_step_completed', {
  step: 'choose_service',
  quest_id: 'cut-subscription-v1',
  service: step2Data.serviceName,
  amount_month: step2Data.monthlyAmount
});
```

### Étape 4
```javascript
trackEvent('impact_add_prompt_shown', {
  quest_id: 'cut-subscription-v1',
  suggested_amount_month: step2Data.monthlyAmount,
  suggested_annual: step2Data.monthlyAmount * 12
});

trackEvent('impact_add_confirmed', {
  quest_id: 'cut-subscription-v1',
  amount_month: step2Data.monthlyAmount,
  annual: step2Data.monthlyAmount * 12,
  source: 'quest'
});

// Si doublon détecté
trackEvent('prevented_duplicate', {
  quest_id: 'cut-subscription-v1',
  service: step2Data.serviceName
});
```

## 🌐 i18n

Tous les textes sont disponibles en FR et EN via :
- `step.title_fr` / `step.title_en`
- `step.prompt_fr` / `step.prompt_en`
- `step.errors_fr` / `step.errors_en`
- `step.toast.success_fr` / `step.toast.success_en`

## ✅ Critères d'Acceptation

1. ✅ Flow fluide sans redirection vers /impact
2. ✅ Service + Montant stockés dans stepAnswers
3. ✅ Modal prérempli avec données de l'étape 2
4. ✅ Validation montants (NaN/0/neg/>1000 refusés)
5. ✅ Détection doublon opérationnelle
6. ✅ Analytics trackés correctement
7. ✅ i18n FR/EN complet
8. ✅ Toast de succès avec montant annualisé
9. ✅ Refresh Impact Hero après ajout

## 🔒 Sécurité

Les champs suivants sont **verrouillés côté service** (Firestore Rules) :
- `questId`: Forcé à 'cut-subscription-v1'
- `source`: Forcé à 'quest'
- `verified`: Ne peut pas être défini côté client
- `timestamp`: Utilise serverTimestamp()

## 📝 Notes pour le Développeur

- Le parsing du texte libre est optionnel mais recommandé pour meilleure UX
- Les suggestions de services peuvent être implémentées comme chips cliquables
- La détection de doublon peut être simplifiée si nécessaire (vérifier juste questId + date)
- Le modal AddSavingsModal existe déjà, il faut juste le préremplir correctement

