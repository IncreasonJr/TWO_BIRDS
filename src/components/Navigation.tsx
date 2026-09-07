import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { House, Heart, MessageCircle, User } from 'lucide-react';
import { InstallPWA } from './InstallPWA';

interface NavigationProps {
  unreadMatchesCount?: number;
}

export const TopNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A] text-[#FFFFFF] px-4 py-2.5 flex items-center justify-between shadow-md border-b border-[#4A4A4A]">
      <div className="flex items-center gap-2.5">
        <img
          src="/logo192.png"
          alt="Two Birds Logo"
          className="h-8 w-8 object-cover rounded-xl shadow-glow-gold border border-[#C9A84C]/30"
        />
        <span className="font-extrabold text-xl tracking-tight text-[#FFFFFF]">
          Two Birds
        </span>
      </div>

      <InstallPWA variant="compact" />
    </header>
  );
};

export const BottomTabNav: React.FC<NavigationProps> = ({ unreadMatchesCount = 0 }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', to: '/', icon: House },
    { name: 'Matches', to: '/matches', icon: Heart, badge: unreadMatchesCount },
    { name: 'Chat', to: '/chat', icon: MessageCircle },
    { name: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <nav className="w-full bg-[#1A1A1A] border-t border-[#4A4A4A] px-6 py-2 shadow-2xl shrink-0 z-40">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 group"
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
