import { Link } from 'react-router-dom'
import { FaTrophy, FaCoins, FaFire, FaChartLine } from 'react-icons/fa'

function Dashboard({ t }) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">
          {t('dashboard')}
        </h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaTrophy className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{t('level')}</p>
            <p className="text-xl font-bold text-white">{t('novice')}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaCoins className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{t('points')}</p>
            <p className="text-xl font-bold text-white">0</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaFire className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Streak</p>
            <p className="text-xl font-bold text-white">0 days</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaChartLine className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Progress</p>
            <p className="text-xl font-bold text-white">0%</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/quests"
              className="bg-gold-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-center"
            >
              View Quests
            </Link>
            <button className="border-2 border-gold-500 text-gold-500 px-6 py-3 rounded-lg font-semibold hover:bg-gold-500 hover:text-gray-900 transition-colors">
              Daily Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard