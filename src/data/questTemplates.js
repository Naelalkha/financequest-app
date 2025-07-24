// Quest templates with full bilingual support (EN/FR)
export const questTemplates = [
  // BUDGETING CATEGORY
  {
    id: 'budget-basics',
    category: 'budgeting',
    difficulty: 'beginner',
    duration: 15,
    points: 100,
    xp: 50,
    isPremium: false,
    order: 1,
    
    title_en: 'Budget Basics: Your First Financial Plan',
    title_fr: 'Bases du Budget : Votre Premier Plan Financier',
    
    description_en: 'Learn the fundamentals of budgeting and create your first monthly budget plan using the 50/30/20 rule.',
    description_fr: 'Apprenez les fondamentaux du budget et créez votre premier plan budgétaire mensuel avec la règle 50/30/20.',
    
    objectives_en: [
      'Understand what a budget is and why it matters',
      'Learn the 50/30/20 budgeting rule',
      'Create your first monthly budget',
      'Identify areas to reduce expenses'
    ],
    objectives_fr: [
      'Comprendre ce qu\'est un budget et son importance',
      'Apprendre la règle budgétaire 50/30/20',
      'Créer votre premier budget mensuel',
      'Identifier les domaines pour réduire les dépenses'
    ],
    
    prerequisites_en: 'None - perfect for beginners!',
    prerequisites_fr: 'Aucun - parfait pour les débutants !',
    
    rewards: {
      badge: 'budget_starter',
      unlocks: ['expense-tracking', 'saving-goals']
    },
    
    steps: [
      {
        id: 'intro',
        type: 'info',
        title_en: 'Welcome to Budgeting!',
        title_fr: 'Bienvenue dans le Budget !',
        content_en: 'A budget is simply a plan for your money. It helps you understand where your money comes from and where it goes. Think of it as a roadmap for your financial journey!',
        content_fr: 'Un budget est simplement un plan pour votre argent. Il vous aide à comprendre d\'où vient votre argent et où il va. Considérez-le comme une feuille de route pour votre parcours financier !',
        media: {
          type: 'image',
          url: '/assets/budget-intro.png'
        }
      },
      {
        id: 'quiz1',
        type: 'quiz',
        title_en: 'Understanding Budgets',
        title_fr: 'Comprendre les Budgets',
        question_en: 'What is the main purpose of a budget?',
        question_fr: 'Quel est le but principal d\'un budget ?',
        options: [
          {
            en: 'To restrict your spending completely',
            fr: 'Pour restreindre complètement vos dépenses'
          },
          {
            en: 'To plan and track income and expenses',
            fr: 'Pour planifier et suivre les revenus et dépenses'
          },
          {
            en: 'To make you feel bad about spending',
            fr: 'Pour vous faire sentir mal de dépenser'
          },
          {
            en: 'To impress others with your finances',
            fr: 'Pour impressionner les autres avec vos finances'
          }
        ],
        correctAnswer: 1,
        explanation_en: 'A budget helps you plan and track your money, giving you control over your finances rather than restricting you.',
        explanation_fr: 'Un budget vous aide à planifier et suivre votre argent, vous donnant le contrôle sur vos finances plutôt que de vous restreindre.',
        points: 10
      },
      {
        id: 'rule503020',
        type: 'info',
        title_en: 'The 50/30/20 Rule',
        title_fr: 'La Règle 50/30/20',
        content_en: `This simple rule divides your after-tax income into three categories:
        
• **50% for Needs**: Essential expenses like rent, utilities, groceries
• **30% for Wants**: Entertainment, dining out, hobbies
• **20% for Savings & Debt**: Emergency fund, debt payments, investments

Example: If you earn $3,000/month after taxes:
- $1,500 for needs
- $900 for wants  
- $600 for savings & debt`,
        content_fr: `Cette règle simple divise vos revenus après impôts en trois catégories :
        
• **50% pour les Besoins** : Dépenses essentielles comme loyer, services, alimentation
• **30% pour les Envies** : Divertissement, restaurants, loisirs
• **20% pour l'Épargne & Dettes** : Fonds d'urgence, remboursements, investissements

Exemple : Si vous gagnez 3 000€/mois après impôts :
- 1 500€ pour les besoins
- 900€ pour les envies
- 600€ pour l'épargne & dettes`,
        interactive: true
      },
      {
        id: 'calculator',
        type: 'interactive',
        title_en: 'Calculate Your 50/30/20 Budget',
        title_fr: 'Calculez Votre Budget 50/30/20',
        component: 'BudgetCalculator',
        instruction_en: 'Enter your monthly after-tax income to see your budget breakdown:',
        instruction_fr: 'Entrez vos revenus mensuels après impôts pour voir votre répartition budgétaire :',
        validation: {
          type: 'calculation',
          minValue: 0,
          maxValue: 100000
        }
      },
      {
        id: 'checklist',
        type: 'checklist',
        title_en: 'Budget Preparation Checklist',
        title_fr: 'Liste de Préparation du Budget',
        instruction_en: 'Complete these steps to prepare your budget:',
        instruction_fr: 'Complétez ces étapes pour préparer votre budget :',
        tasks: [
          {
            id: 'gather_statements',
            en: 'Gather last 3 months of bank statements',
            fr: 'Rassembler les 3 derniers relevés bancaires',
            tips_en: 'You can usually download these from your bank\'s website',
            tips_fr: 'Vous pouvez généralement les télécharger depuis le site de votre banque'
          },
          {
            id: 'list_income',
            en: 'List all sources of income',
            fr: 'Lister toutes les sources de revenus',
            tips_en: 'Include salary, freelance work, investments, etc.',
            tips_fr: 'Incluez salaire, travail indépendant, investissements, etc.'
          },
          {
            id: 'identify_fixed',
            en: 'Identify fixed expenses (rent, insurance, etc.)',
            fr: 'Identifier les dépenses fixes (loyer, assurance, etc.)',
            tips_en: 'These are expenses that stay the same each month',
            tips_fr: 'Ce sont les dépenses qui restent identiques chaque mois'
          },
          {
            id: 'track_variable',
            en: 'Track variable expenses (food, entertainment)',
            fr: 'Suivre les dépenses variables (nourriture, divertissement)',
            tips_en: 'These expenses change from month to month',
            tips_fr: 'Ces dépenses changent d\'un mois à l\'autre'
          },
          {
            id: 'calculate_totals',
            en: 'Calculate total income and expenses',
            fr: 'Calculer le total des revenus et dépenses',
            tips_en: 'This will show if you have a surplus or deficit',
            tips_fr: 'Cela montrera si vous avez un surplus ou un déficit'
          }
        ],
        points: 20
      },
      {
        id: 'challenge',
        type: 'challenge',
        title_en: 'Create Your First Budget',
        title_fr: 'Créez Votre Premier Budget',
        description_en: 'Using what you\'ve learned, create a simple budget for next month.',
        description_fr: 'En utilisant ce que vous avez appris, créez un budget simple pour le mois prochain.',
        tasks_en: [
          'Calculate your expected income',
          'List all your expected expenses',
          'Categorize them into needs/wants/savings',
          'Apply the 50/30/20 rule',
          'Identify one area where you can reduce spending'
        ],
        tasks_fr: [
          'Calculez vos revenus prévus',
          'Listez toutes vos dépenses prévues',
          'Catégorisez-les en besoins/envies/épargne',
          'Appliquez la règle 50/30/20',
          'Identifiez un domaine où réduire les dépenses'
        ],
        submission_type: 'self_check',
        points: 30
      },
      {
        id: 'quiz2',
        type: 'quiz',
        title_en: 'Budget Check',
        title_fr: 'Vérification Budget',
        question_en: 'If your monthly income is $4,000, how much should go to savings according to the 50/30/20 rule?',
        question_fr: 'Si vos revenus mensuels sont de 4 000€, combien devrait aller à l\'épargne selon la règle 50/30/20 ?',
        options: [
          { en: '$400', fr: '400€' },
          { en: '$800', fr: '800€' },
          { en: '$1,200', fr: '1 200€' },
          { en: '$2,000', fr: '2 000€' }
        ],
        correctAnswer: 1,
        explanation_en: '20% of $4,000 is $800, which should go towards savings and debt payments.',
        explanation_fr: '20% de 4 000€ est 800€, qui devrait aller vers l\'épargne et le remboursement des dettes.',
        points: 10
      },
      {
        id: 'reflection',
        type: 'reflection',
        title_en: 'Budget Reflection',
        title_fr: 'Réflexion sur le Budget',
        prompt_en: 'What surprised you most about your spending patterns? How do you feel about making changes to your budget?',
        prompt_fr: 'Qu\'est-ce qui vous a le plus surpris dans vos habitudes de dépenses ? Comment vous sentez-vous à l\'idée de modifier votre budget ?',
        minLength: 50,
        points: 10
      }
    ]
  },

  // SAVING CATEGORY
  {
    id: 'emergency-fund-101',
    category: 'saving',
    difficulty: 'beginner',
    duration: 20,
    points: 150,
    xp: 75,
    isPremium: false,
    order: 2,
    
    title_en: 'Emergency Fund 101: Your Financial Safety Net',
    title_fr: 'Fonds d\'Urgence 101 : Votre Filet de Sécurité Financier',
    
    description_en: 'Learn why emergency funds are crucial and how to build yours step by step.',
    description_fr: 'Apprenez pourquoi les fonds d\'urgence sont cruciaux et comment construire le vôtre étape par étape.',
    
    objectives_en: [
      'Understand the purpose of emergency funds',
      'Calculate your emergency fund goal',
      'Create a savings strategy',
      'Learn where to keep your emergency fund'
    ],
    objectives_fr: [
      'Comprendre le but des fonds d\'urgence',
      'Calculer votre objectif de fonds d\'urgence',
      'Créer une stratégie d\'épargne',
      'Apprendre où garder votre fonds d\'urgence'
    ],
    
    prerequisites_en: 'Basic understanding of budgeting',
    prerequisites_fr: 'Compréhension de base du budget',
    
    rewards: {
      badge: 'safety_net',
      unlocks: ['investing-basics', 'high-yield-savings']
    },
    
    steps: [
      {
        id: 'why_emergency',
        type: 'info',
        title_en: 'Why You Need an Emergency Fund',
        title_fr: 'Pourquoi Vous Avez Besoin d\'un Fonds d\'Urgence',
        content_en: `Life is unpredictable. An emergency fund protects you from:

• **Job loss** - Cover expenses while finding new work
• **Medical emergencies** - Handle unexpected health costs
• **Car repairs** - Fix your vehicle without stress
• **Home repairs** - Handle urgent maintenance
• **Family emergencies** - Travel or help loved ones

Without an emergency fund, you might resort to credit cards or loans, creating debt.`,
        content_fr: `La vie est imprévisible. Un fonds d'urgence vous protège contre :

• **Perte d'emploi** - Couvrir les dépenses en cherchant un nouveau travail
• **Urgences médicales** - Gérer les coûts de santé imprévus
• **Réparations auto** - Réparer votre véhicule sans stress
• **Réparations maison** - Gérer l'entretien urgent
• **Urgences familiales** - Voyager ou aider vos proches

Sans fonds d'urgence, vous pourriez recourir aux cartes de crédit ou prêts, créant des dettes.`
      },
      {
        id: 'quiz_amount',
        type: 'quiz',
        title_en: 'Emergency Fund Size',
        title_fr: 'Taille du Fonds d\'Urgence',
        question_en: 'How many months of expenses should a basic emergency fund cover?',
        question_fr: 'Combien de mois de dépenses un fonds d\'urgence de base devrait-il couvrir ?',
        options: [
          { en: '1-2 months', fr: '1-2 mois' },
          { en: '3-6 months', fr: '3-6 mois' },
          { en: '12 months', fr: '12 mois' },
          { en: 'As much as possible', fr: 'Autant que possible' }
        ],
        correctAnswer: 1,
        explanation_en: 'Most experts recommend 3-6 months of expenses. Start with 3 months as your initial goal.',
        explanation_fr: 'La plupart des experts recommandent 3-6 mois de dépenses. Commencez avec 3 mois comme objectif initial.',
        points: 15
      },
      {
        id: 'calculate_goal',
        type: 'interactive',
        title_en: 'Calculate Your Emergency Fund Goal',
        title_fr: 'Calculez Votre Objectif de Fonds d\'Urgence',
        component: 'EmergencyCalculator',
        instruction_en: 'List your essential monthly expenses to calculate your emergency fund target:',
        instruction_fr: 'Listez vos dépenses mensuelles essentielles pour calculer votre objectif de fonds d\'urgence :',
        fields: [
          { id: 'housing', label_en: 'Housing (rent/mortgage)', label_fr: 'Logement (loyer/hypothèque)' },
          { id: 'utilities', label_en: 'Utilities', label_fr: 'Services publics' },
          { id: 'food', label_en: 'Groceries', label_fr: 'Alimentation' },
          { id: 'transport', label_en: 'Transportation', label_fr: 'Transport' },
          { id: 'insurance', label_en: 'Insurance', label_fr: 'Assurance' },
          { id: 'debt', label_en: 'Minimum debt payments', label_fr: 'Paiements minimums de dettes' }
        ],
        points: 25
      },
      {
        id: 'savings_strategies',
        type: 'choice',
        title_en: 'Choose Your Savings Strategy',
        title_fr: 'Choisissez Votre Stratégie d\'Épargne',
        question_en: 'Which savings approach works best for your situation?',
        question_fr: 'Quelle approche d\'épargne convient le mieux à votre situation ?',
        options: [
          {
            id: 'aggressive',
            title_en: 'Sprint Saver',
            title_fr: 'Épargnant Sprint',
            description_en: 'Save 20-30% of income, reach goal in 6-12 months',
            description_fr: 'Épargner 20-30% des revenus, atteindre l\'objectif en 6-12 mois',
            pros_en: ['Reach goal quickly', 'Build momentum fast'],
            pros_fr: ['Atteindre l\'objectif rapidement', 'Créer un élan rapide'],
            cons_en: ['Requires sacrifices', 'May not be sustainable'],
            cons_fr: ['Nécessite des sacrifices', 'Peut ne pas être durable']
          },
          {
            id: 'moderate',
            title_en: 'Steady Builder',
            title_fr: 'Constructeur Régulier',
            description_en: 'Save 10-15% of income, reach goal in 1-2 years',
            description_fr: 'Épargner 10-15% des revenus, atteindre l\'objectif en 1-2 ans',
            pros_en: ['Balanced approach', 'Sustainable long-term'],
            pros_fr: ['Approche équilibrée', 'Durable à long terme'],
            cons_en: ['Takes more time', 'Requires patience'],
            cons_fr: ['Prend plus de temps', 'Nécessite de la patience']
          },
          {
            id: 'gradual',
            title_en: 'Slow & Steady',
            title_fr: 'Lent et Régulier',
            description_en: 'Save 5-10% of income, reach goal in 2-3 years',
            description_fr: 'Épargner 5-10% des revenus, atteindre l\'objectif en 2-3 ans',
            pros_en: ['Minimal lifestyle impact', 'Very sustainable'],
            pros_fr: ['Impact minimal sur le style de vie', 'Très durable'],
            cons_en: ['Slow progress', 'Risk of losing motivation'],
            cons_fr: ['Progrès lent', 'Risque de perdre la motivation']
          }
        ],
        points: 20
      },
      {
        id: 'where_to_save',
        type: 'info',
        title_en: 'Where to Keep Your Emergency Fund',
        title_fr: 'Où Garder Votre Fonds d\'Urgence',
        content_en: `Your emergency fund needs to be:
        
✅ **Liquid** - Accessible within 1-2 days
✅ **Safe** - Protected from market volatility
✅ **Separate** - Not mixed with daily spending

Best options:
• **High-yield savings account** - 2-4% interest, FDIC insured
• **Money market account** - Similar to savings, may have debit card
• **Short-term CDs** - Higher interest, but less liquid

Avoid: Stocks, long-term investments, or your checking account!`,
        content_fr: `Votre fonds d'urgence doit être :
        
✅ **Liquide** - Accessible en 1-2 jours
✅ **Sûr** - Protégé de la volatilité du marché
✅ **Séparé** - Non mélangé aux dépenses quotidiennes

Meilleures options :
• **Compte épargne à haut rendement** - 2-4% d'intérêt, assuré
• **Compte marché monétaire** - Similaire à l'épargne, peut avoir carte débit
• **CDs court terme** - Intérêt plus élevé, mais moins liquide

À éviter : Actions, investissements long terme, ou votre compte courant !`
      },
      {
        id: 'action_plan',
        type: 'checklist',
        title_en: 'Your Emergency Fund Action Plan',
        title_fr: 'Votre Plan d\'Action Fonds d\'Urgence',
        tasks: [
          {
            id: 'set_goal',
            en: 'Set your emergency fund target amount',
            fr: 'Définir votre montant cible de fonds d\'urgence'
          },
          {
            id: 'open_account',
            en: 'Open a dedicated high-yield savings account',
            fr: 'Ouvrir un compte épargne dédié à haut rendement'
          },
          {
            id: 'automate',
            en: 'Set up automatic monthly transfers',
            fr: 'Configurer des virements mensuels automatiques'
          },
          {
            id: 'start_small',
            en: 'Start with $500 as mini-emergency fund',
            fr: 'Commencer avec 500€ comme mini-fonds d\'urgence'
          },
          {
            id: 'increase',
            en: 'Increase savings rate as income grows',
            fr: 'Augmenter le taux d\'épargne avec la croissance des revenus'
          }
        ],
        points: 30
      }
    ]
  },

  // INVESTING CATEGORY (Premium)
  {
    id: 'investing-basics',
    category: 'investing',
    difficulty: 'intermediate',
    duration: 30,
    points: 200,
    xp: 100,
    isPremium: true,
    order: 5,
    
    title_en: 'Investing 101: Start Building Wealth',
    title_fr: 'Investissement 101 : Commencez à Construire la Richesse',
    
    description_en: 'Master the fundamentals of investing and start your journey to financial independence.',
    description_fr: 'Maîtrisez les fondamentaux de l\'investissement et commencez votre voyage vers l\'indépendance financière.',
    
    objectives_en: [
      'Understand stocks, bonds, and mutual funds',
      'Learn about risk and diversification',
      'Explore index fund investing',
      'Create your first investment strategy'
    ],
    objectives_fr: [
      'Comprendre actions, obligations et fonds mutuels',
      'Apprendre sur le risque et la diversification',
      'Explorer l\'investissement en fonds indiciels',
      'Créer votre première stratégie d\'investissement'
    ],
    
    prerequisites_en: 'Emergency fund established, basic budget in place',
    prerequisites_fr: 'Fonds d\'urgence établi, budget de base en place',
    
    rewards: {
      badge: 'investor',
      certificate: true,
      unlocks: ['retirement-planning', 'tax-optimization']
    },
    
    steps: [
      // Premium content structure similar to above
      {
        id: 'investing_intro',
        type: 'info',
        title_en: 'Welcome to Investing',
        title_fr: 'Bienvenue dans l\'Investissement',
        content_en: 'Investing is putting your money to work to potentially earn more money over time...',
        content_fr: 'Investir c\'est mettre votre argent au travail pour potentiellement gagner plus d\'argent avec le temps...'
      }
      // ... more steps
    ]
  },

  // DEBT MANAGEMENT
  {
    id: 'debt-avalanche',
    category: 'debt',
    difficulty: 'intermediate',
    duration: 25,
    points: 175,
    xp: 85,
    isPremium: false,
    order: 3,
    
    title_en: 'Debt Avalanche: Crush Your Debt Fast',
    title_fr: 'Avalanche de Dettes : Écrasez Vos Dettes Rapidement',
    
    description_en: 'Learn the mathematically optimal way to pay off multiple debts and save money on interest.',
    description_fr: 'Apprenez la méthode mathématiquement optimale pour rembourser plusieurs dettes et économiser sur les intérêts.',
    
    objectives_en: [
      'Understand good debt vs bad debt',
      'Master the debt avalanche method',
      'Calculate your debt-free date',
      'Create an aggressive payoff plan'
    ],
    objectives_fr: [
      'Comprendre bonne dette vs mauvaise dette',
      'Maîtriser la méthode avalanche',
      'Calculer votre date sans dette',
      'Créer un plan de remboursement agressif'
    ],
    
    steps: [
      // Debt management steps...
    ]
  }
];

// Helper functions for quest management

/**
 * Get quest by ID with language support
 */
export const getQuestById = (questId, lang = 'en') => {
  const quest = questTemplates.find(q => q.id === questId);
  if (!quest) return null;
  
  return localizeQuest(quest, lang);
};

/**
 * Get quests by category
 */
export const getQuestsByCategory = (category, lang = 'en') => {
  return questTemplates
    .filter(quest => quest.category === category)
    .map(quest => localizeQuest(quest, lang))
    .sort((a, b) => a.order - b.order);
};

/**
 * Get free quests only
 */
export const getFreeQuests = (lang = 'en') => {
  return questTemplates
    .filter(quest => !quest.isPremium)
    .map(quest => localizeQuest(quest, lang));
};

/**
 * Get premium quests only
 */
export const getPremiumQuests = (lang = 'en') => {
  return questTemplates
    .filter(quest => quest.isPremium)
    .map(quest => localizeQuest(quest, lang));
};

/**
 * Get recommended quests based on user progress
 */
export const getRecommendedQuests = (completedQuestIds, userLevel, lang = 'en') => {
  const difficultyMap = {
    'Novice': 'beginner',
    'Apprentice': 'beginner',
    'Explorer': 'intermediate',
    'Adventurer': 'intermediate',
    'Expert': 'advanced',
    'Master': 'expert',
    'Legend': 'expert'
  };
  
  const userDifficulty = difficultyMap[userLevel] || 'beginner';
  
  return questTemplates
    .filter(quest => 
      !completedQuestIds.includes(quest.id) &&
      (quest.difficulty === userDifficulty || 
       quest.difficulty === 'beginner') // Always show beginner quests
    )
    .map(quest => localizeQuest(quest, lang))
    .slice(0, 3); // Return top 3 recommendations
};

/**
 * Localize quest object based on language
 */
const localizeQuest = (quest, lang) => {
  const localizedQuest = {
    ...quest,
    title: quest[`title_${lang}`] || quest.title_en,
    description: quest[`description_${lang}`] || quest.description_en,
    objectives: quest[`objectives_${lang}`] || quest.objectives_en,
    prerequisites: quest[`prerequisites_${lang}`] || quest.prerequisites_en,
    steps: quest.steps.map(step => ({
      ...step,
      title: step[`title_${lang}`] || step.title_en || step.title,
      content: step[`content_${lang}`] || step.content_en || step.content,
      question: step[`question_${lang}`] || step.question_en || step.question,
      instruction: step[`instruction_${lang}`] || step.instruction_en || step.instruction,
      description: step[`description_${lang}`] || step.description_en || step.description,
      explanation: step[`explanation_${lang}`] || step.explanation_en || step.explanation,
      tasks: step.tasks?.map(task => {
        if (typeof task === 'object') {
          return {
            ...task,
            text: task[lang] || task.en || task.text,
            tips: task[`tips_${lang}`] || task.tips_en || task.tips
          };
        }
        return task;
      }),
      options: step.options?.map(opt => {
        if (typeof opt === 'object' && opt[lang]) {
          return opt[lang];
        }
        return opt.en || opt;
      })
    }))
  };
  
  // Remove language-specific fields to clean up the object
  Object.keys(localizedQuest).forEach(key => {
    if (key.includes('_en') || key.includes('_fr')) {
      delete localizedQuest[key];
    }
  });
  
  return localizedQuest;
};

/**
 * Get quest statistics
 */
export const getQuestStats = () => {
  const total = questTemplates.length;
  const free = questTemplates.filter(q => !q.isPremium).length;
  const premium = questTemplates.filter(q => q.isPremium).length;
  
  const byCategory = questTemplates.reduce((acc, quest) => {
    acc[quest.category] = (acc[quest.category] || 0) + 1;
    return acc;
  }, {});
  
  const byDifficulty = questTemplates.reduce((acc, quest) => {
    acc[quest.difficulty] = (acc[quest.difficulty] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total,
    free,
    premium,
    byCategory,
    byDifficulty
  };
};

/**
 * Calculate estimated completion time for multiple quests
 */
export const calculateTotalTime = (questIds) => {
  const totalMinutes = questIds.reduce((total, questId) => {
    const quest = questTemplates.find(q => q.id === questId);
    return total + (quest?.duration || 0);
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes, totalMinutes };
};

/**
 * Export quest data for Firestore seeding
 */
export const exportForFirestore = () => {
  return questTemplates.map(quest => ({
    ...quest,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    active: true
  }));
};