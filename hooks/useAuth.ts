import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UseAuthReturn {
  session: any;
  user: any;
  loading: boolean;
  error: string | null;
}

/**
 * useAuth Hook - Manages authentication state
 * Use this in your main App component to track auth state globally
 */
export const useAuth = (): UseAuthReturn => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error('[Auth] Failed to get session:', err);
      setError('Failed to initialize authentication');
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setError(null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { session, user: session?.user, loading, error };
};

/**
 * useLogin Hook - Handle login with error handling
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (err) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in');
        } else {
          setError(err.message);
        }
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

/**
 * useSignup Hook - Handle registration with validation
 */
export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
    phone?: string;
  }

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        setError('Please fill in all required fields');
        return false;
      }

      if (data.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }

      const { error: err } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            company: data.company,
            job_title: data.jobTitle,
            phone: data.phone,
          }
        }
      });

      if (err) {
        if (err.message.includes('already registered')) {
          setError('This email is already registered. Please login instead.');
        } else {
          setError(err.message);
        }
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};

/**
 * useLogout Hook - Handle logout
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.signOut();

      if (err) {
        setError(err.message);
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
};

/**
 * usePasswordReset Hook - Handle password reset flow
 */
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (err) {
        setError(err.message);
        return false;
      }

      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Reset request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }

      const { error: err } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (err) {
        setError(err.message);
        return false;
      }

      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Password update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { requestReset, updatePassword, loading, error, success };
};

/**
 * useEmailVerification Hook - Handle email verification
 */
export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const verifyEmail = async (token: string, type: 'email' | 'recovery' = 'email') => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: err } = await supabase.auth.verifyOtp({
        type,
        token
      });

      if (err) {
        setError(err.message);
        return false;
      }

      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim()
      });

      if (err) {
        setError(err.message);
        return false;
      }

      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Resend failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { verifyEmail, resendVerificationEmail, loading, error, success };
};

/**
 * useSessionRefresh Hook - Manually refresh session if needed
 */
export const useSessionRefresh = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.refreshSession();

      if (err) {
        setError(err.message);
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Refresh failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { refresh, loading, error };
};

/**
 * useProtectedRoute Hook - Protect routes that require authentication
 * 
 * Usage:
 * const { isAuthorized, loading } = useProtectedRoute();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (!isAuthorized) return <Navigate to="/login" />;
 * return <ProtectedComponent />;
 */
export const useProtectedRoute = () => {
  const { session, loading } = useAuth();
  
  return {
    isAuthorized: !!session,
    loading,
    userId: session?.user?.id
  };
};
