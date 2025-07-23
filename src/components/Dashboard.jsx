import { Link } from 'react-router-dom';
import { FaTrophy, FaCoins, FaFire, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard({ t }) {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(0);
  const [streaks, setStreaks] = useState(0);
  const [badges, setBadges] = useState([]);
  const [streakChecked, setStreakChecked] = useState(false); // Flag pour une seule check
  const levelThresholds = [0, 100, 300, 600];

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user data
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setStreaks(userData.streaks || 0);
        const points = userData.points || 0;
        setProgress((points / levelThresholds[levelThresholds.length - 1]) * 100);

        // Badge logic
        const newBadges = [];
        if (points >= 100 && !userData.badges?.includes('BudgetMaster')) newBadges.push('BudgetMaster');
        if (points >= 300 && !userData.badges?.includes('SavingsPro')) newBadges.push('SavingsPro');
        if (newBadges.length > 0) {
          updateDoc(doc(db, 'users', user.uid), { badges: [...(userData.badges || []), ...newBadges] });
          toast.success(`Unlocked badges: ${newBadges.join(', ')}!`, { autoClose: 3000 });
        }
        setBadges(userData.badges || []);
      }
    });

    // Streak logic (one-time check)
    const checkStreak = async () => {
      if (streakChecked) return;
      setStreakChecked(true);

      const lastLogin = localStorage.getItem('lastLogin');
      const today = new Date().toDateString();
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentStreaks = userData.streaks || 0;

        if (!lastLogin) {
          // Premier login
          await updateDoc(userRef, { streaks: 1 });
          localStorage.setItem('lastLogin', today);
        } else {
          const lastDate = new Date(lastLogin);
          const diffDays = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Incrémente si connecté hier
            await updateDoc(userRef, { streaks: currentStreaks + 1 });
            localStorage.setItem('lastLogin', today);
          } else if (diffDays > 1) {
            // Reset si saut
            await updateDoc(userRef, { streaks: 1 });
            localStorage.setItem('lastLogin', today);
          }
        }
      }
    };

    checkStreak();

    return unsubscribe;
  }, [user, streakChecked]);

  if (!user) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gold-500">
            {t('dashboard')}
          </h1>
          <button onClick={logout} className="text-gold-500 hover:text-gold-400 flex items-center gap-2">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaTrophy className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{t('level')}</p>
            <p className="text-xl font-bold text-white">{user.level}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaCoins className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{t('points')}</p>
            <p className="text-xl font-bold text-white">{user.points}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaFire className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Streak</p>
            <p className="text-xl font-bold text-white">{streaks} days</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <FaChartLine className="text-3xl text-gold-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Progress</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-gold-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-400">{Math.round(progress)}%</p>
          </div>
        </div>
        
        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <span key={badge} className="bg-gold-500 text-gray-900 px-2 py-1 rounded animate-bounce">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
        
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
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
}

export default Dashboard;