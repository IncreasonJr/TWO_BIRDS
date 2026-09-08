import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { House, Heart, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  unreadMatchesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ unreadMatchesCount = 0 }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', to: '/', icon: House },
    { name: 'Matches', to: '/matches', icon: Heart, badge: unreadMatchesCount },
    { name: 'Chat', to: '/chat', icon: MessageCircle },
    { name: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto w-full bg-[#1A1A1A] border-t border-[#4A4A4A] px-4 sm:px-6 py-2 shadow-2xl overflow-hidden select-none touch-none">
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 group flex-1"
            >
              <div className="relative">
                <IconComponent
                  size={24}
                  strokeWidth={2}
                  fill={item.name === 'Matches' && isActive ? '#C9A84C' : 'none'}
                  color={isActive ? '#C9A84C' : '#4A4A4A'}
                  className={`transition-all duration-300 ${
                    isActive ? 'scale-110 opacity-100' : 'opacity-70 group-hover:opacity-100'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#C9A84C] text-[#1A1A1A] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] tracking-wide font-semibold transition-colors ${
                  isActive ? 'text-[#FFFFFF]' : 'text-[#4A4A4A] group-hover:text-[#FFFFFF]'
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shadow-glow-gold" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
