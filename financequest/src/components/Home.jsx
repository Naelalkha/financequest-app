import { Link } from 'react-router-dom'
import { FaTrophy, FaCoins, FaGamepad } from 'react-icons/fa'

function Home({ t }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-gold-500 rounded-full flex items-center justify-center">
            <FaCoins className="text-6xl text-gray-900" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gold-500 mb-4">
          {t('welcome')}
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          {t('tagline')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-gold-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <FaGamepad />
            {t('startLearning')}
          </Link>
          
          <Link
            to="/login"
            className="border-2 border-gold-500 text-gold-500 px-8 py-3 rounded-lg font-semibold hover:bg-gold-500 hover:text-gray-900 transition-colors"
          >
            {t('login')}
          </Link>
        </div>
        
        {/* Features preview */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <FaTrophy className="text-3xl text-gold-500 mb-2" />
            <span className="text-sm text-gray-400">Earn Badges</span>
          </div>
          <div className="flex flex-col items-center">
            <FaCoins className="text-3xl text-gold-500 mb-2" />
            <span className="text-sm text-gray-400">Gain Points</span>
          </div>
          <div className="flex flex-col items-center">
            <FaGamepad className="text-3xl text-gold-500 mb-2" />
            <span className="text-sm text-gray-400">Complete Quests</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home