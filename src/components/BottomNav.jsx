import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaChartLine, FaList, FaCrown } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    {
      path: '/dashboard',
      icon: FaHome,
      label: t('nav.home') || 'Home',
      color: 'text-yellow-400'
    },
    {
      path: '/dashboard',
      icon: FaChartLine,
      label: t('nav.progress') || 'Progress',
      color: 'text-green-400'
    },
    {
      path: '/quests',
      icon: FaList,
      label: t('nav.quests') || 'Quests',
      color: 'text-blue-400'
    },
    {
      path: '/premium',
      icon: FaCrown,
      label: t('nav.premium') || 'Premium',
      color: 'text-purple-400'
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-800 border-t border-gray-700 animate-slideUp">
      {/* iOS safe area */}
      <div className="pb-safe">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg
                  transition-all duration-300 group relative
                  ${isActive ? 'scale-110' : 'hover:scale-105'}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />
                )}
                
                {/* Icon container */}
                <div className={`
                  relative transition-all duration-300
                  ${isActive ? 'transform -translate-y-1' : 'group-hover:-translate-y-0.5'}
                `}>
                  <item.icon 
                    className={`
                      text-2xl transition-all duration-300
                      ${isActive 
                        ? item.color 
                        : 'text-gray-400 group-hover:text-gray-300'
                      }
                    `}
                  />
                  {/* Glow effect on active */}
                  {isActive && (
                    <div className={`absolute inset-0 ${item.color} blur-lg opacity-50 -z-10`} />
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-xs mt-1 font-medium transition-all duration-300
                  ${isActive 
                    ? 'text-white' 
                    : 'text-gray-500 group-hover:text-gray-400'
                  }
                `}>
                  {item.label}
                </span>
                
                {/* Hover/tap ripple effect */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity duration-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;