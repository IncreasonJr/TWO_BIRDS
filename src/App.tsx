import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotFound } from './pages/NotFound';
import { MatchProvider, useMatches } from './hooks/useMatches';
import { UserProvider, useUser } from './context/UserContext';
import { Sparkles, RefreshCw } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, isAuthenticated, isEmailVerified, loading } = useUser();

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#1A1A1A] text-[#FFFFFF] space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#C9A84C]" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#A0A0A0]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
          <span>Verifying student session...</span>
        </div>
      </div>
    );
  }

  // Not signed in at all -> redirect to signup
  if (!authUser) {
    return <Navigate to="/signup" replace />;
  }

  // Signed in but email unconfirmed -> redirect to verify-email
  if (!isEmailVerified) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(authUser.email || '')}`} replace />;
  }

  // Authenticated and verified
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { totalUnread } = useMatches();
  const { isAuthenticated } = useUser();
  const location = useLocation();

  const publicRoutes = ['/signup', '/login', '/verify-email', '/forgot-password', '/privacy', '/terms'];
  const isPublicRoute = publicRoutes.some((route) => location.pathname === route);
  const showNav = !isPublicRoute && isAuthenticated;

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#1A1A1A] text-[#FFFFFF] flex flex-col overflow-hidden select-none">
      {/* Mobile Container Shell */}
      <div className={`w-full max-w-md mx-auto h-full flex flex-col bg-[#1A1A1A] border-x border-[#4A4A4A] shadow-2xl relative overflow-hidden ${showNav ? 'pb-14' : ''}`}>
        <UpdateNotification />
        <InstallPWA variant="banner" />
        {showNav && <TopNavbar />}
        <main className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          <Routes>
            {/* Protected Core Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Public Authentication & Verification Routes */}
            <Route path="/signup" element={<Signup defaultMode="signup" />} />
            <Route path="/login" element={<Signup defaultMode="login" />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public Legal Pages */}
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
