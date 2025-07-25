import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaRocket, FaTrophy, FaChartLine, FaShieldAlt, 
  FaStar, FaArrowRight, FaPlay, FaCheck
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Home = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: FaTrophy,
      title: t('home.features.gamified_title') || 'Gamified Learning',
      description: t('home.features.gamified_desc') || 'Earn points, unlock badges, and level up as you master financial concepts'
    },
    {
      icon: FaChartLine,
      title: t('home.features.track_title') || 'Track Progress',
      description: t('home.features.track_desc') || 'Monitor your financial journey with detailed analytics and insights'
    },
    {
      icon: FaShieldAlt,
      title: t('home.features.secure_title') || '100% Secure',
      description: t('home.features.secure_desc') || 'Your data is encrypted and never shared with third parties'
    }
  ];

  const testimonials = [
    {
      name: 'Alex M.',
      role: t('home.testimonials.role_1') || 'Student',
      content: t('home.testimonials.content_1') || 'Finally, a finance app that makes learning fun! I\'ve saved $500 in my first month.',
      rating: 5
    },
    {
      name: 'Sarah K.',
      role: t('home.testimonials.role_2') || 'Freelancer',
      content: t('home.testimonials.content_2') || 'The quests helped me understand investing. My portfolio is up 15%!',
      rating: 5
    },
    {
      name: 'Mike L.',
      role: t('home.testimonials.role_3') || 'Parent',
      content: t('home.testimonials.content_3') || 'Perfect for teaching my kids about money. They love the rewards system!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-8 shadow-2xl animate-bounce">
              <FaRocket className="text-5xl text-gray-900" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeIn">
              {t('home.headline') || 'Level Up Your'} 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {t('home.headline_highlight') || 'Money Game'}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fadeIn" style={{ animationDelay: '200ms' }}>
              {t('home.subheadline') || 'Master personal finance through fun, bite-sized quests. Join 50,000+ users already winning with money!'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <FaPlay />
                {t('home.cta_start') || 'Start Free'}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-bold text-lg hover:bg-gray-700 hover:border-gray-600 transform hover:scale-105 transition-all duration-300"
              >
                {t('home.cta_login') || 'Login'}
                <FaArrowRight />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 animate-fadeIn" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span>4.9/5 {t('home.rating') || 'Rating'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">50K+</span>
                <span>{t('home.active_users') || 'Active Users'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">1M+</span>
                <span>{t('home.quests_completed') || 'Quests Completed'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 animate-fadeIn">
            {t('home.why_financequest') || 'Why FinanceQuest?'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:scale-105 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="text-3xl text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 animate-fadeIn">
            {t('home.how_it_works') || 'How It Works'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: t('home.step_1') || 'Sign Up', desc: t('home.step_1_desc') || 'Create your free account in seconds' },
              { step: '2', title: t('home.step_2') || 'Choose Quest', desc: t('home.step_2_desc') || 'Pick from 50+ financial topics' },
              { step: '3', title: t('home.step_3') || 'Learn & Earn', desc: t('home.step_3_desc') || 'Complete quests and earn points' },
              { step: '4', title: t('home.step_4') || 'Level Up', desc: t('home.step_4_desc') || 'Track progress and unlock rewards' }
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 animate-fadeIn">
            {t('home.loved_by_users') || 'Loved by 50,000+ Users'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-fadeIn">
            {t('home.ready_to_start') || 'Ready to Master Your Money?'}
          </h2>
          <p className="text-xl text-gray-300 mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            {t('home.join_community') || 'Join thousands making smarter financial decisions every day'}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl animate-fadeIn"
            style={{ animationDelay: '400ms' }}
          >
            {t('home.start_journey') || 'Start Your Journey'}
            <FaArrowRight />
          </Link>
          <p className="text-gray-500 text-sm mt-6 animate-fadeIn" style={{ animationDelay: '600ms' }}>
            {t('home.no_credit_card') || 'No credit card required • Free forever plan'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;