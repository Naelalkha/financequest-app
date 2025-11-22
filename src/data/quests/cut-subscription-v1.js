import { FaTrash, FaCheckCircle, FaCoins } from 'react-icons/fa';

export const cutSubscriptionQuest = {
  id: 'cut-subscription-v1',
  category: 'budget',
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 6,
  xp: 120,
  isPremium: false,
  starterPack: true,
  order: 1,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['starter', 'subscription', 'budgeting', 'quickwin', 'actionnable'],
    relatedQuests: [],
    averageCompletionTime: 6,
    completionRate: 0.90,
    userRating: 4.9,
    featured: true
  },

  // Impact financier estimé
  estimatedImpact: {
    amount: 13,
    period: 'month'
  },

  icons: {
    main: FaTrash,
    steps: [FaCheckCircle, FaCoins]
  },
  
  colors: {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#EF4444',
    background: 'from-red-50 to-orange-50',
    darkBackground: 'from-red-900/20 to-orange-900/20'
  },
  
  // Propriétés principales (FR par défaut)
  title_fr: 'Coupe 1 abonnement inutile',
  title_en: 'Cut one unused subscription',
  title: 'Coupe 1 abonnement inutile',
  
  description_fr: 'Gagne en moyenne ~€13/mois (≈ €156/an) en 5–8 min.',
  description_en: 'Save an average of ~€13/month (≈ €156/yr) in 5–8 min.',
  description: 'Gagne en moyenne ~€13/mois (≈ €156/an) en 5–8 min.',
  
  objectives_fr: [
    'Repère 1 abonnement que tu n\'utilises plus',
    'Suis le mini-guide pour annuler',
    'Ajoute l\'économie à ton Impact'
  ],
  objectives_en: [
    'Spot 1 subscription you no longer use',
    'Follow the mini-guide to cancel',
    'Add the saving to your Impact'
  ],
  objectives: [
    'Repère 1 abonnement que tu n\'utilises plus',
    'Suis le mini-guide pour annuler',
    'Ajoute l\'économie à ton Impact'
  ],
  
  prerequisites_fr: ['Aucun'],
  prerequisites_en: ['None'],
  
  rewards: {
    badge: 'quickwin_first_cancel',
    unlocks: []
  },
  
  steps: [
    // ========================================
    // ÉTAPE 1 — Intro (type: info)
    // ========================================
    {
      id: 'intro',
      type: 'info',
      title: 'Coupe 1 abonnement inutile',
      title_fr: 'Coupe 1 abonnement inutile',
      title_en: 'Cut one unused subscription',
      content: `**Gagne en moyenne ~€13/mois (≈ €156/an) en 5–8 min.**

**Ce que tu vas faire :**

• Repère 1 abonnement que tu n'utilises plus
• Suis le mini-guide pour annuler  
• Ajoute l'économie à ton Impact

C'est parti ! 🚀`,
      content_fr: `**Gagne en moyenne ~€13/mois (≈ €156/an) en 5–8 min.**

**Ce que tu vas faire :**

• Repère 1 abonnement que tu n'utilises plus
• Suis le mini-guide pour annuler  
• Ajoute l'économie à ton Impact

C'est parti ! 🚀`,
      content_en: `**Save ~€13/mo (≈ €156/yr) in 5–8 min.**

**What you'll do:**

• Spot 1 subscription you no longer use
• Follow the mini-guide to cancel
• Add the saving to your Impact

Let's go! 🚀`,
      funFact: '💡 40% des abonnements payés ne sont jamais ou rarement utilisés !',
      funFact_fr: '💡 40% des abonnements payés ne sont jamais ou rarement utilisés !',
      funFact_en: '💡 40% of paid subscriptions are never or rarely used!'
    },
    
    // ========================================
    // ÉTAPE 2 — Repérer & chiffrer
    // Structure pour stocker serviceName et monthlyAmount
    // Le composant UI devra parser le texte ou utiliser les suggestions
    // ========================================
    {
      id: 'choose_service',
      type: 'reflection',
      title: 'Quel abonnement veux-tu annuler ?',
      title_fr: 'Quel abonnement veux-tu annuler ?',
      title_en: 'Which subscription do you want to cancel?',
      prompt: `**Choisis UN service parmi ces exemples courants :**

• Netflix
• Spotify  
• Canal+
• Amazon Prime
• iCloud / Google One
• Adobe
• Xbox / PS+
• VPN
• Salle de sport
• Autre…

**Puis indique le montant mensuel** (€/mois)

📝 **Format** : Note le nom du service et son prix mensuel
**Exemple** : "Netflix - 13€/mois"`,
      prompt_fr: `**Choisis UN service parmi ces exemples courants :**

• Netflix
• Spotify  
• Canal+
• Amazon Prime
• iCloud / Google One
• Adobe
• Xbox / PS+
• VPN
• Salle de sport
• Autre…

**Puis indique le montant mensuel** (€/mois)

📝 **Format** : Note le nom du service et son prix mensuel
**Exemple** : "Netflix - 13€/mois"`,
      prompt_en: `**Choose ONE service from these common examples:**

• Netflix
• Spotify
• Canal+
• Amazon Prime
• iCloud / Google One
• Adobe
• Xbox / PS+
• VPN
• Gym membership
• Other…

**Then indicate the monthly amount** (€/month)

📝 **Format**: Write the service name and monthly price
**Example**: "Netflix - €13/month"`,
      placeholder: 'Ex: Netflix - 13€/mois',
      placeholder_fr: 'Ex: Netflix - 13€/mois',
      placeholder_en: 'e.g., Netflix - €13/month',
      minLength: 5,
      
      // Suggestions de services pour chips cliquables (si implémenté dans l'UI)
      serviceSuggestions: [
        'Netflix',
        'Spotify',
        'Canal+',
        'Amazon Prime',
        'iCloud',
        'Adobe',
        'Xbox / PS+',
        'VPN',
        'Salle de sport',
        'Autre…'
      ],
      
      // Configuration pour parsing du texte saisi
      parsing: {
        enabled: true,
        // Regex pour détecter montant : nombre avec . ou , + éventuel € + éventuel "/mois"
        amountRegex: /(\d+[.,]?\d*)\s*€?\s*\/?\s*mois?/i,
        // Format acceptés : "Netflix - 13", "Netflix 13€/mois", "Spotify 9,99", "Prime 6 €"
        acceptedFormats: [
          '{service} - {amount}',
          '{service} {amount}€/mois',
          '{service} {amount}',
          '{service} {amount} €'
        ]
      },
      
      // Validation
      validation: {
        required: true,
        minLength: 5,
        amountRules: {
          min: 0.01,
          max: 1000,
          finite: true
        }
      },
      
      hint: '💡 **Comment trouver le montant ?** Relevé bancaire, emails, App Store / Google Play, espace abonnement du service',
      hint_fr: '💡 **Comment trouver le montant ?** Relevé bancaire, emails, App Store / Google Play, espace abonnement du service',
      hint_en: '💡 **How to find the amount?** Bank statement, emails, App Store / Google Play, service subscription page',
      
      errors_fr: {
        required: 'Entre le nom du service et le montant',
        invalid: 'Entre un montant valide (ex: 12,99)',
        minLength: 'Entre au moins le nom du service',
        service: 'Sélectionne un service',
        amount: 'Entre un montant valide (ex: 12,99)',
        amountRange: 'Le montant doit être entre 0 et 1000€'
      },
      errors_en: {
        required: 'Enter the service name and amount',
        invalid: 'Enter a valid amount (e.g., 12.99)',
        minLength: 'Enter at least the service name',
        service: 'Pick a service',
        amount: 'Enter a valid amount (e.g., 12.99)',
        amountRange: 'Amount must be between 0 and 1000€'
      },
      
      // Structure de données attendue dans stepAnswers après complétion
      // stepAnswers['choose_service'] = { serviceName: 'Netflix', monthlyAmount: 13 }
      expectedData: {
        serviceName: 'string',
        monthlyAmount: 'number'
      }
    },
    
    // ========================================
    // ÉTAPE 3 — Confirmer & agir (type: checklist)
    // ========================================
    {
      id: 'checklist',
      type: 'checklist',
      title: 'Annule ton abonnement',
      title_fr: 'Annule ton abonnement',
      title_en: 'Cancel your subscription',
      description: 'Suis ces étapes pour annuler',
      description_fr: 'Suis ces étapes pour annuler',
      description_en: 'Follow these steps to cancel',
      content: `**Guide d'annulation :**

Tu vas économiser de l'argent chaque mois ! Suis ces étapes simples :`,
      content_fr: `**Guide d'annulation :**

Tu vas économiser de l'argent chaque mois ! Suis ces étapes simples :`,
      content_en: `**Cancellation guide:**

You'll save money every month! Follow these simple steps:`,
      items: [
        { 
          id: 'step-1', 
          text: 'Ouvrir l\'espace abonnement / App Store / Play Store',
          text_fr: 'Ouvrir l\'espace abonnement / App Store / Play Store',
          text_en: 'Open subscription page / App Store / Play Store',
          xp: 10 
        },
        { 
          id: 'step-2', 
          text: 'Chercher "Gérer l\'abonnement"',
          text_fr: 'Chercher "Gérer l\'abonnement"',
          text_en: 'Look for "Manage subscription"',
          xp: 10 
        },
        { 
          id: 'step-3', 
          text: 'Cliquer "Annuler / Résilier"',
          text_fr: 'Cliquer "Annuler / Résilier"',
          text_en: 'Click "Cancel / Unsubscribe"',
          xp: 10 
        },
        { 
          id: 'step-4', 
          text: 'Valider la confirmation',
          text_fr: 'Valider la confirmation',
          text_en: 'Confirm cancellation',
          xp: 10 
        }
      ],
      explanation: `💡 **Aide supplémentaire :**

**Je n'y arrive pas ?**
• Vérifie tes emails de confirmation d'abonnement
• Contacte le support client par chat
• Sur iPhone : Réglages → Ton nom → Abonnements
• Sur Android : Play Store → Menu → Abonnements

⚠️ **Bon à savoir** : Ton abonnement reste actif jusqu'à la fin de la période déjà payée.`,
      explanation_fr: `💡 **Aide supplémentaire :**

**Je n'y arrive pas ?**
• Vérifie tes emails de confirmation d'abonnement
• Contacte le support client par chat
• Sur iPhone : Réglages → Ton nom → Abonnements
• Sur Android : Play Store → Menu → Abonnements

⚠️ **Bon à savoir** : Ton abonnement reste actif jusqu'à la fin de la période déjà payée.`,
      explanation_en: `💡 **Additional help:**

**I can't do it?**
• Check your subscription confirmation emails
• Contact customer support via chat
• On iPhone: Settings → Your name → Subscriptions
• On Android: Play Store → Menu → Subscriptions

⚠️ **Good to know**: Your subscription stays active until the end of the paid period.`,
      skippable: true,
      skipCTA: 'Je ferai plus tard',
      skipCTA_fr: 'Je ferai plus tard',
      skipCTA_en: 'I\'ll do it later'
    },
    
    // ========================================
    // ÉTAPE 4 — Ajouter à l'Impact (type: action)
    // Cette étape doit ouvrir AddSavingsModal avec les données de l'étape 2
    // ========================================
    {
      id: 'impact',
      type: 'action',
      title: 'Ajoute ton économie à l\'Impact',
      title_fr: 'Ajoute ton économie à l\'Impact',
      title_en: 'Add your saving to Impact',
      description: 'Enregistre cette économie pour voir ton Impact total augmenter',
      description_fr: 'Enregistre cette économie pour voir ton Impact total augmenter',
      description_en: 'Record this saving to see your total Impact grow',
      content: {
        fr: {
          title: '🎉 Bravo !',
          description: `Tu viens d'annuler un abonnement inutile !

**Prochaine étape :** Ajoute cette économie à ton Impact pour la comptabiliser.`,
          actionLabel: 'Ajouter à mon Impact',
          secondaryActionLabel: 'Plus tard'
        },
        en: {
          title: '🎉 Well done!',
          description: `You just canceled an unused subscription!

**Next step:** Add this saving to your Impact to track it.`,
          actionLabel: 'Add to Impact',
          secondaryActionLabel: 'Later'
        }
      },
      
      // Configuration pour le modal AddSavingsModal
      modalConfig: {
        component: 'AddSavingsModal',
        // Ces valeurs seront préremplies depuis stepAnswers['choose_service']
        prefill: {
          // title sera construit depuis stepAnswers: `Abonnement — ${serviceName}`
          title: 'Abonnement — {serviceName}', // Template à remplacer
          amount: '{monthlyAmount}', // Valeur depuis stepAnswers
          period: 'month', // Fixe
          questId: 'cut-subscription-v1', // Fixe
          source: 'quest', // Fixe
          proof: {
            note: 'Ajouté depuis la quête' // Optionnel
          }
        },
        // Champs verrouillés côté service
        lockedFields: ['questId', 'source', 'period'],
        // Champs éditables
        editableFields: ['title', 'amount', 'proof.note']
      },
      
      // Actions disponibles
      actions: [
        {
          id: 'add_to_impact',
          title: 'Ajouter à l\'Impact',
          title_fr: 'Ajouter à l\'Impact',
          title_en: 'Add to Impact',
          description: 'Ouvre le modal pour enregistrer l\'économie',
          description_fr: 'Ouvre le modal pour enregistrer l\'économie',
          description_en: 'Opens modal to record the saving',
          verification: 'modal_completion',
          xp: 30
        }
      ],
      
      // Skippable avec CTA secondaire
      skippable: true,
      skipCTA: 'Plus tard',
      skipCTA_fr: 'Plus tard',
      skipCTA_en: 'Later',
      
      // Messages toast
      toast: {
        success: 'Économie ajoutée : +{annual}€/an',
        success_fr: 'Économie ajoutée : +{annual}€/an',
        success_en: 'Saving added: +€{annual}/yr',
        error: 'Erreur lors de l\'ajout',
        error_fr: 'Erreur lors de l\'ajout',
        error_en: 'Error adding saving'
      },
      
      // Détection de doublon
      duplicateDetection: {
        enabled: true,
        checkSameDay: true,
        criteria: {
          questId: 'cut-subscription-v1',
          titleContains: '{serviceName}', // Template
          amountRange: 0.20 // ±20%
        },
        prompt: {
          title: 'Déjà ajouté aujourd\'hui ?',
          title_fr: 'Déjà ajouté aujourd\'hui ?',
          title_en: 'Already added today?',
          body: 'Tu as déjà enregistré {amount}€/mois pour {service} aujourd\'hui. L\'ajouter quand même ?',
          body_fr: 'Tu as déjà enregistré {amount}€/mois pour {service} aujourd\'hui. L\'ajouter quand même ?',
          body_en: 'You already recorded €{amount}/month for {service} today. Add anyway?',
          cta: {
            cancel: 'Annuler',
            cancel_fr: 'Annuler',
            cancel_en: 'Cancel',
            confirm: 'Ajouter quand même',
            confirm_fr: 'Ajouter quand même',
            confirm_en: 'Add anyway'
          }
        }
      },
      
      // CTAs après succès
      successActions: [
        {
          id: 'finish',
          label: 'Terminer',
          label_fr: 'Terminer',
          label_en: 'Finish',
          type: 'primary',
          action: 'complete_quest'
        },
        {
          id: 'view_impact',
          label: 'Voir l\'Impact',
          label_fr: 'Voir l\'Impact',
          label_en: 'See Impact',
          type: 'secondary',
          route: '/impact'
        }
      ]
    }
  ],
  
  completionMessage: {
    title: '🎉 Mission accomplie !',
    title_fr: '🎉 Mission accomplie !',
    title_en: '🎉 Mission accomplished!',
    description: 'Tu as complété ta première quête d\'économie. Bravo !',
    description_fr: 'Tu as complété ta première quête d\'économie. Bravo !',
    description_en: 'You completed your first savings quest. Congratulations!',
    nextSteps: [
      'Ajoute cette économie à ton Impact',
      'Explore les autres quêtes du Starter Pack',
      'Continue à optimiser tes finances'
    ]
  }
};

export default cutSubscriptionQuest;
