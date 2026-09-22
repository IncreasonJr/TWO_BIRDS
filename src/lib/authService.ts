import { supabase } from './supabaseClient';
import { isValidEduEmail } from '../utils/validation';
import type { Session, User, AuthChangeEvent, Subscription } from '@supabase/supabase-js';

export interface UserSignUpMetadata {
  name: string;
  university: string;
  major: string;
  age?: number;
  gender?: string;
  bio?: string;
}

export interface AuthResult<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Sign up a new university student with email, password, and metadata.
 * Strictly verifies .edu domain BEFORE invoking Supabase Auth.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: UserSignUpMetadata
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const trimmedEmail = email.trim();

  // Enforce university email restriction (.edu or .edu.gh) before calling Supabase
  if (!isValidEduEmail(trimmedEmail)) {
    return {
      data: null,
      error: new Error('Please use a valid university email ending in .edu or .edu.gh'),
    };
  }

  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify-email` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: metadata.name.trim(),
          university: metadata.university.trim() || 'Stanford University',
          major: metadata.major.trim(),
          age: metadata.age || 20,
          gender: metadata.gender || 'Other',
          bio: metadata.bio?.trim() || '',
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { data: null, error };
    }

    // Step 10: Minimal Profile Sync (placeholder table upsert)
    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          name: metadata.name.trim(),
          university: metadata.university.trim() || 'Stanford University',
          major: metadata.major.trim(),
          age: metadata.age || 20,
          gender: metadata.gender || 'Other',
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        // Non-blocking: table might not be created in user's Supabase dashboard yet
        console.warn('[Profile Sync] profiles table upsert non-blocking notice:', profileErr);
      }
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign in with email and password via Supabase Auth.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign out current user session.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error || null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieve current active session from Supabase.
 */
export async function getCurrentSession(): Promise<AuthResult<Session | null>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { data: null, error };
    }
    return { data: data.session, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Subscribe to Supabase auth state transitions.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { subscription: Subscription } {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return { subscription: data.subscription };
}

/**
 * Send password reset email to user.
 */
export async function sendPasswordReset(email: string): Promise<{ error: Error | null }> {
  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/forgot-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });
    return { error: error || null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Resend verification email for unconfirmed accounts.
 */
export async function resendVerificationEmail(email: string): Promise<{ error: Error | null }> {
  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify-email` : undefined;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error || null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
