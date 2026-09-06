import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { House, Heart, MessageCircle, User, ShieldCheck } from 'lucide-react';

interface NavigationProps {
  unreadMatchesCount?: number;
}

export const TopNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#532E16] text-[#F5F4F4] px-4 py-3 flex items-center justify-between shadow-md border-b border-[#C67D43]/30">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-[#F3B250] text-[#532E16] flex items-center justify-center font-extrabold shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-[#F5F4F4]">
            UniDate
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#F3B250] block -mt-1">
            Stanford Campus
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F4F4]/10 border border-[#F3B250]/30 text-[#F5F4F4] text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-[#F3B250]" />
        <span>Verified Student</span>
      </div>
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#F5F4F4] border-t border-[#C67D43]/20 px-6 py-2 shadow-2xl">
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
                  fill={item.name === 'Matches' && isActive ? '#F3B250' : 'none'}
                  color={isActive ? '#F3B250' : '#C67D43'}
                  className={`transition-all duration-300 ${
                    isActive ? 'scale-110 opacity-100' : 'opacity-65 hover:opacity-100'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#F3B250] text-[#532E16] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#F5F4F4]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] tracking-wide font-semibold transition-colors ${
                  isActive ? 'text-[#F3B250]' : 'text-[#C67D43]/70 group-hover:text-[#C67D43]'
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#F3B250] shadow-glow-amber" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
