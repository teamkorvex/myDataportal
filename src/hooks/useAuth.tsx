import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  getAllUsers: () => User[];
  updateUserByAdmin: (userId: string, updates: Partial<User>) => boolean;
  deleteUser: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-defined credentials
const VALID_USERNAME = 'korvex';
const VALID_PASSWORD = 'korvex1363N623ncKLA5Ang47674MAk6';
const VALID_2FA_CODE = '0578';
const ADMIN_PASSWORD = 'korvex1363N623ncKLA5Ang47674MAk6'; // Same as login password

// Discord OAuth Config
const DISCORD_CLIENT_ID = '1483857198852603985';
const DISCORD_REDIRECT_URI = 'https://dataportal.korvex.xyz/myportal/dashboard';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('dataportal_user');
    const storedUsers = localStorage.getItem('dataportal_users');
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
    
    // Initialize default users if none exist
    if (!storedUsers) {
      const defaultUsers = [
        {
          id: '1',
          username: VALID_USERNAME,
          email: 'korvex@dataportal.com',
          password: VALID_PASSWORD,
          twoFactorCode: VALID_2FA_CODE,
          createdAt: new Date().toISOString(),
          authType: 'local',
          isPremium: true,
          isSuspended: false,
        },
        {
          id: '2',
          username: 'crews',
          email: 'crews@dataportal.com',
          password: 'crews123',
          twoFactorCode: '0000',
          createdAt: new Date().toISOString(),
          authType: 'local',
          isPremium: false,
          isSuspended: false,
        }
      ];
      localStorage.setItem('dataportal_users', JSON.stringify(defaultUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; requires2FA?: boolean; message?: string }> => {
    const storedUsers = localStorage.getItem('dataportal_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check for pre-defined user
    if (credentials.username === VALID_USERNAME && credentials.password === VALID_PASSWORD) {
      const preDefinedUser = users.find((u: any) => u.username === VALID_USERNAME);
      if (preDefinedUser && !preDefinedUser.isSuspended) {
        setPendingUser({
          id: preDefinedUser.id,
          username: preDefinedUser.username,
          email: preDefinedUser.email,
          twoFactorCode: preDefinedUser.twoFactorCode,
          createdAt: preDefinedUser.createdAt,
          authType: preDefinedUser.authType,
          isPremium: preDefinedUser.isPremium,
          isSuspended: preDefinedUser.isSuspended,
        });
        return { success: true, requires2FA: true };
      }
    }
    
    // Check for registered users
    const foundUser = users.find((u: any) => 
      u.username === credentials.username && 
      u.password === credentials.password &&
      !u.isSuspended
    );
    
    if (foundUser) {
      setPendingUser({
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        twoFactorCode: foundUser.twoFactorCode,
        createdAt: foundUser.createdAt,
        authType: foundUser.authType,
        discordId: foundUser.discordId,
        discordAvatar: foundUser.discordAvatar,
        isPremium: foundUser.isPremium,
        isSuspended: foundUser.isSuspended,
      });
      return { success: true, requires2FA: true };
    }
    
    // Check if user exists but is suspended
    const suspendedUser = users.find((u: any) => 
      u.username === credentials.username && 
      u.password === credentials.password &&
      u.isSuspended
    );
    
    if (suspendedUser) {
      return { success: false, message: 'Your account has been suspended' };
    }
    
    return { success: false, message: 'Invalid username or password' };
  }, []);

  const verify2FA = useCallback(async (code: string): Promise<{ success: boolean; message?: string }> => {
    if (!pendingUser) {
      return { success: false, message: 'No pending login' };
    }
    
    if (code === pendingUser.twoFactorCode) {
      setUser(pendingUser);
      localStorage.setItem('dataportal_user', JSON.stringify(pendingUser));
      setPendingUser(null);
      return { success: true };
    }
    
    return { success: false, message: 'Invalid 2FA code' };
  }, [pendingUser]);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    const storedUsers = localStorage.getItem('dataportal_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if username already exists
    if (users.some((u: any) => u.username === data.username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (data.email && users.some((u: any) => u.email === data.email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    // Validate 2FA code format (4 digits)
    if (!/^\d{4}$/.test(data.twoFactorCode)) {
      return { success: false, message: '2FA code must be 4 digits' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      password: data.password,
      twoFactorCode: data.twoFactorCode,
      createdAt: new Date().toISOString(),
      authType: 'local',
      isPremium: false,
      isSuspended: false,
    };
    
    users.push(newUser);
    localStorage.setItem('dataportal_users', JSON.stringify(users));
    
    // Auto-login after registration
    const userWithoutPassword: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      twoFactorCode: newUser.twoFactorCode,
      createdAt: newUser.createdAt,
      authType: 'local',
      isPremium: newUser.isPremium,
      isSuspended: newUser.isSuspended,
    };
    
    setUser(userWithoutPassword);
    localStorage.setItem('dataportal_user', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  }, []);

  const loginWithDiscord = useCallback(async (discordUser: DiscordUser, _accessToken: string): Promise<{ success: boolean; message?: string }> => {
    const storedUsers = localStorage.getItem('dataportal_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists with this Discord ID
    let existingUser = users.find((u: any) => u.discordId === discordUser.id);
    
    if (existingUser) {
      if (existingUser.isSuspended) {
        return { success: false, message: 'Your account has been suspended' };
      }
      
      // Update avatar if changed
      if (existingUser.discordAvatar !== discordUser.avatar) {
        existingUser.discordAvatar = discordUser.avatar;
        const userIndex = users.findIndex((u: any) => u.id === existingUser.id);
        users[userIndex] = existingUser;
        localStorage.setItem('dataportal_users', JSON.stringify(users));
      }
      
      const userData = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email || discordUser.email,
        twoFactorCode: existingUser.twoFactorCode,
        createdAt: existingUser.createdAt,
        authType: 'discord' as const,
        discordId: existingUser.discordId,
        discordAvatar: existingUser.discordAvatar || discordUser.avatar,
        isPremium: existingUser.isPremium,
        isSuspended: existingUser.isSuspended,
      };
      
      setUser(userData);
      localStorage.setItem('dataportal_user', JSON.stringify(userData));
      return { success: true };
    }
    
    // Create new user from Discord
    const newUser = {
      id: Date.now().toString(),
      username: discordUser.username,
      email: discordUser.email || '',
      password: '', // No password for Discord users
      twoFactorCode: '0000', // Default 2FA for Discord users
      createdAt: new Date().toISOString(),
      authType: 'discord',
      discordId: discordUser.id,
      discordAvatar: discordUser.avatar,
      isPremium: false,
      isSuspended: false,
    };
    
    users.push(newUser);
    localStorage.setItem('dataportal_users', JSON.stringify(users));
    
    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      twoFactorCode: newUser.twoFactorCode,
      createdAt: newUser.createdAt,
      authType: 'discord' as const,
      discordId: newUser.discordId,
      discordAvatar: newUser.discordAvatar,
      isPremium: newUser.isPremium,
      isSuspended: newUser.isSuspended,
    };
    
    setUser(userData);
    localStorage.setItem('dataportal_user', JSON.stringify(userData));
    
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPendingUser(null);
    localStorage.removeItem('dataportal_user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('dataportal_user', JSON.stringify(updatedUser));
    
    // Also update in users list
    const storedUsers = localStorage.getItem('dataportal_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('dataportal_users', JSON.stringify(users));
      }
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

  const getAllUsers = useCallback((): User[] => {
    const storedUsers = localStorage.getItem('dataportal_users');
    if (!storedUsers) return [];
    
    const users = JSON.parse(storedUsers);
    return users.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      twoFactorCode: u.twoFactorCode,
      createdAt: u.createdAt,
      authType: u.authType,
      discordId: u.discordId,
      discordAvatar: u.discordAvatar,
      isPremium: u.isPremium,
      isSuspended: u.isSuspended,
    }));
  }, []);

  const updateUserByAdmin = useCallback((userId: string, updates: Partial<User>): boolean => {
    const storedUsers = localStorage.getItem('dataportal_users');
    if (!storedUsers) return false;
    
    const users = JSON.parse(storedUsers);
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('dataportal_users', JSON.stringify(users));
    
    // If updating current user, update session too
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('dataportal_user', JSON.stringify(updatedUser));
    }
    
    return true;
  }, [user]);

  const deleteUser = useCallback((userId: string): boolean => {
    const storedUsers = localStorage.getItem('dataportal_users');
    if (!storedUsers) return false;
    
    const users = JSON.parse(storedUsers);
    const filteredUsers = users.filter((u: any) => u.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem('dataportal_users', JSON.stringify(filteredUsers));
    
    // Also delete user's documents
    const storedDocs = localStorage.getItem('dataportal_documents');
    if (storedDocs) {
      const allDocs = JSON.parse(storedDocs);
      const filteredDocs = allDocs.filter((d: any) => d.userId !== userId);
      localStorage.setItem('dataportal_documents', JSON.stringify(filteredDocs));
    }
    
    return true;
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
