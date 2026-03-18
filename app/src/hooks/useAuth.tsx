import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { userAPI, authAPI } from '@/services/api';
import type { User, LoginCredentials, RegisterData, DiscordUser } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingUser: User | null;
  isAdminAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  loginWithDiscord: (discordUser: DiscordUser, accessToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verifyAdminPassword: (password: string) => boolean;
  adminLogout: () => void;
  getAllUsers: () => Promise<User[]>;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-defined credentials
const VALID_USERNAME = 'korvex';
const VALID_PASSWORD = 'korvex1363N623ncKLA5Ang47674MAk6';
const ADMIN_PASSWORD = 'korvex1363N623ncKLA5Ang47674MAk6';

// Discord OAuth Config
const DISCORD_CLIENT_ID = '1483857198852603985';
const DISCORD_REDIRECT_URI = 'https://dataportal.korvex.xyz/myportal/dashboard';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load user from localStorage on mount (for session persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('dataportal_user');
    const storedAdminAuth = localStorage.getItem('dataportal_admin_auth');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('dataportal_user');
      }
    }
    
    if (storedAdminAuth) {
      setIsAdminAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; requires2FA?: boolean; message?: string }> => {
    try {
      // Check for pre-defined user first (fallback)
      if (credentials.username === VALID_USERNAME && credentials.password === VALID_PASSWORD) {
        const result = await authAPI.login(credentials.username, credentials.password);
        if (result.user) {
          setPendingUser(result.user);
          return { success: true, requires2FA: true };
        }
      }
      
      const result = await authAPI.login(credentials.username, credentials.password);
      
      if (result.user) {
        setPendingUser(result.user);
        return { success: true, requires2FA: true };
      }
      
      return { success: false, message: 'Invalid username or password' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }, []);

  const verify2FA = useCallback(async (code: string): Promise<{ success: boolean; message?: string }> => {
    if (!pendingUser) {
      return { success: false, message: 'No pending login' };
    }
    
    try {
      const result = await authAPI.verify2FA(pendingUser.id, code);
      
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('dataportal_user', JSON.stringify(result.user));
        setPendingUser(null);
        return { success: true };
      }
      
      return { success: false, message: 'Invalid 2FA code' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Verification failed' };
    }
  }, [pendingUser]);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      // Validate 2FA code format (4 digits)
      if (!/^\d{4}$/.test(data.twoFactorCode)) {
        return { success: false, message: '2FA code must be 4 digits' };
      }
      
      const newUser = await userAPI.create({
        username: data.username,
        email: data.email,
        password: data.password,
        twoFactorCode: data.twoFactorCode,
        authType: 'local',
        rank: 'standard',
        suspended: false
      });
      
      // Auto-login after registration
      setUser(newUser);
      localStorage.setItem('dataportal_user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }, []);

  const loginWithDiscord = useCallback(async (discordUser: DiscordUser, _accessToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await authAPI.discord(
        discordUser.id,
        discordUser.username,
        discordUser.email,
        discordUser.avatar
      );
      
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('dataportal_user', JSON.stringify(result.user));
        return { success: true };
      }
      
      return { success: false, message: result.message || 'Discord login failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Discord login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPendingUser(null);
    localStorage.removeItem('dataportal_user');
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await userAPI.update(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('dataportal_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [user]);

  // Admin functions
  const verifyAdminPassword = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('dataportal_admin_auth', 'true');
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('dataportal_admin_auth');
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      return await userAPI.getAll();
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }, []);

  const updateUserByAdmin = useCallback(async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      await userAPI.update(userId, updates);
      
      // If updating current user, update session too
      if (user && user.id === userId) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('dataportal_user', JSON.stringify(updatedUser));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  }, [user]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await userAPI.delete(userId);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        pendingUser,
        isAdminAuthenticated,
        login,
        verify2FA,
        register,
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

// Export Discord OAuth URL builder
export function getDiscordOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: DISCORD_REDIRECT_URI,
    scope: 'identify email',
  });
  
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
