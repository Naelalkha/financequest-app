export const questTemplates = [
  // BUDGETING CATEGORY
  {
    id: 'budget-basics',
    category: 'budgeting',
    difficulty: 'beginner',
    duration: 15,
    xp: 100,
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
        type: 'multiple_choice',
        title_en: 'Understanding Budgets',
        title_fr: 'Comprendre les Budgets',
        question_en: 'What is the main purpose of a budget?',
        question_fr: 'Quel est le but principal d\'un budget ?',
        options_en: [
          'To restrict your spending completely',
          'To plan and track income and expenses',
          'To make you feel bad about spending',
          'To impress others with your finances'
        ],
        options_fr: [
          'Pour restreindre complètement vos dépenses',
          'Pour planifier et suivre les revenus et dépenses',
          'Pour vous faire sentir mal de dépenser',
          'Pour impressionner les autres avec vos finances'
        ],
        correctAnswer: 1,
        explanation_en: 'A budget helps you plan and track your money, giving you control over your finances rather than restricting you.',
        explanation_fr: 'Un budget vous aide à planifier et suivre votre argent, vous donnant le contrôle sur vos finances plutôt que de vous restreindre.',
        hint_en: 'Think about what would be most helpful for managing money',
        hint_fr: 'Pensez à ce qui serait le plus utile pour gérer l\'argent',
        difficulty: 'easy',
        points: 10,
        funFact_en: 'Did you know? People who budget save 20% more on average than those who don\'t!',
        funFact_fr: 'Le saviez-vous ? Les gens qui budgétisent économisent 20% de plus en moyenne que ceux qui ne le font pas !',
        xp: 10
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
        id: 'budget_calculator_challenge',
        type: 'interactive_challenge',
        challengeType: 'budget_calculator',
        title_en: 'Create Your 50/30/20 Budget',
        title_fr: 'Créez Votre Budget 50/30/20',
        instruction_en: 'Use our interactive calculator to create a balanced budget following the 50/30/20 rule',
        instruction_fr: 'Utilisez notre calculateur interactif pour créer un budget équilibré selon la règle 50/30/20',
        description_en: 'Enter your monthly income and allocate it according to the 50/30/20 rule. The calculator will help you balance your budget.',
        description_fr: 'Entrez vos revenus mensuels et répartissez-les selon la règle 50/30/20. Le calculateur vous aidera à équilibrer votre budget.',
        xp: 25
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
        xp: 20
      },
      {
        id: 'quiz2',
        type: 'quiz',
        title_en: 'Budget Check',
        title_fr: 'Vérification Budget',
        question_en: 'If your monthly income is $4,000, how much should go to savings according to the 50/30/20 rule?',
        question_fr: 'Si vos revenus mensuels sont de 4 000€, combien devrait aller à l\'épargne selon la règle 50/30/20 ?',
        correctAnswer: '800',
        acceptedAnswers: ['800', '$800', '800€', '800 €'],
        explanation_en: '20% of $4,000 is $800, which should go towards savings and debt payments.',
        explanation_fr: '20% de 4 000€ est 800€, qui devrait aller vers l\'épargne et le remboursement des dettes.',
        hint_en: 'Calculate 20% of 4,000',
        hint_fr: 'Calculez 20% de 4 000',
        difficulty: 'medium',
        points: 10,
        allowRetry: true,
        xp: 10
      },
      {
        id: 'expense_sorter_challenge',
        type: 'interactive_challenge',
        challengeType: 'expense_sorter',
        title_en: 'Sort Your Expenses',
        title_fr: 'Triez Vos Dépenses',
        instruction_en: 'Practice categorizing expenses into Needs, Wants, and Savings',
        instruction_fr: 'Pratiquez la catégorisation des dépenses en Besoins, Envies et Épargne',
        description_en: 'Drag and drop common expenses into the correct categories according to the 50/30/20 rule.',
        description_fr: 'Glissez et déposez les dépenses courantes dans les bonnes catégories selon la règle 50/30/20.',
        xp: 20
      }
    ]
  },

  // SAVING CATEGORY
  {
    id: 'emergency-fund-101',
    category: 'saving',
    difficulty: 'beginner',
    duration: 20,
    xp: 150,
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
        type: 'multiple_choice',
        title_en: 'Emergency Fund Size',
        title_fr: 'Taille du Fonds d\'Urgence',
        question_en: 'How many months of expenses should a basic emergency fund cover?',
        question_fr: 'Combien de mois de dépenses un fonds d\'urgence de base devrait-il couvrir ?',
        options_en: [
          '1-2 months',
          '3-6 months',
          '12 months',
          'As much as possible'
        ],
        options_fr: [
          '1-2 mois',
          '3-6 mois',
          '12 mois',
          'Autant que possible'
        ],
        correctAnswer: 1,
        explanation_en: 'Most experts recommend 3-6 months of expenses. Start with 3 months as your initial goal.',
        explanation_fr: 'La plupart des experts recommandent 3-6 mois de dépenses. Commencez avec 3 mois comme objectif initial.',
        hint_en: 'Consider what would give you peace of mind in case of job loss',
        hint_fr: 'Considérez ce qui vous donnerait la tranquillité d\'esprit en cas de perte d\'emploi',
        difficulty: 'easy',
        points: 15,
        xp: 15
      },
      {
        id: 'investment_growth_sim',
        type: 'interactive_challenge',
        challengeType: 'investment_simulator',
        title_en: 'See Your Savings Grow',
        title_fr: 'Voyez Vos Économies Croître',
        instruction_en: 'Use our investment simulator to see how your emergency fund can grow over time',
        instruction_fr: 'Utilisez notre simulateur d\'investissement pour voir comment votre fonds d\'urgence peut croître avec le temps',
        description_en: 'Experiment with different monthly contributions and see the power of compound interest.',
        description_fr: 'Expérimentez avec différentes contributions mensuelles et voyez la puissance des intérêts composés.',
        xp: 30
      },
      {
        id: 'savings_strategies',
        type: 'multiple_choice',
        title_en: 'Choose Your Savings Strategy',
        title_fr: 'Choisissez Votre Stratégie d\'Épargne',
        question_en: 'Which savings approach typically leads to the fastest emergency fund growth?',
        question_fr: 'Quelle approche d\'épargne mène généralement à la croissance la plus rapide du fonds d\'urgence ?',
        options_en: [
          'Saving whatever is left at the end of the month',
          'Automatic transfers right after getting paid',
          'Putting money in a jar at home',
          'Waiting for a bonus or tax refund'
        ],
        options_fr: [
          'Épargner ce qui reste à la fin du mois',
          'Virements automatiques juste après avoir été payé',
          'Mettre de l\'argent dans un bocal à la maison',
          'Attendre une prime ou un remboursement d\'impôts'
        ],
        correctAnswer: 1,
        explanation_en: 'Automatic transfers ensure you save consistently before you have a chance to spend the money.',
        explanation_fr: 'Les virements automatiques garantissent que vous épargnez régulièrement avant d\'avoir la chance de dépenser l\'argent.',
        difficulty: 'medium',
        points: 20,
        funFact_en: 'Studies show people who automate their savings save 3x more than those who do it manually!',
        funFact_fr: 'Les études montrent que les gens qui automatisent leur épargne économisent 3x plus que ceux qui le font manuellement !',
        xp: 20
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
    xp: 200,
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
      {
        id: 'investing_intro',
        type: 'info',
        title_en: 'Welcome to Investing',
        title_fr: 'Bienvenue dans l\'Investissement',
        content_en: 'Investing is putting your money to work to potentially earn more money over time. Unlike saving, investing involves some risk but offers the potential for higher returns.',
        content_fr: 'Investir c\'est mettre votre argent au travail pour potentiellement gagner plus d\'argent avec le temps. Contrairement à l\'épargne, investir implique un certain risque mais offre le potentiel de rendements plus élevés.'
      },
      {
        id: 'investment_types_quiz',
        type: 'multiple_choice',
        title_en: 'Types of Investments',
        title_fr: 'Types d\'Investissements',
        question_en: 'Which investment typically has the highest long-term returns but also the most volatility?',
        question_fr: 'Quel investissement a généralement les rendements à long terme les plus élevés mais aussi la plus grande volatilité ?',
        options_en: [
          'Savings account',
          'Bonds',
          'Stocks',
          'CDs'
        ],
        options_fr: [
          'Compte épargne',
          'Obligations',
          'Actions',
          'Certificats de dépôt'
        ],
        correctAnswer: 2,
        explanation_en: 'Stocks historically provide the highest returns over long periods but can fluctuate significantly in the short term.',
        explanation_fr: 'Les actions fournissent historiquement les rendements les plus élevés sur de longues périodes mais peuvent fluctuer significativement à court terme.',
        difficulty: 'intermediate',
        points: 15,
        funFact_en: 'The S&P 500 has averaged about 10% annual returns over the past 90 years!',
        funFact_fr: 'Le S&P 500 a eu un rendement moyen d\'environ 10% par an au cours des 90 dernières années !',
        xp: 15
      },
      {
        id: 'compound_interest_sim',
        type: 'interactive_challenge',
        challengeType: 'investment_simulator',
        title_en: 'The Power of Compound Interest',
        title_fr: 'La Puissance des Intérêts Composés',
        instruction_en: 'See how your investments can grow exponentially over time',
        instruction_fr: 'Voyez comment vos investissements peuvent croître exponentiellement avec le temps',
        description_en: 'Experiment with different investment amounts, returns, and time periods to understand compound growth.',
        description_fr: 'Expérimentez avec différents montants d\'investissement, rendements et périodes pour comprendre la croissance composée.',
        xp: 30
      }
    ]
  },

  // DEBT MANAGEMENT
  {
    id: 'debt-avalanche',
    category: 'debt',
    difficulty: 'intermediate',
    duration: 25,
    xp: 175,
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
      {
        id: 'debt_intro',
        type: 'info',
        title_en: 'Understanding Debt',
        title_fr: 'Comprendre la dette',
        content_en: 'Not all debt is created equal. Good debt helps you build wealth (like a mortgage or student loans), while bad debt drains your finances (like high-interest credit cards). The debt avalanche method focuses on paying off your highest interest rate debts first, saving you the most money over time.',
        content_fr: 'Toutes les dettes ne sont pas égales. Les bonnes dettes vous aident à construire de la richesse (comme une hypothèque ou des prêts étudiants), tandis que les mauvaises dettes drainent vos finances (comme les cartes de crédit à taux élevé). La méthode avalanche se concentre sur le remboursement des dettes au taux d\'intérêt le plus élevé en premier, vous économisant le plus d\'argent au fil du temps.'
      },
      {
        id: 'debt_types_quiz',
        type: 'multiple_choice',
        title_en: 'Good vs Bad Debt',
        title_fr: 'Bonne vs Mauvaise Dette',
        question_en: 'Which of the following is typically considered "good debt"?',
        question_fr: 'Laquelle des suivantes est généralement considérée comme une "bonne dette"?',
        options_en: [
          'Credit card debt for shopping',
          'Student loan for education',
          'Payday loan',
          'Store credit card'
        ],
        options_fr: [
          'Dette de carte de crédit pour les achats',
          'Prêt étudiant pour l\'éducation',
          'Prêt sur salaire',
          'Carte de crédit de magasin'
        ],
        correctAnswer: 1,
        explanation_en: 'Student loans are considered good debt because education is an investment in your future earning potential.',
        explanation_fr: 'Les prêts étudiants sont considérés comme une bonne dette car l\'éducation est un investissement dans votre potentiel de gains futurs.',
        hint_en: 'Think about which option helps you build value over time',
        hint_fr: 'Pensez à quelle option vous aide à construire de la valeur avec le temps',
        difficulty: 'intermediate',
        points: 15,
        xp: 15
      },
      {
        id: 'avalanche_explanation',
        type: 'info',
        title_en: 'The Debt Avalanche Method',
        title_fr: 'La Méthode Avalanche',
        content_en: 'The debt avalanche method prioritizes paying off debts with the highest interest rates first while making minimum payments on all other debts. This approach minimizes the total interest you\'ll pay over time. Here\'s how it works:\n\n1. List all your debts\n2. Order them by interest rate (highest to lowest)\n3. Pay minimums on all debts\n4. Put any extra money toward the highest-rate debt\n5. Once paid off, move to the next highest rate',
        content_fr: 'La méthode avalanche priorise le remboursement des dettes avec les taux d\'intérêt les plus élevés en premier tout en effectuant les paiements minimums sur toutes les autres dettes. Cette approche minimise l\'intérêt total que vous paierez au fil du temps. Voici comment ça fonctionne:\n\n1. Listez toutes vos dettes\n2. Ordonnez-les par taux d\'intérêt (du plus élevé au plus bas)\n3. Payez les minimums sur toutes les dettes\n4. Mettez tout argent supplémentaire vers la dette au taux le plus élevé\n5. Une fois payée, passez au taux suivant'
      },
      {
        id: 'debt_calculator_challenge',
        type: 'interactive_challenge',
        challengeType: 'debt_payoff',
        title_en: 'Calculate Your Debt-Free Date',
        title_fr: 'Calculez Votre Date Sans Dette',
        instruction_en: 'Use our debt avalanche calculator to see when you\'ll be debt-free',
        instruction_fr: 'Utilisez notre calculateur avalanche pour voir quand vous serez sans dette',
        description_en: 'Enter your debts and see how the avalanche method can save you money and time.',
        description_fr: 'Entrez vos dettes et voyez comment la méthode avalanche peut vous économiser argent et temps.',
        xp: 35
      },
      {
        id: 'debt_list_checklist',
        type: 'checklist',
        title_en: 'Create Your Debt List',
        title_fr: 'Créez Votre Liste de Dettes',
        description_en: 'To use the debt avalanche method, you need to gather information about all your debts. Check off each item as you collect it:',
        description_fr: 'Pour utiliser la méthode avalanche, vous devez rassembler des informations sur toutes vos dettes. Cochez chaque élément au fur et à mesure:',
        tasks: [
          {
            en: 'List all credit card balances and interest rates',
            fr: 'Listez tous les soldes et taux d\'intérêt des cartes de crédit'
          },
          {
            en: 'Include all loans (auto, personal, student)',
            fr: 'Incluez tous les prêts (auto, personnel, étudiant)'
          },
          {
            en: 'Note the minimum payment for each debt',
            fr: 'Notez le paiement minimum pour chaque dette'
          },
          {
            en: 'Calculate total monthly minimum payments',
            fr: 'Calculez le total des paiements minimums mensuels'
          },
          {
            en: 'Determine how much extra you can pay monthly',
            fr: 'Déterminez combien vous pouvez payer en extra mensuellement'
          }
        ],
        xp: 20
      },
      {
        id: 'avalanche_quiz',
        type: 'multiple_choice',
        title_en: 'Avalanche Method Quiz',
        title_fr: 'Quiz Méthode Avalanche',
        question_en: 'You have 3 debts: Card A ($1000 @ 22%), Card B ($2000 @ 18%), Loan C ($5000 @ 6%). Using the avalanche method, which should you pay off first?',
        question_fr: 'Vous avez 3 dettes : Carte A (1000$ @ 22%), Carte B (2000$ @ 18%), Prêt C (5000$ @ 6%). Avec la méthode avalanche, laquelle devriez-vous rembourser en premier ?',
        options_en: [
          'Card A (highest interest rate)',
          'Card B (middle balance)',
          'Loan C (largest balance)',
          'Pay them equally'
        ],
        options_fr: [
          'Carte A (taux d\'intérêt le plus élevé)',
          'Carte B (solde moyen)',
          'Prêt C (solde le plus important)',
          'Les payer également'
        ],
        correctAnswer: 0,
        explanation_en: 'The avalanche method prioritizes the highest interest rate (22%), regardless of balance size.',
        explanation_fr: 'La méthode avalanche priorise le taux d\'intérêt le plus élevé (22%), indépendamment de la taille du solde.',
        difficulty: 'intermediate',
        points: 20,
        xp: 20
      }
    ]
  }
];

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
export const localizeQuest = (quest, lang) => {
  const localizedQuest = {
    ...quest,
    title: quest[`title_${lang}`] || quest.title_en,
    description: quest[`description_${lang}`] || quest.description_en,
    objectives: quest[`objectives_${lang}`] || quest.objectives_en,
    prerequisites: quest[`prerequisites_${lang}`] || quest.prerequisites_en,
    steps: quest.steps.map(step => {
      const localizedStep = {
        ...step,
        title: step[`title_${lang}`] || step.title_en || step.title,
        content: step[`content_${lang}`] || step.content_en || step.content,
        question: step[`question_${lang}`] || step.question_en || step.question,
        instruction: step[`instruction_${lang}`] || step.instruction_en || step.instruction,
        description: step[`description_${lang}`] || step.description_en || step.description,
        explanation: step[`explanation_${lang}`] || step.explanation_en || step.explanation,
        hint: step[`hint_${lang}`] || step.hint_en || step.hint,
        funFact: step[`funFact_${lang}`] || step.funFact_en || step.funFact
      };
      
      // Gérer les options selon le type
      if (step.options_en && step.options_fr) {
        // Format séparé pour les langues
        localizedStep.options = step[`options_${lang}`] || step.options_en;
      } else if (step.options && Array.isArray(step.options)) {
        // Format avec objets ou strings
        localizedStep.options = step.options.map(opt => {
          if (typeof opt === 'object' && (opt[lang] || opt.en || opt.fr)) {
            return opt[lang] || opt.en || opt.fr;
          }
          return opt;
        });
      }

      // Gérer les tâches pour les checklists
      if (step.tasks) {
        localizedStep.tasks = step.tasks.map(task => {
          if (typeof task === 'object') {
            return {
              ...task,
              text: task[lang] || task.en || task.fr || task.text,
              tips: task[`tips_${lang}`] || task.tips_en || task.tips
            };
          }
          return task;
        });
      }
      
      return localizedStep;
    })
  };
  
  // Nettoyer l'objet
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