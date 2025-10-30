import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRocket, FaTrophy, FaChartLine, FaShieldAlt, 
  FaStar, FaArrowRight, FaPlay, FaCheck,
  FaWallet, FaPiggyBank, FaCoins, FaFire,
  FaLock, FaCrown, FaBolt, FaGem
} from 'react-icons/fa';
import { 
  HiSparkles, HiLightningBolt 
} from 'react-icons/hi';
import { 
  BsStars, BsLightningChargeFill, BsShieldFillCheck 
} from 'react-icons/bs';
import { 
  GiTwoCoins, GiDiamondTrophy, GiFireGem 
} from 'react-icons/gi';
import { 
  RiVipCrownFill 
} from 'react-icons/ri';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AppBackground from '../app/AppBackground';

// Hero Section Component
const HeroSection = ({ t }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Money Game', 'Finance Skills', 'Wealth Journey'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center">
          {/* Logo animé */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-8"
          >
            <div className="relative w-full h-full neon-element rounded-3xl shadow-glow-md">
              <div className="absolute inset-0 gradient-overlay-gold rounded-3xl" />
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <FaRocket className="text-5xl text-gradient-gold drop-shadow-lg" />
              </motion.div>
            </div>
          </motion.div>

          {/* Badges */}
          <div className="flex justify-center gap-2 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260 }}
              className="badge badge-new shimmer-effect"
            >
              <HiSparkles className="text-[10px]" />
              NEW 2025
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260 }}
              className="badge badge-easy"
            >
              <FaCheck className="text-[10px]" />
              50K+ USERS
            </motion.div>
          </div>

          {/* Headline */}
          <motion.h1 
            className="text-5xl md:text-7xl text-title text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Level Up Your
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="block text-gradient-gold"
              >
                {words[currentWord]}
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto text-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Master personal finance through <span className="text-gradient-gold font-bold">fun, gamified quests</span>. 
            Join thousands already winning with money!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="btn-premium inline-flex items-center justify-center gap-2 px-8 py-4 text-lg group"
              >
                {/* Particles effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full particle-animation"
                      style={{ 
                        left: `${20 + i * 20}%`,
                        bottom: '10%',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <FaPlay className="text-base relative z-10" />
                <span className="relative z-10">Start Free Now</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg group"
              >
                <span>I have an account</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight className="text-base" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="neon-element rounded-2xl p-4 group hover:scale-105 transition-transform">
              <div className="gradient-overlay-gold absolute inset-0 rounded-2xl opacity-10" />
              <div className="relative">
                <motion.div 
                  className="text-2xl font-black text-gradient-gold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  4.9/5
                </motion.div>
                <div className="text-label text-gray-500 mt-1">Rating</div>
              </div>
            </div>
            
            <div className="neon-element rounded-2xl p-4 group hover:scale-105 transition-transform">
              <div className="gradient-overlay-purple absolute inset-0 rounded-2xl opacity-10" />
              <div className="relative">
                <div className="text-2xl font-black text-gradient-purple">50K+</div>
                <div className="text-label text-gray-500 mt-1">Active Users</div>
              </div>
            </div>
            
            <div className="neon-element rounded-2xl p-4 group hover:scale-105 transition-transform">
              <div className="gradient-overlay-emerald absolute inset-0 rounded-2xl opacity-10" />
              <div className="relative">
                <div className="text-2xl font-black text-gradient-emerald">1M+</div>
                <div className="text-label text-gray-500 mt-1">Quests Done</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = ({ t }) => {
  const features = [
    {
      icon: GiDiamondTrophy,
      title: 'Gamified Learning',
      description: 'Earn XP, unlock badges, and level up as you master financial concepts',
      overlayClass: 'gradient-overlay-purple',
      glowClass: 'shadow-glow-purple'
    },
    {
      icon: FaChartLine,
      title: 'Track Progress',
      description: 'Monitor your financial journey with detailed analytics and insights',
      overlayClass: 'gradient-overlay-cyan',
      glowClass: 'shadow-glow-cyan'
    },
    {
      icon: BsShieldFillCheck,
      title: '100% Secure',
      description: 'Your data is encrypted and never shared with third parties',
      overlayClass: 'gradient-overlay-emerald',
      glowClass: 'shadow-glow-green'
    },
    {
      icon: FaBolt,
      title: 'Daily Challenges',
      description: 'Complete daily quests for bonus XP and maintain your streak',
      overlayClass: 'gradient-overlay-gold',
      glowClass: 'shadow-glow-md'
    },
    {
      icon: RiVipCrownFill,
      title: 'Premium Content',
      description: 'Access advanced quests and exclusive financial strategies',
      overlayClass: 'gradient-overlay-purple',
      glowClass: 'shadow-glow-purple'
    },
    {
      icon: GiTwoCoins,
      title: 'Rewards System',
      description: 'Convert your XP into real rewards and discounts',
      overlayClass: 'gradient-overlay-gold',
      glowClass: 'shadow-glow-md'
    }
  ];

  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl text-title text-white mb-4">
            Why Choose <span className="text-gradient-gold">FinanceQuest?</span>
          </h2>
          <p className="text-gray-400 text-lg text-body">
            Everything you need to master your finances in one gamified platform
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="neon-card rounded-2xl p-6 group"
            >
              <div className={`absolute inset-0 ${feature.overlayClass} opacity-5 group-hover:opacity-10 rounded-2xl transition-opacity`} />
              
              <div className="relative">
                <motion.div 
                  className={`w-14 h-14 neon-element rounded-xl flex items-center justify-center mb-4 ${feature.glowClass}`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="text-2xl text-white" />
                </motion.div>
                
                <h3 className="text-lg text-title text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 text-body">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How it Works Section
const HowItWorksSection = ({ t }) => {
  const steps = [
    { 
      step: '1', 
      title: 'Sign Up Free', 
      desc: 'Create your account in seconds',
      icon: FaRocket,
      badgeClass: 'badge-new'
    },
    { 
      step: '2', 
      title: 'Choose Quest', 
      desc: 'Pick from 50+ financial topics',
      icon: FaWallet,
      badgeClass: 'badge-medium'
    },
    { 
      step: '3', 
      title: 'Learn & Earn', 
      desc: 'Complete quests and earn XP',
      icon: GiTwoCoins,
      badgeClass: 'badge-easy'
    },
    { 
      step: '4', 
      title: 'Level Up', 
      desc: 'Track progress and unlock rewards',
      icon: FaTrophy,
      badgeClass: 'badge-premium'
    }
  ];

  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl text-title text-white mb-4">
            Start Your Journey in <span className="text-gradient-cyan">4 Simple Steps</span>
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div 
                className="relative w-20 h-20 mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                <div className={`w-full h-full ${item.badgeClass} rounded-2xl flex items-center justify-center`}>
                  <item.icon className="text-3xl text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 neon-element rounded-full flex items-center justify-center">
                  <span className="text-label text-white">{item.step}</span>
                </div>
              </motion.div>
              <h3 className="text-lg text-title text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm text-body">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = ({ t }) => {
  const testimonials = [
    {
      name: 'Alex M.',
      role: 'Student',
      content: 'Finally, a finance app that makes learning fun! I\'ve saved $500 in my first month.',
      rating: 5,
      avatar: 'A',
      gradientClass: 'text-gradient-purple'
    },
    {
      name: 'Sarah K.',
      role: 'Freelancer',
      content: 'The quests helped me understand investing. My portfolio is up 15%!',
      rating: 5,
      avatar: 'S',
      gradientClass: 'text-gradient-cyan'
    },
    {
      name: 'Mike L.',
      role: 'Parent',
      content: 'Perfect for teaching my kids about money. They love the rewards system!',
      rating: 5,
      avatar: 'M',
      gradientClass: 'text-gradient-emerald'
    }
  ];

  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl text-title text-white mb-4">
            Loved by <span className="text-gradient-purple">50,000+ Users</span>
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="neon-card rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 neon-element rounded-xl flex items-center justify-center text-title text-lg shadow-glow-sm`}>
                  <span className={testimonial.gradientClass}>{testimonial.avatar}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-body">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 text-label">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm animate-pulse-glow" />
                ))}
              </div>
              
              <p className="text-gray-300 text-sm italic text-body">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTASection = ({ t }) => (
  <section className="px-4 py-20 text-center">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="badge badge-premium shimmer-effect"
          >
            <RiVipCrownFill className="text-[10px] text-yellow-300" />
            LIMITED TIME OFFER
          </motion.div>
        </div>

        <h2 className="text-3xl md:text-5xl text-title text-white mb-6">
          Ready to Master Your <span className="text-gradient-gold">Money Game?</span>
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 text-body">
          Join thousands making smarter financial decisions every day
        </p>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <Link
            to="/register"
            className="btn-premium inline-flex items-center justify-center gap-3 px-10 py-5 text-xl shadow-glow-lg group"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100">
              <div className="absolute inset-0 shimmer-effect" />
            </div>
            
            {/* Particles */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white rounded-full particle-animation"
                  style={{ 
                    left: `${15 + i * 15}%`,
                    bottom: '15%',
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
            
            <span className="relative z-10">Start Your Journey</span>
            <FaArrowRight className="relative z-10 text-lg" />
          </Link>
        </motion.div>

        <motion.p 
          className="text-gray-500 text-sm mt-6 text-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ✅ No credit card required • 🎮 Free forever plan • 🚀 Setup in 30 seconds
        </motion.p>
      </motion.div>
    </div>
  </section>
);

// Main Component
const Home = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="min-h-screen">
        <HeroSection t={t} />
        <FeaturesSection t={t} />
        <HowItWorksSection t={t} />
        <TestimonialsSection t={t} />
        <FinalCTASection t={t} />
      </div>
    </AppBackground>
  );
};

export default Home;