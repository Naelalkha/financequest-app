import { Link } from 'react-router-dom'
import { FaLock, FaStar, FaClock } from 'react-icons/fa'

function QuestList({ t }) {
  // Placeholder quests
  const quests = [
    { id: 1, title: "Budget Basics", difficulty: "Easy", time: "5 min", locked: false },
    { id: 2, title: "Saving Strategies", difficulty: "Easy", time: "7 min", locked: false },
    { id: 3, title: "Investment 101", difficulty: "Medium", time: "10 min", locked: true },
  ]
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">
          {t('quests')}
        </h1>
        
        <div className="space-y-4">
          {quests.map(quest => (
            <Link
              key={quest.id}
              to={quest.locked ? '#' : `/quests/${quest.id}`}
              className={`block bg-gray-800 p-6 rounded-lg border-2 ${
                quest.locked ? 'border-gray-700 opacity-60' : 'border-gray-700 hover:border-gold-500'
              } transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {quest.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-gold-500" />
                      {quest.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {quest.time}
                    </span>
                  </div>
                </div>
                {quest.locked && (
                  <FaLock className="text-3xl text-gray-600" />
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {quests.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            {t('noQuests')}
          </p>
        )}
      </div>
    </div>
  )
}

export default QuestList