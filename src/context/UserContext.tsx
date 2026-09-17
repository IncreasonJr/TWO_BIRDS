import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { INITIAL_CURRENT_USER } from '../data/currentUser';
import { isValidEduEmail } from '../utils/validation';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentSession,
  onAuthStateChange,
  UserSignUpMetadata,
} from '../lib/authService';
import {
  getProfile,
  updateProfile as updateDbProfile,
  createDefaultProfile,
  getSwipedIds,
} from '../lib/databaseService';

export interface SignupData {
  name: string;
  email: string;
  university: string;
  major: string;
  age?: number;
  gender?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  needsEmailVerification?: boolean;
}

interface UserContextType {
  currentUser: UserProfile;
  authUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  totalSwipes: number;
  completionPercentage: number;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadPhoto: (file: File) => void;
  incrementSwipes: () => void;
  signup: (data: SignupData, password: string) => Promise<AuthResponse>;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('twobirds_current_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CURRENT_USER;
  });

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [totalSwipes, setTotalSwipes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('twobirds_swipes');
      if (saved !== null) return Number(saved) || 0;
    } catch {}
    return 0;
  });

  // Calculate email verification status
  const isEmailVerified = useMemo(() => {
    if (!authUser) return false;
    return !!(authUser.email_confirmed_at || (authUser as any).confirmed_at);
  }, [authUser]);

  // Is user authenticated and verified
  const isAuthenticated = useMemo(() => {
    if (!session || !authUser) return false;
    return isEmailVerified;
  }, [session, authUser, isEmailVerified]);

  // Sync Supabase user into currentUser profile representation
  const syncUserFromAuth = useCallback(async (user: User) => {
    setAuthUser(user);
    const meta = user.user_metadata || {};

    try {
      // 1. Fetch real profile from Supabase
      let profile = await getProfile(user.id);

      // 2. If not found, create default profile row in public.profiles
      if (!profile) {
        profile = await createDefaultProfile(user.id, user.email || '', meta);
      }

      if (profile) {
        setCurrentUser(profile);
      } else {
        // Fallback in-memory representation
        setCurrentUser((prev) => ({
          ...prev,
          id: user.id,
          uid: user.id,
          email: user.email || prev.email,
          name: meta.name || prev.name || 'Student',
          university: meta.university || prev.university || 'Stanford University',
          major: meta.major || prev.major || 'Undecided',
          age: meta.age ? Number(meta.age) : prev.age,
          gender: meta.gender || prev.gender || 'Other',
          bio: meta.bio !== undefined ? meta.bio : prev.bio,
          verifiedCampus: !!(user.email_confirmed_at || (user as any).confirmed_at),
        }));
      }

      // 3. Load swipe count from database
      const swiped = await getSwipedIds(user.id);
      setTotalSwipes(swiped.length);
    } catch (err) {
      console.warn('[UserContext] syncUserFromAuth warning:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (authUser) {
      await syncUserFromAuth(authUser);
    }
  }, [authUser, syncUserFromAuth]);

  // Initialize and restore Supabase Auth Session
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data: currentSession } = await getCurrentSession();
        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession);
            await syncUserFromAuth(currentSession.user);
          } else {
            setSession(null);
            setAuthUser(null);
          }
        }
      } catch (err) {
        console.error('[UserContext] Failed to retrieve Supabase session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Subscribe to auth state changes in real time
    const { subscription } = onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      if (newSession?.user) {
        setSession(newSession);
        await syncUserFromAuth(newSession.user);
      } else {
        setSession(null);
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserFromAuth]);

  // Persist currentUser and swipe stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('twobirds_current_user', JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('twobirds_swipes', String(totalSwipes));
    } catch {}
  }, [totalSwipes]);

  const completionPercentage = useMemo(() => {
    let score = 0;
    const totalChecks = 6;
    if (currentUser.photos && currentUser.photos.length > 0) score++;
    if (currentUser.name && currentUser.name.trim().length >= 2) score++;
    if (currentUser.bio && currentUser.bio.trim().length >= 5) score++;
    if (currentUser.major && currentUser.major.trim().length > 0) score++;
    if (currentUser.university && currentUser.university.trim().length > 0) score++;
    if (currentUser.interests && currentUser.interests.length >= 3) score++;

    return Math.round((score / totalChecks) * 100);
  }, [currentUser]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...data,
    }));

    if (authUser) {
      await updateDbProfile(authUser.id, data);
    }
  }, [authUser]);

  const uploadPhoto = useCallback((file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    const reader = new FileReader();
    reader.onloadend = async () => {
      setTimeout(async () => {
        setUploadProgress(100);
        const newPhotoUrl = reader.result as string;
        const newPhotos = [newPhotoUrl, ...(currentUser.photos || []).slice(1)];
        
        setCurrentUser((prev) => ({
          ...prev,
          photos: newPhotos,
        }));

        if (authUser) {
          await updateDbProfile(authUser.id, { photos: newPhotos });
        }

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 400);
      }, 1100);
    };
    reader.readAsDataURL(file);
  }, [authUser, currentUser.photos]);

  const incrementSwipes = useCallback(() => {
    setTotalSwipes((prev) => prev + 1);
  }, []);

  /**
   * Real Supabase Sign Up with metadata and university .edu enforcement
   */
  const signup = useCallback(async (data: SignupData, password: string): Promise<AuthResponse> => {
    const trimmedEmail = data.email.trim();

    if (!isValidEduEmail(trimmedEmail)) {
      return {
        success: false,
        error: 'Please use a valid university email (.edu) to sign up',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long',
      };
    }

    const metadata: UserSignUpMetadata = {
      name: data.name.trim(),
      university: data.university.trim() || 'Stanford University',
      major: data.major.trim() || 'Undecided',
      age: data.age || 20,
      gender: data.gender || 'Other',
      bio: data.bio?.trim() || '',
    };

    const { data: authData, error } = await signUpWithEmail(trimmedEmail, password, metadata);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to create account. Please try again.',
      };
    }

    if (authData?.user) {
      await syncUserFromAuth(authData.user);
      const isConfirmed = !!(authData.user.email_confirmed_at || (authData.user as any).confirmed_at);
      return {
        success: true,
        needsEmailVerification: !isConfirmed,
      };
    }

    return { success: true, needsEmailVerification: true };
  }, [syncUserFromAuth]);

  /**
   * Real Supabase Sign In with email and password
   */
  const login = useCallback(async (email: string, password?: string): Promise<AuthResponse> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Please enter your email address' };
    }

    // Quick demo access fallback
    if (!password && trimmed === 'alex@university.edu') {
      const demoUser: UserProfile = {
        id: '00000000-0000-0000-0000-000000000001',
        uid: '00000000-0000-0000-0000-000000000001',
        name: 'Alex Johnson',
        email: 'alex@university.edu',
        age: 21,
        gender: 'Non-binary',
        major: 'Computer Science',
        university: 'Stanford University',
        gradYear: 2026,
        bio: 'CS student passionate about building cool web apps.',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'],
        interests: ['Campus Life', 'Coding', 'Coffee'],
        verifiedCampus: true,
        distanceMiles: 0,
        onlineStatus: 'online',
        lastActive: new Date(),
      };
      setCurrentUser(demoUser);
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: demoUser.id,
          app_metadata: {},
          user_metadata: {
            name: demoUser.name,
            university: demoUser.university,
            major: demoUser.major,
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: demoUser.email,
          email_confirmed_at: new Date().toISOString(),
        } as any,
      });
      setAuthUser({
        id: demoUser.id,
        app_metadata: {},
        user_metadata: {
          name: demoUser.name,
          university: demoUser.university,
          major: demoUser.major,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: demoUser.email,
        email_confirmed_at: new Date().toISOString(),
      } as any);
      return { success: true };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password' };
    }

    const { data: authData, error } = await signInWithEmail(trimmed, password);

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: 'Please check your inbox and verify your .edu email before logging in.',
          needsEmailVerification: true,
        };
      }
      return {
        success: false,
        error: error.message || 'Invalid login credentials. Please try again.',
      };
    }

    if (authData?.user) {
      setSession(authData.session);
      await syncUserFromAuth(authData.user);

      const isConfirmed = !!(authData.user.email_confirmed_at || (authData.user as any).confirmed_at);
      if (!isConfirmed) {
        return {
          success: false,
          error: 'Please check your inbox and verify your .edu email before logging in.',
          needsEmailVerification: true,
        };
      }

      return { success: true };
    }

    return { success: true };
  }, [syncUserFromAuth]);

  /**
   * Real Supabase Sign Out
   */
  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('[UserContext] Sign out error:', err);
    } finally {
      setSession(null);
      setAuthUser(null);
      try {
        localStorage.removeItem('twobirds_auth');
      } catch {}
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        authUser,
        session,
        isAuthenticated,
        isEmailVerified,
        loading,
        isUploading,
        uploadProgress,
        totalSwipes,
        completionPercentage,
        updateProfile,
        uploadPhoto,
        incrementSwipes,
        signup,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
