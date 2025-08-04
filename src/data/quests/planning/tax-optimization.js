import { FaCalculator, FaFileAlt, FaChartBar } from 'react-icons/fa';

export const taxOptimization = {
  id: 'tax-optimization',
  category: 'planning',
  difficulty: 'expert',
  duration: 30,
  xp: 200,
  isPremium: true,
  order: 12,
  
  // Métadonnées enrichies
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['taxes', 'expert', 'optimization'],
    relatedQuests: ['business-taxes', 'estate-planning'],
    averageCompletionTime: 32,
    completionRate: 0.65,
    userRating: 4.9
  },

  // Icônes spécifiques
  icons: {
    main: FaCalculator,
    steps: [FaFileAlt, FaChartBar]
  },
  
  // Couleurs thématiques
  colors: {
    primary: '#6B5B95',
    secondary: '#8B7BB8',
    accent: '#FF6F61'
  },

  // Contenu localisé structuré
  content: {
    en: {
      title: 'Tax Optimization Strategies',
      description: 'Legal ways to reduce your tax burden',
      longDescription: 'Learn to understand tax brackets, maximize deductions and credits, use tax-advantaged accounts effectively, and implement strategies to legally minimize your tax liability.',
      objectives: [
        'Understand tax brackets',
        'Learn about deductions vs credits',
        'Maximize retirement contributions',
        'Use tax-advantaged accounts',
        'Plan for capital gains'
      ],
      prerequisites: ['Income source', 'Basic investing knowledge'],
      whatYouWillLearn: [
        'Tax bracket optimization',
        'Deduction vs credit strategies',
        'Retirement account tax benefits',
        'Tax-advantaged account usage',
        'Capital gains planning'
      ],
      realWorldApplication: 'Apply tax optimization strategies to legally reduce your tax burden and keep more of your hard-earned money.'
    },
    fr: {
      title: 'Stratégies d\'Optimisation Fiscale',
      description: 'Moyens légaux de réduire votre charge fiscale',
      longDescription: 'Apprenez à comprendre les tranches d\'imposition, maximiser les déductions et crédits, utiliser efficacement les comptes avantageux fiscalement, et implémenter des stratégies pour légalement minimiser votre responsabilité fiscale.',
      objectives: [
        'Comprendre les tranches d\'imposition',
        'Apprendre déductions vs crédits',
        'Maximiser contributions retraite',
        'Utiliser comptes avantageux fiscalement',
        'Planifier les plus-values'
      ],
      prerequisites: ['Source de revenu', 'Connaissance investissement basique'],
      whatYouWillLearn: [
        'Optimisation des tranches d\'imposition',
        'Stratégies déduction vs crédit',
        'Avantages fiscaux comptes retraite',
        'Utilisation comptes avantageux fiscalement',
        'Planification plus-values'
      ],
      realWorldApplication: 'Appliquez les stratégies d\'optimisation fiscale pour légalement réduire votre charge fiscale et garder plus de votre argent durement gagné.'
    }
  },

  // Rewards enrichis
  rewards: {
    badge: {
      id: 'tax_strategist',
      name: { en: 'Tax Strategist', fr: 'Stratège Fiscal' },
      description: { 
        en: 'Mastered tax optimization and legal tax reduction strategies',
        fr: 'Maîtrisé l\'optimisation fiscale et les stratégies légales de réduction d\'impôts'
      },
      rarity: 'legendary',
      imageUrl: '/badges/tax-strategist.png'
    },
    unlocks: ['business-taxes', 'estate-planning'],
    bonusXP: {
      firstTime: 100,
      speedBonus: 50,
      perfectScore: 60
    }
  },

  // Steps avec ACTION CHALLENGE
  steps: [
    {
      type: 'info',
      title_en: 'Tax Basics',
      title_fr: 'Bases Fiscales',
      content_en: 'Understanding taxes helps you keep more of what you earn through legal optimization.',
      content_fr: 'Comprendre les impôts vous aide à garder plus de ce que vous gagnez par optimisation légale.',
      funFact_en: 'The average person spends 30+ hours on taxes but only 2 hours learning to save on them!',
      funFact_fr: 'La personne moyenne passe 30+ heures sur les impôts mais seulement 2 heures à apprendre à économiser !'
    },
    {
      type: 'multiple_choice',
      question_en: 'Which reduces your taxes more: a $1,000 deduction or $1,000 credit?',
      question_fr: 'Qu\'est-ce qui réduit plus vos impôts : déduction 1000€ ou crédit 1000€ ?',
      options_en: [
        'Deduction (reduces taxable income)',
        'Credit (reduces tax owed)',
        'They\'re the same',
        'Depends on income'
      ],
      options_fr: [
        'Déduction (réduit revenu imposable)',
        'Crédit (réduit impôt dû)',
        'C\'est pareil',
        'Dépend du revenu'
      ],
      correct: 1,
      explanation_en: 'Credits reduce taxes dollar-for-dollar, while deductions only reduce taxable income.',
      explanation_fr: 'Les crédits réduisent les impôts euro pour euro, les déductions réduisent seulement le revenu imposable.',
      hint_en: 'One directly reduces what you owe...',
      hint_fr: 'L\'un réduit directement ce que vous devez...',
      difficulty: 'hard',
      points: 25
    },
    {
      type: 'multiple_choice',
      question_en: 'Which retirement account offers immediate tax deductions?',
      question_fr: 'Quel compte retraite offre des déductions fiscales immédiates ?',
      options_en: ['Roth IRA', 'Traditional IRA', 'Taxable account', 'Savings account'],
      options_fr: ['Roth IRA', 'IRA traditionnel', 'Compte imposable', 'Compte épargne'],
      correct: 1,
      explanation_en: 'Traditional IRA contributions are tax-deductible in the year you make them.',
      explanation_fr: 'Les contributions IRA traditionnelles sont déductibles d\'impôt l\'année où vous les faites.',
      hint_en: 'Think about when you get the tax benefit...',
      hint_fr: 'Pensez à quand vous obtenez l\'avantage fiscal...',
      difficulty: 'medium',
      points: 20
    },
    {
      type: 'multiple_choice', 
      question_en: 'What is tax-loss harvesting?',
      question_fr: 'Qu\'est-ce que la récolte de pertes fiscales ?',
      options_en: ['Selling winners', 'Selling losers to offset gains', 'Avoiding taxes', 'Hiding income'],
      options_fr: ['Vendre les gagnants', 'Vendre les perdants pour compenser gains', 'Éviter les impôts', 'Cacher les revenus'],
      correct: 1,
      explanation_en: 'Tax-loss harvesting involves selling losing investments to offset capital gains.',
      explanation_fr: 'La récolte de pertes fiscales implique de vendre des investissements perdants pour compenser les gains en capital.',
      hint_en: 'Think about using losses strategically...',
      hint_fr: 'Pensez à utiliser les pertes stratégiquement...',
      difficulty: 'advanced',
      points: 25
    },
    {
      type: 'multiple_choice',
      question_en: 'When is the deadline for IRA contributions for the previous tax year?',
      question_fr: 'Quelle est la date limite pour les contributions IRA de l\'année fiscale précédente ?',
      options_en: ['December 31', 'April 15', 'June 30', 'October 15'],
      options_fr: ['31 décembre', '15 avril', '30 juin', '15 octobre'],
      correct: 1,
      explanation_en: 'You have until April 15 (tax deadline) to make IRA contributions for the previous year.',
      explanation_fr: 'Vous avez jusqu\'au 15 avril (date limite des impôts) pour faire des contributions IRA pour l\'année précédente.',
      hint_en: 'Same as when taxes are due...',
      hint_fr: 'Même date que l\'échéance des impôts...',
      difficulty: 'easy',
      points: 15
    },
    {
      type: 'checklist',
      title_en: 'Tax-Saving Checklist',
      title_fr: 'Checklist Économies Fiscales',
      items_en: [
        'Max out 401(k)/IRA contributions',
        'Use HSA for medical expenses',
        'Track charitable donations',
        'Harvest investment losses',
        'Time income and deductions'
      ],
      items_fr: [
        'Maximiser contributions retraite',
        'Utiliser HSA pour dépenses médicales',
        'Suivre dons charitables',
        'Récolter pertes d\'investissement',
        'Timer revenus et déductions'
      ],
      explanation_en: 'These strategies can save thousands in taxes legally every year.',
      explanation_fr: 'Ces stratégies peuvent économiser des milliers en impôts légalement chaque année.'
    },
    {
      id: 'action-challenge',
      type: 'action',
      duration: 30,
      content: {
        en: {
          title: '💰 Tax Optimization Action Challenge',
          subtitle: 'Optimize your tax strategy!',
          description: 'Take real actions to implement tax optimization strategies and reduce your tax burden',
          timeLimit: 120, // hours
          actions: [
            {
              id: 'tax_action_1',
              title: '📱 Quick Win: Review last year\'s tax return',
              description: 'Analyze your previous tax return to identify missed deductions or credits',
              difficulty: 'easy',
              xp: 100,
              timeEstimate: '20 min',
              tips: [
                'Look for missed charitable donations',
                'Check for unreported business expenses',
                'Review education credits'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Show identified missed deductions/credits'
            },
            {
              id: 'tax_action_2',
              title: '💰 Maximize retirement contributions',
              description: 'Increase your 401(k) or IRA contributions to reduce taxable income',
              difficulty: 'medium',
              xp: 200,
              timeEstimate: '30 min',
              verificationMethod: 'self_report',
              reflection: 'How much will this save you in taxes this year?'
            },
            {
              id: 'tax_action_3',
              title: '🏆 Boss Mode: Create a tax optimization plan',
              description: 'Develop a comprehensive tax strategy for the current year',
              difficulty: 'hard',
              xp: 400,
              timeEstimate: '90-120 min',
              tools: ['Tax software', 'Financial records'],
              bonus: 'Share your tax savings calculation for 100 bonus XP!'
            }
          ]
        },
        fr: {
          title: '💰 Défi Action Optimisation Fiscale',
          subtitle: 'Optimisez votre stratégie fiscale !',
          description: 'Prenez des actions réelles pour implémenter des stratégies d\'optimisation fiscale et réduire votre charge fiscale',
          timeLimit: 120, // heures
          actions: [
            {
              id: 'tax_action_1',
              title: '📱 Victoire Rapide : Examinez votre déclaration de l\'année dernière',
              description: 'Analysez votre déclaration fiscale précédente pour identifier les déductions ou crédits manqués',
              difficulty: 'easy',
              xp: 100,
              timeEstimate: '20 min',
              tips: [
                'Cherchez les dons charitables manqués',
                'Vérifiez les dépenses business non déclarées',
                'Examinez les crédits d\'éducation'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Montrer les déductions/crédits manqués identifiés'
            },
            {
              id: 'tax_action_2',
              title: '💰 Maximisez les contributions retraite',
              description: 'Augmentez vos contributions 401(k) ou IRA pour réduire le revenu imposable',
              difficulty: 'medium',
              xp: 200,
              timeEstimate: '30 min',
              verificationMethod: 'self_report',
              reflection: 'Combien cela vous économisera-t-il en impôts cette année ?'
            },
            {
              id: 'tax_action_3',
              title: '🏆 Mode Boss : Créez un plan d\'optimisation fiscale',
              description: 'Développez une stratégie fiscale complète pour l\'année en cours',
              difficulty: 'hard',
              xp: 400,
              timeEstimate: '90-120 min',
              tools: ['Logiciel fiscal', 'Registres financiers'],
              bonus: 'Partagez votre calcul d\'économies fiscales pour 100 XP bonus !'
            }
          ]
        }
      }
    }
  ],

  // Analytics et métriques
  analytics: {
    trackingEvents: ['quest_started', 'step_completed', 'action_completed'],
    kpis: {
      targetCompletionRate: 0.65,
      targetSatisfaction: 4.9
    }
  }
};

// Helper function spécifique à cette quête
export const getTaxOptimizationHelpers = () => ({
  calculateTaxSavings: (deduction, taxRate) => {
    return deduction * (taxRate / 100);
  },
  getNextStep: (currentStep) => {
    // Logique spécifique
  }
}); 