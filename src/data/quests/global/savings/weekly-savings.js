import { FaPiggyBank, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

export const weeklySavings = {
  id: 'weekly-savings',
  category: 'savings',
  country: 'global', // Universel, virements auto existent partout
  difficulty: 'beginner',
  duration: 6,
  xp: 150,
  isPremium: false,
  starterPack: true, // Flag collection Starter Pack
  order: 3,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['starter', 'savings', 'automation', 'budgeting'],
    relatedQuests: ['livret-a'],
    averageCompletionTime: 6,
    completionRate: 0.88,
    userRating: 4.9,
    featured: true
  },

  // Impact financier estimé
  estimatedImpact: {
    amount: 80, // €20/semaine × 4 = €80/mois = €960/an
    period: 'month'
  },

  icons: {
    main: FaPiggyBank,
    steps: [FaCalendarAlt, FaCheckCircle]
  },
  
  colors: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: 'from-emerald-50 to-green-50',
    darkBackground: 'from-emerald-900/20 to-green-900/20'
  },
  
  title: 'Programmer 20€/semaine d\'épargne',
  description: 'Mets en place un virement automatique pour épargner sans effort. Gain : €960/an.',
  
  objectives: [
    'Choisir un montant hebdomadaire',
    'Programmer le virement automatique',
    'Laisser l\'argent travailler pour toi'
  ],
  
  steps: [
    {
      id: 'step-1',
      type: 'content',
      title: 'Pourquoi épargner €20/semaine ?',
      description: 'Comprends la puissance de la régularité',
      content: `
## La magie des petits montants réguliers

**€20/semaine** = **€960/an** sans y penser !

### Pourquoi ça marche ?

1. **Micro-montant** : €20/semaine = ~€3/jour (un café)
2. **Automatique** : Tu ne vois même pas l'argent partir
3. **Invisible** : Pas de frustration, c'est déjà parti

### Comparaison

- ❌ Épargner €960 d'un coup en décembre : difficile !
- ✅ Épargner €20/semaine : facile et indolore

**Astuce** : Commence petit. Tu pourras augmenter plus tard !
      `
    },
    {
      id: 'step-2',
      type: 'reflection',
      title: 'Quel montant hebdomadaire ?',
      description: 'Choisis un montant réaliste',
      content: `
**Recommandé : €20/semaine** (€960/an)

Mais tu peux ajuster selon ton budget :

- **€10/semaine** → €480/an
- **€20/semaine** → €960/an (recommandé)
- **€30/semaine** → €1 440/an
- **€50/semaine** → €2 400/an

💡 **Conseil** : Commence conservateur. Il vaut mieux tenir dans le temps qu'abandonner après 2 mois.
      `,
      placeholder: 'Ex: 20',
      validation: {
        required: true,
        minLength: 1,
        message: 'Indique un montant (ex: 20)'
      }
    },
    {
      id: 'step-3',
      type: 'action',
      title: 'Programme le virement',
      description: 'Automatise en 3 minutes',
      content: `
## Comment programmer un virement hebdomadaire

### Méthode 1 : Via ton app bancaire (recommandé)

1. Ouvre ton app bancaire
2. Va dans **"Virements"** → **"Virement programmé"**
3. Configure :
   - **Vers** : Ton Livret A (ou compte épargne)
   - **Montant** : €20
   - **Fréquence** : Hebdomadaire (tous les lundis)
   - **Date de début** : Lundi prochain
4. ✅ Valide !

### Méthode 2 : Via l'espace client web

Même principe, mais sur le site de ta banque.

**⚠️ Important :**
- Choisis un jour fixe (ex: lundi = début de semaine)
- Assure-toi d'avoir toujours le solde nécessaire

**💡 Astuce :** Certaines banques appellent ça "Virement permanent" ou "Ordre permanent".
      `,
      actionButton: {
        label: 'Virement programmé ! 🎉',
        icon: 'FaCheckCircle'
      }
    },
    {
      id: 'step-4',
      type: 'checklist',
      title: 'Vérifie ton setup',
      description: 'Dernière validation',
      content: `
Coche pour confirmer :
      `,
      tasks: [
        {
          id: 'task-amount',
          label: 'J\'ai choisi un montant hebdomadaire réaliste',
          completed: false
        },
        {
          id: 'task-programmed',
          label: 'Le virement automatique est programmé',
          completed: false
        },
        {
          id: 'task-verified',
          label: 'J\'ai vérifié la date de début (prochain lundi)',
          completed: false
        },
        {
          id: 'task-destination',
          label: 'Le compte de destination est correct (Livret A ou épargne)',
          completed: false
        }
      ],
      validation: {
        type: 'all_checked',
        message: 'Coche toutes les cases pour valider'
      }
    }
  ],
  
  completionMessage: {
    title: 'Bravo ! Tu épargnes €960/an sans effort 🎉',
    description: 'Ton argent travaille maintenant pour toi, automatiquement !',
    nextSteps: [
      'Ajoute cette économie à ton Impact',
      'Dans 1 mois, vérifie que le virement s\'est bien exécuté',
      'Dans 3 mois, augmente le montant si tu peux (€25, €30...)'
    ]
  }
};

