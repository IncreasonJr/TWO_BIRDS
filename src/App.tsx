import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavbar, BottomTabNav } from './components/Navigation';
import { Home } from './pages/Home';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { useMatches } from './hooks/useMatches';

export const App: React.FC = () => {
  const { totalUnread } = useMatches();

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F4F4] text-[#532E16] flex flex-col justify-between selection:bg-[#F3B250] selection:text-[#532E16]">
        {/* Mobile Container Shell */}
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#F5F4F4] border-x border-[#C67D43]/20 shadow-2xl relative">
          <TopNavbar />
          <main className="flex-1 pb-16 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <BottomTabNav unreadMatchesCount={totalUnread} />
        </div>
      </div>
    </Router>
  );
};

export default App;
