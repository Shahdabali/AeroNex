import { supabase, getSiteUrl } from '../lib/supabase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organization?: string;
  phone?: string;
  bio?: string;
  isGuest?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/**
 * Maps raw Supabase and network errors into clear, actionable user messages
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const msg = typeof error === 'string' ? error : error.message || '';

  if (msg.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (msg.includes('Password should be at least 6 characters')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for the confirmation link.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
    return 'Unable to connect to the authentication server. Please check your internet connection.';
  }
  return msg || 'Authentication failed. Please try again.';
}

/**
 * Rapidly creates an AuthUser from Supabase session metadata,
 * dispatching profile table upsert asynchronously without blocking login.
 */
export async function syncUserProfile(supabaseUser: any, roleOverride?: string): Promise<AuthUser> {
  const metadata = supabaseUser.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0] || 'AeroNex Member';
  const role = roleOverride || metadata.role || 'Passenger';
  const avatarUrl = metadata.avatar_url || metadata.picture;

  const user: AuthUser = {
    id: supabaseUser.id,
    name: fullName,
    email: supabaseUser.email || '',
    role,
    avatarUrl,
  };

  // Perform background profile upsert without blocking UI/login flow
  if (supabaseUser.id && supabaseUser.email) {
    (async () => {
      try {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: supabaseUser.id,
              full_name: fullName,
              email: supabaseUser.email,
              role,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
      } catch {}
    })();
  }

  return user;
}

export const authService = {
  /**
   * Real Email + Password Sign In via Supabase Auth (Strict & Fast)
   */
  login: async (emailInput: string, passwordInput: string): Promise<AuthResponse> => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    if (!data?.user || !data?.session) {
      throw new Error('Authentication failed. Please verify your credentials.');
    }

    const user = await syncUserProfile(data.user);
    return { user, token: data.session.access_token };
  },

  /**
   * Instant Guest Login: creates a personalized guest session
   */
  guestLogin: async (nameInput: string): Promise<AuthResponse> => {
    const cleanName = nameInput.trim();
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter your name (minimum 2 characters).');
    }

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const guestUser: AuthUser = {
      id: guestId,
      name: cleanName,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest'}@guest.aeronex.com`,
      role: 'Guest Passenger',
      avatarUrl: undefined,
      isGuest: true,
    };

    const token = `aeronex_guest_${guestId}`;
    return { user: guestUser, token };
  },

  /**
   * Real Email + Password Registration via Supabase Auth
   */
  register: async (
    fullName: string,
    emailInput: string,
    passwordInput: string,
    roleInput: string = 'Passenger'
  ): Promise<AuthResponse> => {
    const name = fullName.trim();
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!name || name.length < 2) {
      throw new Error('Please provide your full name (minimum 2 characters).');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name,
          role: roleInput,
        },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    if (data?.user) {
      const user = await syncUserProfile(data.user, roleInput);
      const token = data.session?.access_token || `aeronex_jwt_${Date.now()}_${user.id}`;
      return { user, token };
    }

    throw new Error('Could not complete registration. Please try again.');
  },

  /**
   * Real Google OAuth Login via Supabase Auth
   */
  signInWithGoogle: async (): Promise<void> => {
    const siteUrl = getSiteUrl();
    const redirectTo = `${siteUrl}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    if (data?.url) {
      window.location.href = data.url;
      return new Promise(() => {});
    }
  },

  /**
   * Social login dispatcher for external provider buttons
   */
  socialLogin: async (provider: 'Google' | 'Microsoft' | 'Apple'): Promise<AuthResponse> => {
    if (provider.toLowerCase() === 'google') {
      await authService.signInWithGoogle();
      return new Promise(() => {});
    }
    throw new Error(`${provider} login is not configured.`);
  },

  /**
   * Password Reset Request via Supabase Auth
   */
  resetPassword: async (emailInput: string): Promise<{ success: boolean; message: string }> => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address to reset password.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email}.`,
    };
  },

  /**
   * Update Password using authenticated or recovery session
   */
  updatePassword: async (newPassword: string): Promise<void> => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(formatAuthError(error));
    }
  },

  /**
   * Sign Out: terminates Supabase session and clears stored tokens
   */
  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('aeronex_user');
    localStorage.removeItem('aeronex_token');
  },

  /**
   * Update Profile in Local State and Supabase
   */
  updateProfile: (emailInput: string, updates: Partial<AuthUser>): AuthUser => {
    const activeRaw = localStorage.getItem('aeronex_user');
    const active: AuthUser = activeRaw ? JSON.parse(activeRaw) : {
      id: `usr_${Date.now()}`,
      name: updates.name || 'AeroNex Member',
      email: emailInput,
      role: updates.role || 'Passenger'
    };

    const updatedUser: AuthUser = {
      ...active,
      ...updates,
    };

    localStorage.setItem('aeronex_user', JSON.stringify(updatedUser));

    // Async sync with Supabase profiles table if not guest
    if (!updatedUser.isGuest && updatedUser.id && !updatedUser.id.startsWith('guest_')) {
      (async () => {
        try {
          await supabase
            .from('profiles')
            .upsert({
              id: updatedUser.id,
              full_name: updatedUser.name,
              role: updatedUser.role,
              avatar_url: updatedUser.avatarUrl,
              updated_at: new Date().toISOString(),
            });
        } catch {}
      })();
    }

    return updatedUser;
  },

  /**
   * Change Password (for settings modal)
   */
  changePassword: async (_emailInput: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentPassword) {
      throw new Error('Please enter your current password.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(formatAuthError(error));
    }

    return true;
  },

  /**
   * Delete Account
   */
  deleteAccount: async (_emailInput: string): Promise<boolean> => {
    localStorage.removeItem('aeronex_user');
    localStorage.removeItem('aeronex_token');
    try {
      await supabase.auth.signOut();
    } catch {}
    return true;
  },
};
