import { Link } from 'react-router-dom';
import { FaLock, FaStar, FaClock } from 'react-icons/fa';
import quests from '../data/quests.json';
import { useAuth } from '../context/AuthContext';

function QuestList({ t }) {
  const { user } = useAuth();

  const filteredQuests = quests.filter(quest => !quest.premium || (user && user.premium));

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">
          {t('quests')}
        </h1>
        
        <div className="space-y-4">
          {filteredQuests.map(quest => (
            <Link
              key={quest.id}
              to={`/quests/${quest.id}`}
              className="block bg-gray-800 p-6 rounded-lg border-2 border-gray-700 hover:border-gold-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {(user && user.lang === 'fr') ? quest.titleFR : quest.titleEN}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-gold-500" />
                      Easy
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      5 min
                    </span>
                  </div>
                </div>
                {quest.premium && !(user && user.premium) && (
                  <FaLock className="text-3xl text-gray-600" />
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {filteredQuests.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            {t('noQuests')}
          </p>
        )}
      </div>
    </div>
  );
}

export default QuestList;