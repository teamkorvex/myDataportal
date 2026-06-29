import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, DiscordUser } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminAuthenticated: boolean;
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

const ADMIN_PASSWORD = 'korvex1363N623ncKLA5Ang47674MAk6';

// Discord OAuth Config
const DISCORD_CLIENT_ID = '1483857198852603985';
const DISCORD_REDIRECT_URI = 'https://dataportal.korvex.xyz/myportal/dashboard';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('dropz_user');
    const storedAdminAuth = localStorage.getItem('dropz_admin_auth');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('dropz_user');
      }
    }
    
    if (storedAdminAuth) {
      setIsAdminAuthenticated(true);
    }
    
    // Initialize default users if none exist
    const storedUsers = localStorage.getItem('dropz_users');
    if (!storedUsers) {
      const defaultUsers = [
        {
          id: '1',
          username: 'korvex',
          email: 'korvex@dropz.xyz',
          createdAt: new Date().toISOString(),
          authType: 'discord',
          isPremium: true,
          isSuspended: false,
        },
        {
          id: '2',
          username: 'crews',
          email: 'crews@dropz.xyz',
          createdAt: new Date().toISOString(),
          authType: 'discord',
          isPremium: false,
          isSuspended: false,
        }
      ];
      localStorage.setItem('dropz_users', JSON.stringify(defaultUsers));
    }
    
    setIsLoading(false);
  }, []);

  const loginWithDiscord = useCallback(async (discordUser: DiscordUser, _accessToken: string): Promise<{ success: boolean; message?: string }> => {
    const storedUsers = localStorage.getItem('dropz_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists with this Discord ID
    let existingUser = users.find((u: any) => u.discordId === discordUser.id || u.username === discordUser.username);
    
    if (existingUser) {
      if (existingUser.isSuspended) {
        return { success: false, message: 'Your account has been suspended' };
      }
      
      // Update avatar if changed
      existingUser.discordAvatar = discordUser.avatar;
      existingUser.discordId = discordUser.id;
      const userIndex = users.findIndex((u: any) => u.id === existingUser.id);
      users[userIndex] = existingUser;
      localStorage.setItem('dropz_users', JSON.stringify(users));
      
      const userData: User = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email || discordUser.email,
        createdAt: existingUser.createdAt,
        authType: 'discord',
        discordId: existingUser.discordId,
        discordAvatar: existingUser.discordAvatar,
        isPremium: existingUser.isPremium,
        isSuspended: existingUser.isSuspended,
      };
      
      setUser(userData);
      localStorage.setItem('dropz_user', JSON.stringify(userData));
      return { success: true };
    }
    
    // Create new user from Discord
    const newUser = {
      id: Date.now().toString(),
      username: discordUser.username,
      email: discordUser.email || '',
      createdAt: new Date().toISOString(),
      authType: 'discord',
      discordId: discordUser.id,
      discordAvatar: discordUser.avatar,
      isPremium: false,
      isSuspended: false,
    };
    
    users.push(newUser);
    localStorage.setItem('dropz_users', JSON.stringify(users));
    
    const userData: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      authType: 'discord',
      discordId: newUser.discordId,
      discordAvatar: newUser.discordAvatar,
      isPremium: newUser.isPremium,
      isSuspended: newUser.isSuspended,
    };
    
    setUser(userData);
    localStorage.setItem('dropz_user', JSON.stringify(userData));
    
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('dropz_user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('dropz_user', JSON.stringify(updatedUser));
    
    // Also update in users list
    const storedUsers = localStorage.getItem('dropz_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('dropz_users', JSON.stringify(users));
      }
    }
  }, [user]);

  // Admin functions
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

  const getAllUsers = useCallback((): User[] => {
    const storedUsers = localStorage.getItem('dropz_users');
    if (!storedUsers) return [];
    
    const users = JSON.parse(storedUsers);
    return users.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
      authType: u.authType,
      discordId: u.discordId,
      discordAvatar: u.discordAvatar,
      isPremium: u.isPremium,
      isSuspended: u.isSuspended,
    }));
  }, []);

  const updateUserByAdmin = useCallback((userId: string, updates: Partial<User>): boolean => {
    const storedUsers = localStorage.getItem('dropz_users');
    if (!storedUsers) return false;
    
    const users = JSON.parse(storedUsers);
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('dropz_users', JSON.stringify(users));
    
    // If updating current user, update session too
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('dropz_user', JSON.stringify(updatedUser));
    }
    
    return true;
  }, [user]);

  const deleteUser = useCallback((userId: string): boolean => {
    const storedUsers = localStorage.getItem('dropz_users');
    if (!storedUsers) return false;
    
    const users = JSON.parse(storedUsers);
    const filteredUsers = users.filter((u: any) => u.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem('dropz_users', JSON.stringify(filteredUsers));
    
    // Also delete user's documents
    const storedDocs = localStorage.getItem('dropz_documents');
    if (storedDocs) {
      const allDocs = JSON.parse(storedDocs);
      const filteredDocs = allDocs.filter((d: any) => d.userId !== userId);
      localStorage.setItem('dropz_documents', JSON.stringify(filteredDocs));
    }
    
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