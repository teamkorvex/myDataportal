import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminAuthenticated: boolean;
  loginWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  verifyAdminPassword: (password: string) => boolean;
  adminLogout: () => void;
  getAllUsers: () => Promise<User[]>;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'korvex1363N623ncKLA5Ang47674MAk6';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Fetch profile from public.profiles
  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        const userData: User = {
          id: data.id,
          username: data.username || 'User',
          email: data.email || email,
          createdAt: data.created_at,
          authType: 'discord',
          discordId: data.id,
          discordAvatar: data.avatar_url,
          isPremium: data.is_premium || false,
          isSuspended: data.is_suspended || false,
        };
        return userData;
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
    return null;
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    const storedAdminAuth = localStorage.getItem('dropz_admin_auth');
    if (storedAdminAuth) {
      setIsAdminAuthenticated(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email);
        if (profile) {
          if (profile.isSuspended) {
            toast.error('Your account has been suspended');
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(profile);
          }
        } else {
          // Fallback if profile trigger hasn't finished yet
          const fallbackUser: User = {
            id: session.user.id,
            username: session.user.user_metadata.custom_claims_username || session.user.user_metadata.full_name || 'User',
            email: session.user.email,
            createdAt: session.user.created_at,
            authType: 'discord',
            discordId: session.user.id,
            discordAvatar: session.user.user_metadata.avatar_url,
            isPremium: false,
            isSuspended: false,
          };
          setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithDiscord = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) {
      toast.error(error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    const profileUpdates: any = {};
    if (updates.username) profileUpdates.username = updates.username;
    if (updates.discordAvatar) profileUpdates.avatar_url = updates.discordAvatar;

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile: ' + error.message);
    } else {
      setUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    }
  }, [user]);

  const verifyAdminPassword = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('dropz_admin_auth', 'true');
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('dropz_admin_auth');
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      toast.error('Failed to fetch users: ' + error.message);
      return [];
    }

    return (data || []).map(u => ({
      id: u.id,
      username: u.username || 'User',
      email: u.email,
      createdAt: u.created_at,
      authType: 'discord',
      discordId: u.id,
      discordAvatar: u.avatar_url,
      isPremium: u.is_premium || false,
      isSuspended: u.is_suspended || false,
    }));
  }, []);

  const updateUserByAdmin = useCallback(async (userId: string, updates: Partial<User>): Promise<boolean> => {
    const profileUpdates: any = {};
    if (updates.username !== undefined) profileUpdates.username = updates.username;
    if (updates.email !== undefined) profileUpdates.email = updates.email;
    if (updates.isPremium !== undefined) profileUpdates.is_premium = updates.isPremium;
    if (updates.isSuspended !== undefined) profileUpdates.is_suspended = updates.isSuspended;

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user: ' + error.message);
      return false;
    }

    toast.success('User updated successfully');
    return true;
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      toast.error('Failed to delete user: ' + error.message);
      return false;
    }

    toast.success('User deleted successfully');
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdminAuthenticated,
        loginWithDiscord,
        logout,
        updateUser,
        verifyAdminPassword,
        adminLogout,
        getAllUsers,
        updateUserByAdmin,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getDiscordOAuthUrl(): string {
  return 'https://discord.com/oauth2/authorize?client_id=1521231361174933605&response_type=code&redirect_uri=https%3A%2F%2Fautgttuxjboppqjmpkfk.supabase.co%2Fauth%2Fv1%2Fcallback&scope=identify';
}