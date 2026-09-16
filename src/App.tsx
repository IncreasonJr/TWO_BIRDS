import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavbar, BottomTabNav } from './components/Navigation';
import { InstallPWA } from './components/InstallPWA';
import { UpdateNotification } from './components/UpdateNotification';
import { Home } from './pages/Home';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Signup } from './pages/Signup';
import { NotFound } from './pages/NotFound';
import { MatchProvider, useMatches } from './hooks/useMatches';
import { useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUser();
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { totalUnread } = useMatches();
  const { isAuthenticated } = useUser();
  const location = useLocation();

  const isAuthPage = location.pathname === '/signup' || location.pathname === '/login';
  const showNav = !isAuthPage && isAuthenticated;

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#1A1A1A] text-[#FFFFFF] flex flex-col overflow-hidden select-none">
      {/* Mobile Container Shell */}
      <div className={`w-full max-w-md mx-auto h-full flex flex-col bg-[#1A1A1A] border-x border-[#4A4A4A] shadow-2xl relative overflow-hidden ${showNav ? 'pb-14' : ''}`}>
        <UpdateNotification />
        <InstallPWA variant="banner" />
        {showNav && <TopNavbar />}
        <main className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/signup" element={<Signup defaultMode="signup" />} />
            <Route path="/login" element={<Signup defaultMode="login" />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {showNav && <BottomTabNav unreadMatchesCount={totalUnread} />}
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
