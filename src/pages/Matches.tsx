import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { ShieldCheck, Sparkles, Search, ChevronRight } from 'lucide-react';
import { formatGradYear } from '../utils/formatters';

export const Matches: React.FC = () => {
  const { matches, setActiveMatchId } = useMatches();
  const navigate = useNavigate();

  const handleSelectMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    navigate('/chat');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-md mx-auto px-4 py-3 space-y-4 overflow-y-auto bg-[#F5F4F4] text-[#532E16]">
      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#C67D43]" />
        <input
          type="text"
          placeholder="Search campus matches or majors..."
          className="w-full bg-[#532E16]/5 border border-[#C67D43]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#532E16] placeholder-[#C67D43]/60 focus:outline-none focus:border-[#F3B250] transition"
        />
      </div>

      {/* New Matches Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C67D43] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F3B250]" />
            New Matches ({matches.length})
          </h3>
          <span className="text-[10px] text-[#C67D43]/80 font-medium">Campus Network</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => handleSelectMatch(match.id)}
              className="flex flex-col items-center gap-1 group flex-shrink-0"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#F3B250] to-[#C67D43] shadow-md group-hover:scale-105 transition-transform duration-300">
                <img
                  src={match.user.photos[0]}
                  alt={match.user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#F5F4F4]"
                />
                {match.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#F3B250] border-2 border-[#F5F4F4]" />
                )}
              </div>
              <span className="text-[11px] font-bold text-[#532E16] group-hover:text-[#C67D43] truncate max-w-[64px]">
                {match.user.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Messages List */}
      <div className="space-y-2 flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#C67D43]">
          Messages
        </h3>

        <div className="space-y-2">
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => handleSelectMatch(match.id)}
              className="bg-[#F5F4F4] border border-[#C67D43]/20 p-3.5 rounded-2xl flex items-center gap-3 hover:bg-[#532E16]/5 cursor-pointer transition-all duration-300 shadow-sm group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={match.user.photos[0]}
                  alt={match.user.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#C67D43]/30"
                />
                {match.online && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#F3B250] border-2 border-[#F5F4F4]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#532E16] truncate">{match.user.name}</h4>
                    {match.user.verifiedCampus && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F3B250] flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#C67D43] font-medium">{match.lastMessageTimestamp}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#C67D43] font-medium mt-0.5">
                  <span className="text-[#532E16] font-bold">{match.user.major}</span>
                  <span>•</span>
                  <span>{formatGradYear(match.user.gradYear)}</span>
                </div>

                <p className={`text-xs truncate mt-1 ${match.unread ? 'font-bold text-[#532E16]' : 'text-[#532E16]/70'}`}>
                  {match.lastMessage || 'Matched! Send the first message.'}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-[#C67D43] group-hover:text-[#532E16] transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
