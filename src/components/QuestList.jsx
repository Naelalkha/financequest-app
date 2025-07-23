import { Link } from 'react-router-dom';
import { FaLock, FaStar, FaClock, FaSearch, FaCrown, FaFire } from 'react-icons/fa';
import { useState, useMemo } from 'react';
import quests from '../data/quests.json';
import { useAuth } from '../context/AuthContext';

function QuestList({ t, currentLang }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('difficulty'); // difficulty, title, duration

  // Difficulty order for sorting
  const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

  // Process and filter quests
  const processedQuests = useMemo(() => {
    let filtered = quests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quest => {
        const title = currentLang === 'fr' ? quest.titleFR : quest.titleEN;
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Sort quests
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'title':
          const titleA = currentLang === 'fr' ? a.titleFR : a.titleEN;
          const titleB = currentLang === 'fr' ? b.titleFR : b.titleEN;
          return titleA.localeCompare(titleB);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [quests, searchTerm, sortBy, currentLang]);

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get difficulty stars
  const getDifficultyStars = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      default: return 1;
    }
  };

  // Render stars
  const renderStars = (count, color) => {
    return Array.from({ length: 3 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-sm ${index < count ? color : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-yellow-400">
            {t('quests')}
          </h1>
          
          {/* Premium status */}
          {user?.premium && (
            <div className="flex items-center gap-2 bg-yellow-600 text-gray-900 px-4 py-2 rounded-full">
              <FaCrown className="text-sm" />
              <span className="font-semibold">{t('premiumMember')}</span>
            </div>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchQuests')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
              >
                <option value="difficulty">{t('sortByDifficulty')}</option>
                <option value="title">{t('sortByTitle')}</option>
                <option value="duration">{t('sortByDuration')}</option>
              </select>
            </div>
          </div>

          {/* Quest Statistics */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
            <span>{t('totalQuests')}: {processedQuests.length}</span>
            <span>{t('free')}: {processedQuests.filter(q => !q.premium).length}</span>
            <span>{t('premium')}: {processedQuests.filter(q => q.premium).length}</span>
          </div>
        </div>

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedQuests.map(quest => {
            const title = currentLang === 'fr' ? quest.titleFR : quest.titleEN;
            const difficulty = currentLang === 'fr' ? quest.difficultyFR : quest.difficulty;
            const isLocked = quest.premium && !user?.premium;
            const difficultyColor = getDifficultyColor(quest.difficulty);
            const difficultyStars = getDifficultyStars(quest.difficulty);

            return (
              <div
                key={quest.id}
                className={`bg-gray-800 rounded-lg border-2 transition-all duration-300 overflow-hidden ${
                  isLocked 
                    ? 'border-gray-700 opacity-75' 
                    : 'border-gray-700 hover:border-yellow-500 hover:shadow-lg hover:scale-105'
                }`}
              >
                {/* Quest Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {title}
                      </h3>
                      
                      {/* Quest Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {/* Difficulty */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">{t('difficulty')}:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(difficultyStars, difficultyColor)}
                          </div>
                          <span className={`${difficultyColor} font-medium`}>
                            {t(difficulty.toLowerCase())}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1 text-gray-400">
                          <FaClock className="text-xs" />
                          <span>{quest.duration} min</span>
                        </div>

                        {/* Premium Badge */}
                        {quest.premium && (
                          <div className="flex items-center gap-1">
                            <FaCrown className="text-yellow-500 text-xs" />
                            <span className="text-yellow-500 text-xs font-medium">
                              {t('premium')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lock Icon for Premium */}
                    {isLocked && (
                      <div className="flex-shrink-0 ml-3">
                        <FaLock className="text-2xl text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quest Action */}
                <div className="p-4">
                  {isLocked ? (
                    <Link
                      to="/premium"
                      className="w-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaCrown className="text-sm" />
                      {t('unlockPremium')}
                    </Link>
                  ) : (
                    <Link
                      to={`/quests/${quest.id}`}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                    >
                      <FaFire className="text-sm" />
                      {t('startQuest')}
                    </Link>
                  )}
                </div>

                {/* Progress Bar (for unlocked quests) */}
                {!isLocked && (
                  <div className="px-4 pb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: '0%' }} // TODO: Add quest progress from user data
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {t('notStarted')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {processedQuests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <FaSearch className="text-4xl mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t('noQuestsFound')}</h3>
              <p className="text-gray-400">{t('tryAdjusting')}</p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {t('clearSearch')}
              </button>
            )}
          </div>
        )}

        {/* CTA for Premium */}
        {!user?.premium && processedQuests.some(q => q.premium) && (
          <div className="mt-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-center">
            <FaCrown className="text-3xl text-gray-900 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('unlockAllQuests')}
            </h3>
            <p className="text-gray-800 mb-4">
              {t('accessPremium')}
            </p>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 bg-gray-900 text-yellow-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <FaCrown className="text-sm" />
              {t('gopremium')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestList;