import { FaTrash, FaCheckCircle, FaCoins } from 'react-icons/fa';

export const cutSubscription = {
  id: 'cut-subscription',
  category: 'budgeting', // Catégorie métier (pas 'starter')
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 5,
  xp: 100,
  isPremium: false,
  starterPack: true, // Flag collection Starter Pack
  order: 1,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['starter', 'subscription', 'budgeting', 'quickwin'],
    relatedQuests: [],
    averageCompletionTime: 5,
    completionRate: 0.92,
    userRating: 4.8,
    featured: true
  },

  // Impact financier estimé
  estimatedImpact: {
    amount: 13, // €13/mois = €156/an (Netflix, Spotify, etc.)
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
  
  title: 'Couper 1 abonnement inutilisé',
  description: 'Identifie et annule un abonnement que tu n\'utilises plus. Gain immédiat : ~€13/mois.',
  
  objectives: [
    'Lister tes abonnements actifs',
    'Identifier 1 abonnement peu utilisé',
    'L\'annuler en 2 minutes'
  ],
  
  steps: [
    {
      id: 'step-1',
      type: 'checklist',
      title: 'Liste tes abonnements',
      description: 'Coche ceux que tu as (ou ajoute les tiens)',
      content: `
Voici les abonnements les plus courants. Coche ceux que tu paies actuellement :
      `,
      tasks: [
        {
          id: 'task-netflix',
          label: 'Netflix (~€14/mois)',
          completed: false
        },
        {
          id: 'task-spotify',
          label: 'Spotify Premium (~€10/mois)',
          completed: false
        },
        {
          id: 'task-amazon',
          label: 'Amazon Prime (~€7/mois)',
          completed: false
        },
        {
          id: 'task-disney',
          label: 'Disney+ (~€9/mois)',
          completed: false
        },
        {
          id: 'task-salle-sport',
          label: 'Salle de sport (~€30/mois)',
          completed: false
        },
        {
          id: 'task-other',
          label: 'Autre abonnement',
          completed: false
        }
      ],
      validation: {
        type: 'min_checked',
        min: 1,
        message: 'Coche au moins 1 abonnement pour continuer'
      }
    },
    {
      id: 'step-2',
      type: 'action',
      title: 'Choisis 1 abonnement à annuler',
      description: 'Sélectionne celui que tu utilises le moins',
      content: `
**Pose-toi ces questions :**

- Quand l'ai-je utilisé pour la dernière fois ?
- Est-ce que je m'en souviens même que je le paie ?
- Y a-t-il une alternative gratuite ?

**Conseil :** Commence par celui que tu n'as pas utilisé depuis 2-3 mois.
      `,
      actionButton: {
        label: 'J\'ai choisi !',
        icon: 'FaCheckCircle'
      }
    },
    {
      id: 'step-3',
      type: 'reflection',
      title: 'Note l\'abonnement que tu vas annuler',
      description: 'Quel est-il et combien économises-tu ?',
      content: `
Inscris ci-dessous :
- Le nom de l'abonnement
- Le montant mensuel

On va l'ajouter à ton Impact juste après ! 💰
      `,
      placeholder: 'Ex: Netflix - 14€/mois',
      validation: {
        required: true,
        minLength: 3,
        message: 'Donne au moins le nom de l\'abonnement'
      }
    },
    {
      id: 'step-4',
      type: 'action',
      title: 'Annule-le maintenant !',
      description: '2 minutes chrono',
      content: `
**Comment annuler rapidement :**

1. **Via l'app/site** : Paramètres → Abonnement → Annuler
2. **Via ta banque** : Bloque le prélèvement automatique
3. **Par email** : "Je souhaite résilier mon abonnement"

⚠️ **Attention aux périodes d'engagement** : Certains abonnements ont des frais d'annulation anticipée.

💡 **Astuce** : Demande un remboursement au prorata si tu as payé pour l'année !
      `,
      actionButton: {
        label: 'C\'est annulé ! 🎉',
        icon: 'FaCheckCircle'
      }
    }
  ],
  
  completionMessage: {
    title: 'Bravo ! Tu viens d\'économiser ~€156/an 🎉',
    description: 'Tu as libéré €13/mois de ton budget. C\'est un excellent début !',
    nextSteps: [
      'Ajoute cette économie à ton Impact',
      'Explore les autres quêtes Starter Pack',
      'Partage ton succès avec tes amis'
    ]
  }
};

