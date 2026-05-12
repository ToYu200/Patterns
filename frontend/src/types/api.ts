import type { User, UserRole } from '../entities/user';
import type { Game, GameGenre, TeamMode } from '../entities/game';
import type { Community, CommunityRole } from '../entities/community';
import type { 
  Tournament, 
  TournamentStatus, 
  TournamentFormat, 
  TournamentType,
  TournamentSettings 
} from '../entities/tournament';
import type { 
  TournamentRegistration, 
  RegistrationType, 
  RegistrationStatus 
} from '../entities/tournament-registration';
import type { 
  Match, 
  MatchStatus, 
  MatchResult,
  PlayerMatchStats 
} from '../entities/match';
import type { ApiParams, ApiResponse, PaginatedResponse } from './common';

// ==================== AUTH ====================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname: string;
  country?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  token: string;
  newPassword: string;
}

// ==================== USERS ====================

export interface GetUsersParams extends ApiParams {
  role?: UserRole;
  isActive?: boolean;
  country?: string;
}

export interface UpdateUserRequest {
  username?: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    privacyProfile?: boolean;
    privacyStats?: boolean;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== GAMES ====================

export interface GetGamesParams extends ApiParams {
  genre?: GameGenre;
  teamMode?: TeamMode;
  isActive?: boolean;
}

export interface CreateGameRequest {
  name: string;
  slug: string;
  description: string;
  genre: GameGenre;
  maxPlayersPerTeam: number;
  minPlayersPerTeam: number;
  teamMode: TeamMode;
  estimatedMatchDuration: number;
  rules: string;
  setupRequirements?: {
    minLevel?: number;
    requiredRank?: string;
    equipment?: string[];
    rules: string[];
  };
}

export interface UpdateGameRequest {
  name?: string;
  description?: string;
  genre?: GameGenre;
  maxPlayersPerTeam?: number;
  minPlayersPerTeam?: number;
  teamMode?: TeamMode;
  estimatedMatchDuration?: number;
  isActive?: boolean;
  rules?: string;
  setupRequirements?: {
    minLevel?: number;
    requiredRank?: string;
    equipment?: string[];
    rules: string[];
  };
}

// ==================== COMMUNITIES ====================

export interface GetCommunitiesParams extends ApiParams {
  isPublic?: boolean;
  ownerId?: string;
  tags?: string[];
}

export interface CreateCommunityRequest {
  name: string;
  slug: string;
  description: string;
  isPublic: boolean;
  isJoinRequestRequired: boolean;
  maxMembers: number;
  rules: string[];
  tags: string[];
  settings?: {
    allowMemberInvites?: boolean;
    allowMemberTournaments?: boolean;
    requireApprovalForTournaments?: boolean;
    defaultTournamentPrizePool?: number;
    autoKickInactiveDays?: number;
  };
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  isPublic?: boolean;
  isJoinRequestRequired?: boolean;
  maxMembers?: number;
  rules?: string[];
  tags?: string[];
  settings?: {
    allowMemberInvites?: boolean;
    allowMemberTournaments?: boolean;
    requireApprovalForTournaments?: boolean;
    defaultTournamentPrizePool?: number;
    autoKickInactiveDays?: number;
  };
}

export interface JoinCommunityRequest {
  message?: string;
}

export interface CommunityInviteRequest {
  userId: string;
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: CommunityRole;
}

// ==================== TOURNAMENTS ====================

export interface GetTournamentsParams extends ApiParams {
  gameId?: string;
  organizerId?: string;
  status?: TournamentStatus[];
  format?: TournamentFormat;
  type?: TournamentType;
  hasPrize?: boolean;
  minPrize?: number;
  maxPrize?: number;
  registrationOpen?: boolean;
}

export interface CreateTournamentRequest {
  name: string;
  slug: string;
  description: string;
  gameId: string;
  format: TournamentFormat;
  type: TournamentType;
  maxParticipants: number;
  prizePool: {
    totalAmount: number;
    currency: string;
    distribution: Array<{
      position: number;
      amount: number;
      percentage: number;
      description?: string;
    }>;
  };
  schedule: {
    registrationStart: string;
    registrationEnd: string;
    checkInStart?: string;
    checkInEnd?: string;
    startAt: string;
    estimatedEndAt: string;
    matchDuration: number;
    breakDuration?: number;
  };
  rules: string[];
  requirements: {
    minLevel?: number;
    minRating?: number;
    maxRating?: number;
    requiredRank?: string;
    teamSize: {
      min: number;
      max: number;
    };
    ageRestriction?: number;
    regionRestriction?: string[];
    equipment?: string[];
  };
  settings: TournamentSettings;
  coverImage?: string;
}

export interface UpdateTournamentRequest {
  name?: string;
  description?: string;
  maxParticipants?: number;
  prizePool?: {
    totalAmount: number;
    currency: string;
    distribution: Array<{
      position: number;
      amount: number;
      percentage: number;
      description?: string;
    }>;
  };
  schedule?: {
    registrationStart?: string;
    registrationEnd?: string;
    checkInStart?: string;
    checkInEnd?: string;
    startAt?: string;
    estimatedEndAt?: string;
    matchDuration?: number;
    breakDuration?: number;
  };
  rules?: string[];
  requirements?: {
    minLevel?: number;
    minRating?: number;
    maxRating?: number;
    requiredRank?: string;
    teamSize?: {
      min: number;
      max: number;
    };
    ageRestriction?: number;
    regionRestriction?: string[];
    equipment?: string[];
  };
  settings?: TournamentSettings;
  coverImage?: string;
}

export interface UpdateTournamentStatusRequest {
  status: TournamentStatus;
  reason?: string;
}

// ==================== TOURNAMENT REGISTRATIONS ====================

export interface GetRegistrationsParams extends ApiParams {
  tournamentId?: string;
  userId?: string;
  type?: RegistrationType;
  status?: RegistrationStatus[];
}

export interface CreateRegistrationRequest {
  tournamentId: string;
  type: RegistrationType;
  teamId?: string;
  registrationData: {
    answers?: Array<{
      questionId: string;
      answer: string | string[] | boolean | number;
    }>;
    documents?: Array<{
      type: string;
      fileName: string;
      fileUrl: string;
    }>;
    customFields?: Record<string, any>;
    acceptedRules: boolean;
    acceptedTerms: boolean;
    contactInfo?: {
      email: string;
      phone?: string;
      discord?: string;
      telegram?: string;
      preferredContact: 'email' | 'phone' | 'discord' | 'telegram';
    };
  };
  notes?: string;
}

export interface UpdateRegistrationRequest {
  status: RegistrationStatus;
  rejectionReason?: string;
  notes?: string;
}

export interface CheckInRequest {
  tournamentId: string;
  registrationId: string;
}

// ==================== MATCHES ====================

export interface GetMatchesParams extends ApiParams {
  tournamentId?: string;
  gameId?: string;
  teamId?: string;
  playerId?: string;
  status?: MatchStatus[];
  scheduledFrom?: string;
  scheduledTo?: string;
}

export interface CreateMatchRequest {
  tournamentId?: string;
  gameId: string;
  team1Id: string;
  team2Id: string;
  scheduledAt: string;
  bestOf: number;
  map?: string;
  settings?: {
    allowSpectators?: boolean;
    spectatorPassword?: string;
    allowSubstitutes?: boolean;
    maxSubstitutes?: number;
    allowRescheduling?: boolean;
    reschedulingDeadline?: number;
    autoStart?: boolean;
    streamingRequired?: boolean;
    recordingRequired?: boolean;
    mapSelectionMode?: 'veto' | 'pick' | 'random' | 'preset';
    maps?: string[];
  };
}

export interface UpdateMatchRequest {
  scheduledAt?: string;
  bestOf?: number;
  map?: string;
  settings?: {
    allowSpectators?: boolean;
    spectatorPassword?: string;
    allowSubstitutes?: boolean;
    maxSubstitutes?: number;
    allowRescheduling?: boolean;
    reschedulingDeadline?: number;
    autoStart?: boolean;
    streamingRequired?: boolean;
    recordingRequired?: boolean;
    mapSelectionMode?: 'veto' | 'pick' | 'random' | 'preset';
    maps?: string[];
  };
}

export interface SubmitMatchResultRequest {
  result: MatchResult;
  playerStats: PlayerMatchStats[];
}

export interface UpdateMatchStatusRequest {
  status: MatchStatus;
  reason?: string;
}

export interface RescheduleMatchRequest {
  newScheduledAt: string;
  reason: string;
}

export interface SubstitutePlayerRequest {
  playerIdOut: string;
  playerIdIn: string;
  reason: string;
}

export interface ReportMatchRequest {
  type: 'cheating' | 'rule_violation' | 'technical_issue' | 'substitution' | 'score_error' | 'other';
  description: string;
  evidence?: string[];
}

// ==================== FILES ====================

export interface UploadFileRequest {
  file: File;
  type: 'avatar' | 'cover' | 'document' | 'demo' | 'screenshot';
  entityType: 'user' | 'community' | 'tournament' | 'match';
  entityId: string;
}

export interface UploadFileResponse {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// ==================== SEARCH ====================

export interface SearchRequest {
  query: string;
  type?: 'users' | 'communities' | 'tournaments' | 'games' | 'all';
  filters?: Record<string, any>;
  limit?: number;
}

export interface SearchResponse {
  users?: User[];
  communities?: Community[];
  tournaments?: Tournament[];
  games?: Game[];
  total: number;
}

// ==================== NOTIFICATIONS ====================

export interface GetNotificationsParams extends ApiParams {
  isRead?: boolean;
  type?: string[];
}

export interface MarkNotificationReadRequest {
  notificationIds: string[];
}

export interface MarkAllNotificationsReadRequest {
  type?: string;
}

// ==================== STATISTICS ====================

export interface GetUserStatsRequest {
  userId?: string;
  gameId?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

export interface GetTournamentStatsRequest {
  tournamentId: string;
}

export interface GetCommunityStatsRequest {
  communityId: string;
}

export interface GetGameStatsRequest {
  gameId: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

// ==================== API RESPONSE TYPES ====================

export type UsersResponse = PaginatedResponse<User>;
export type UserResponse = ApiResponse<User>;
export type GamesResponse = PaginatedResponse<Game>;
export type GameResponse = ApiResponse<Game>;
export type CommunitiesResponse = PaginatedResponse<Community>;
export type CommunityResponse = ApiResponse<Community>;
export type TournamentsResponse = PaginatedResponse<Tournament>;
export type TournamentResponse = ApiResponse<Tournament>;
export type RegistrationsResponse = PaginatedResponse<TournamentRegistration>;
export type RegistrationResponse = ApiResponse<TournamentRegistration>;
export type MatchesResponse = PaginatedResponse<Match>;
export type MatchResponse = ApiResponse<Match>;
export type SearchResponseTyped = ApiResponse<SearchResponse>;
export type NotificationsResponse = PaginatedResponse<{
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}>;
