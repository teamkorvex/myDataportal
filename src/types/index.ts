export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  authType: 'discord';
  discordId?: string;
  discordAvatar?: string;
  isPremium: boolean;
  isSuspended: boolean;
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

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}