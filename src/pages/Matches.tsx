import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { Sparkles, Search, ChevronRight, Heart } from 'lucide-react';
import { formatGradYear } from '../utils/formatters';

export const Matches: React.FC = () => {
  const { matches, setActiveMatchId } = useMatches();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSelectMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    navigate('/chat');
  };

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    const query = searchQuery.toLowerCase();
    return matches.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.major.toLowerCase().includes(query)
    );
  }, [matches, searchQuery]);

  return (
    <div className="flex flex-col h-full flex-1 pb-20 max-w-md mx-auto px-4 py-3 space-y-4 overflow-y-auto bg-[#1A1A1A] text-[#FFFFFF]">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C9A84C]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search matches or majors..."
          className="w-full bg-[#333333] border border-[#4A4A4A] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFFFF] placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition"
        />
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#333333] border border-[#4A4A4A] flex items-center justify-center text-[#C9A84C]">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#FFFFFF]">No matches yet. Start swiping!</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-glow-gold"
          >
            Explore Profiles
          </button>
        </div>
      ) : (
        <>
          {/* Story Bar (Top) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                New Matches ({matches.length})
              </h3>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match.id)}
                  className="flex flex-col items-center gap-1.5 group flex-shrink-0"
                >
                  <div className="relative p-0.5 rounded-full bg-[#C9A84C] shadow-glow-gold group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={match.photos[0] || match.user.photos[0]}
                      alt={match.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#1A1A1A]"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#FFFFFF] group-hover:text-[#C9A84C] truncate max-w-[64px]">
                    {match.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Match List */}
          <div className="space-y-2 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
              Messages
            </h3>

            <div className="space-y-2">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => handleSelectMatch(match.id)}
                  className="bg-[#333333] border border-[#4A4A4A] p-3.5 rounded-2xl flex items-center gap-3 hover:border-[#C9A84C]/60 cursor-pointer transition-all duration-300 shadow-sm group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={match.photos[0] || match.user.photos[0]}
                      alt={match.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#4A4A4A]"
                    />
                  </div>


                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#FFFFFF] truncate">{match.name}</h4>
                        {match.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#C9A84C] shadow-glow-gold flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#4A4A4A] font-medium">{match.lastMessageTimestamp}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#4A4A4A] font-medium mt-0.5">
                      <span className="text-[#C9A84C] font-semibold">{match.major}</span>
                      {match.user?.gradYear && (
                        <>
                          <span>•</span>
                          <span>{formatGradYear(match.user.gradYear)}</span>
                        </>
                      )}
                    </div>

                    <p className={`text-xs truncate mt-1 ${match.unread ? 'font-bold text-[#FFFFFF]' : 'text-[#4A4A4A]'}`}>
                      {match.lastMessage || 'Matched! Send the first message.'}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#4A4A4A] group-hover:text-[#C9A84C] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
