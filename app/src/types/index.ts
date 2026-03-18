export interface User {
  id: string;
  username: string;
  email?: string;
  twoFactorCode: string;
  createdAt: string;
  authType: 'local' | 'discord';
  discordId?: string;
  discordAvatar?: string;
  rank: 'standard' | 'premium';
  suspended: boolean;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'text' | 'file';
  fileType?: string;
  fileData?: string;
  fileName?: string;
  fileSize?: number;
  sharedWith: string[]; // Array of usernames who have access
  updatedAt: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  twoFactorCode: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}
