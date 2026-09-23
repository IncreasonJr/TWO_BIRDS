import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TopNavbar, BottomTabNav } from './components/Navigation';
import { InstallPWA } from './components/InstallPWA';
import { UpdateNotification } from './components/UpdateNotification';
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';
import { MatchProvider, useMatches } from './hooks/useMatches';
import { UserProvider, useUser } from './context/UserContext';
import { onNotificationClick } from './lib/oneSignalClient';
import { Sparkles, RefreshCw } from 'lucide-react';

// Route-based code splitting for optimal bundle size & fast initial load
const Home = lazy(() => import('./pages/Home'));
const Matches = lazy(() => import('./pages/Matches'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const AddPhotos = lazy(() => import('./pages/AddPhotos'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const BlockedUsers = lazy(() => import('./pages/BlockedUsers'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount'));
const CommunityGuidelines = lazy(() => import('./pages/CommunityGuidelines'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoadingFallback: React.FC = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-[#1A1A1A] text-[#FFFFFF] space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold flex items-center justify-center">
      <Sparkles className="w-6 h-6 text-[#C9A84C]" />
    </div>
    <div className="flex items-center gap-2 text-xs font-semibold text-[#A0A0A0]">
      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
      <span>Loading...</span>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, authUser, isAuthenticated, loading } = useUser();
  const location = useLocation();

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

  // Authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  // Mandatory photo gate: If user has 0 photos and is not on allowed setup pages, redirect to /add-photos
  const hasPhotos = currentUser.photos && currentUser.photos.length > 0;
  const isAllowedWithoutPhotos =
    location.pathname === '/add-photos' ||
    location.pathname === '/profile' ||
    location.pathname === '/delete-account' ||
    location.pathname === '/blocked-users' ||
    location.pathname === '/notifications';

  if (!hasPhotos && !isAllowedWithoutPhotos) {
    return <Navigate to="/add-photos" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { totalUnread } = useMatches();
  const { isAuthenticated } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle OneSignal push notification clicks globally
  useEffect(() => {
    onNotificationClick((event: any) => {
      const data = event?.notification?.additionalData;
      if (data?.type === 'message' || data?.type === 'match') {
        const matchId = data?.matchId || data?.match_id;
        if (matchId) {
          navigate(`/chat?matchId=${encodeURIComponent(matchId)}`);
        } else {
          navigate('/matches');
        }
      } else if (data?.url) {
        navigate(data.url);
      } else {
        navigate('/notifications');
      }
    });
  }, [navigate]);

  const publicRoutes = ['/signup', '/login', '/verify-email', '/forgot-password', '/privacy', '/terms', '/community-guidelines'];
  const isPublicRoute = publicRoutes.some((route) => location.pathname === route);
  const isDedicatedScreen =
    location.pathname === '/add-photos' ||
    location.pathname === '/blocked-users' ||
    location.pathname === '/delete-account' ||
    location.pathname === '/community-guidelines' ||
    location.pathname === '/notifications';
  const showNav = !isPublicRoute && !isDedicatedScreen && isAuthenticated;

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#1A1A1A] text-[#FFFFFF] flex flex-col overflow-hidden select-none">
      {/* Mobile Container Shell */}
      <div className={`w-full max-w-md mx-auto h-full flex flex-col bg-[#1A1A1A] border-x border-[#4A4A4A] shadow-2xl relative overflow-hidden ${showNav ? 'pb-14' : ''}`}>
        <UpdateNotification />
        <InstallPWA variant="banner" />
        <NotificationPermissionPrompt />
        {showNav && <TopNavbar />}
        <main className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Protected Core Routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/add-photos" element={<ProtectedRoute><AddPhotos /></ProtectedRoute>} />
              <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              {/* Safety & Moderation Routes */}
              <Route path="/blocked-users" element={<ProtectedRoute><BlockedUsers /></ProtectedRoute>} />
              <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />

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
          </Suspense>
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
