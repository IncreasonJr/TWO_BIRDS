import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavbar, BottomTabNav } from './components/Navigation';
import { InstallPWA } from './components/InstallPWA';
import { Home } from './pages/Home';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { MatchProvider, useMatches } from './hooks/useMatches';
import { UserProvider } from './context/UserContext';

const AppContent: React.FC = () => {
  const { totalUnread } = useMatches();

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#1A1A1A] text-[#FFFFFF] flex flex-col overflow-hidden select-none">
      {/* Mobile Container Shell */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#1A1A1A] border-x border-[#4A4A4A] shadow-2xl relative overflow-hidden pb-14">
        <InstallPWA variant="banner" />
        <TopNavbar />
        <main className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomTabNav unreadMatchesCount={totalUnread} />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <UserProvider>
        <MatchProvider>
          <AppContent />
        </MatchProvider>
      </UserProvider>
    </Router>
  );
};

export default App;

