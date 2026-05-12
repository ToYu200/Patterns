export interface User {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  isActive: boolean;
  isVerified: boolean;
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentRating: number;
  peakRating: number;
  gamesPlayed: number;
  favoriteGameId?: string;
  achievements: string[];
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privacyProfile: boolean;
  privacyStats: boolean;
}

export type UserRole = 'player' | 'organizer' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  country?: string;
  stats: UserStats;
  isOnline: boolean;
  lastActiveAt?: string;
  joinedAt: string;
}
