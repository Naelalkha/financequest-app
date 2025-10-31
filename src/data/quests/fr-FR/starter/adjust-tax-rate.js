import { FaPercentage, FaCalculator, FaCheckCircle } from 'react-icons/fa';

export const adjustTaxRate = {
  id: 'adjust-tax-rate',
  category: 'taxes', // Catégorie métier Fiscalité
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 7,
  xp: 120,
  isPremium: false,
  starterPack: true, // Flag collection Starter Pack
  order: 2,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['starter', 'taxes', 'prelevement-source', 'optimization'],
    relatedQuests: [],
    averageCompletionTime: 7,
    completionRate: 0.85,
    userRating: 4.6,
    featured: true
  },

  // Impact financier estimé
  estimatedImpact: {
    amount: 120, // €120/an en moyenne (éviter le trop-perçu)
    period: 'year'
  },

  icons: {
    main: FaPercentage,
    steps: [FaCalculator, FaCheckCircle]
  },
  
  colors: {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#3B82F6',
    background: 'from-blue-50 to-indigo-50',
    darkBackground: 'from-blue-900/20 to-indigo-900/20'
  },
  
  title: 'Ajuster ton taux de prélèvement à la source',
  description: 'Optimise ton taux d\'imposition pour éviter de prêter de l\'argent gratuitement à l\'État.',
  
  objectives: [
    'Comprendre ton taux actuel',
    'Estimer ton taux optimal',
    'Demander un ajustement si nécessaire'
  ],
  
  steps: [
    {
      id: 'step-1',
      type: 'content',
      title: 'Pourquoi ajuster ton taux ?',
      description: 'Comprends l\'enjeu en 1 minute',
      content: `
## Le problème du taux standard

Si ton taux est **trop élevé** :
- ✅ Tu paies trop chaque mois
- ❌ L'État te rend l'argent en septembre... sans intérêts
- ❌ C'est un prêt gratuit de **€10/mois = €120/an** en moyenne

Si ton taux est **trop bas** :
- ❌ Tu devras payer un complément en septembre
- ⚠️ Risque de mauvaise surprise

**L'objectif** : Ajuster pour être au plus juste et garder ton argent !
      `
    },
    {
      id: 'step-2',
      type: 'checklist',
      title: 'Vérifie ta situation',
      description: 'Réponds à ces questions',
      content: `
Coche les affirmations **vraies** pour toi :
      `,
      tasks: [
        {
          id: 'task-recent-change',
          label: 'J\'ai eu un changement récent (nouvel emploi, augmentation, baisse de revenus)',
          completed: false
        },
        {
          id: 'task-refund',
          label: 'J\'ai reçu un remboursement d\'impôts en septembre dernier',
          completed: false
        },
        {
          id: 'task-payment',
          label: 'J\'ai dû payer un complément en septembre dernier',
          completed: false
        },
        {
          id: 'task-unsure',
          label: 'Je ne sais pas si mon taux est correct',
          completed: false
        }
      ],
      validation: {
        type: 'optional'
      }
    },
    {
      id: 'step-3',
      type: 'action',
      title: 'Simule ton taux optimal',
      description: 'Utilise l\'outil officiel',
      content: `
## Rendez-vous sur impots.gouv.fr

1. Va sur **impots.gouv.fr** → Espace Particulier
2. Clique sur **"Gérer mon prélèvement à la source"**
3. Utilise le **simulateur de taux**
4. Note le taux recommandé

**Exemple :**
- Taux actuel : **8%**
- Taux recommandé : **6%**
- Gain mensuel : **€20** → **€240/an** !

💡 **Astuce** : Le simulateur est ultra-précis, fais-lui confiance.
      `,
      actionButton: {
        label: 'J\'ai simulé !',
        icon: 'FaCalculator'
      }
    },
    {
      id: 'step-4',
      type: 'reflection',
      title: 'Quel est ton nouveau taux ?',
      description: 'Inscris le taux recommandé par le simulateur',
      content: `
Note le taux optimal que le simulateur t'a donné.

Si le simulateur recommande de **baisser** ton taux, tu vas économiser de l'argent chaque mois !
      `,
      placeholder: 'Ex: 6%',
      validation: {
        required: true,
        minLength: 1,
        message: 'Donne au moins une indication de ton taux'
      }
    },
    {
      id: 'step-5',
      type: 'action',
      title: 'Demande l\'ajustement',
      description: 'Valide le changement en ligne',
      content: `
## Comment ajuster ton taux

**Sur impots.gouv.fr :**
1. Reste dans **"Gérer mon prélèvement à la source"**
2. Clique sur **"Actualiser suite à une hausse/baisse de revenus"**
3. Valide le nouveau taux
4. ✅ **C'est effectif dès le mois prochain !**

**Alternative :** Si tu préfères attendre, note-le dans ton agenda pour septembre (déclaration annuelle).

⚠️ **Important** : Un taux plus bas = plus d'argent chaque mois, mais assure-toi qu'il est correct pour éviter une régularisation en septembre.
      `,
      actionButton: {
        label: 'Taux ajusté ! 🎉',
        icon: 'FaCheckCircle'
      }
    }
  ],
  
  completionMessage: {
    title: 'Bravo ! Tu optimises tes impôts 🎉',
    description: 'Tu évites de prêter gratuitement de l\'argent à l\'État. Gain estimé : ~€120/an !',
    nextSteps: [
      'Ajoute cette économie à ton Impact',
      'Vérifie ton taux chaque année',
      'Partage cette astuce avec tes proches'
    ]
  }
};

