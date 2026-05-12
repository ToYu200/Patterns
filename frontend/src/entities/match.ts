import type { User } from './user';
import type { Game } from './game';
import type { Tournament } from './tournament';

export interface Match {
  id: string;
  tournamentId?: string;
  tournament?: Pick<Tournament, 'id' | 'name' | 'slug' | 'game'>;
  gameId: string;
  game: Pick<Game, 'id' | 'name' | 'slug' | 'maxPlayersPerTeam'>;
  roundNumber?: number;
  bracketPosition?: string;
  team1: MatchTeam;
  team2: MatchTeam;
  winnerId?: string;
  status: MatchStatus;
  result?: MatchResult;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  map?: string;
  bestOf: number;
  currentScore: MatchScore;
  playerStats: PlayerMatchStats[];
  settings: MatchSettings;
  metadata: MatchMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface MatchTeam {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  captainId: string;
  members: MatchPlayer[];
  isReady: boolean;
  checkedInAt?: string;
  substitutionRequests?: SubstitutionRequest[];
}

export interface MatchPlayer {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'nickname' | 'avatar'>;
  isCaptain: boolean;
  isSubstitute: boolean;
  isReady: boolean;
  joinedAt: string;
  checkedInAt?: string;
  connectionStatus: ConnectionStatus;
  lastSeenAt?: string;
}

export interface MatchResult {
  winner: 'team1' | 'team2' | 'draw';
  scores: GameScore[];
  duration: number; // in seconds
  forfeited: boolean;
  forfeitedBy?: 'team1' | 'team2';
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  disputes: MatchDispute[];
}

export interface GameScore {
  gameNumber: number;
  team1Score: number;
  team2Score: number;
  map?: string;
  duration: number;
  startedAt: string;
  completedAt: string;
  playerStats: PlayerGameStats[];
}

export interface MatchScore {
  team1Games: number;
  team2Games: number;
  currentGame: number;
}

export interface PlayerMatchStats {
  playerId: string;
  userId: string;
  teamId: string;
  totalStats: PlayerStats;
  gameStats: PlayerGameStats[];
  performance: PlayerPerformance;
}

export interface PlayerGameStats {
  gameId: number;
  playerId: string;
  teamId: string;
  stats: PlayerStats;
  duration: number; // in seconds
  startedAt: string;
  completedAt: string;
}

export interface PlayerStats {
  // Common stats across games
  kills?: number;
  deaths?: number;
  assists?: number;
  damage?: number;
  healing?: number;
  accuracy?: number;
  headshots?: number;
  // Game specific stats (JSONB flexible structure)
  customStats?: Record<string, number | string | boolean>;
  // Performance metrics
  rating?: number;
  ratingChange?: number;
  mvpPoints?: number;
}

export interface PlayerPerformance {
  rating: number;
  ratingChange: number;
  mvpVotes: number;
  kda?: number;
  efficiency?: number;
  contribution?: number;
  grade?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface MatchSettings {
  allowSpectators: boolean;
  spectatorPassword?: string;
  allowSubstitutes: boolean;
  maxSubstitutes: number;
  allowRescheduling: boolean;
  reschedulingDeadline?: number; // hours before match
  autoStart: boolean;
  streamingRequired: boolean;
  recordingRequired: boolean;
  mapSelectionMode: 'veto' | 'pick' | 'random' | 'preset';
  maps: string[];
}

export interface MatchMetadata {
  streamUrl?: string;
  vodUrl?: string;
  highlights?: string[];
  screenshots?: string[];
  demoUrl?: string;
  observerNotes?: string;
  casters?: MatchCaster[];
}

export interface MatchCaster {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'nickname' | 'avatar'>;
  language: string;
  platform: 'twitch' | 'youtube' | 'other';
  streamUrl?: string;
  isMain: boolean;
}

export interface SubstitutionRequest {
  id: string;
  teamId: string;
  playerIdOut: string;
  playerIdIn?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface MatchDispute {
  id: string;
  reporterId: string;
  reporter: Pick<User, 'id' | 'username' | 'nickname'>;
  type: DisputeType;
  description: string;
  evidence?: string[];
  status: DisputeStatus;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export type MatchStatus = 
  | 'scheduled'
  | 'preparing'
  | 'live'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'postponed'
  | 'disputed';

export type ConnectionStatus = 
  | 'offline'
  | 'connecting'
  | 'online'
  | 'away'
  | 'disconnected';

export type DisputeType = 
  | 'cheating'
  | 'rule_violation'
  | 'technical_issue'
  | 'substitution'
  | 'score_error'
  | 'other';

export type DisputeStatus = 
  | 'pending'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

export interface MatchPreview {
  id: string;
  tournament?: Pick<Tournament, 'id' | 'name' | 'slug'>;
  game: Pick<Game, 'id' | 'name' | 'slug'>;
  team1: {
    id: string;
    name: string;
    tag?: string;
    logo?: string;
  };
  team2: {
    id: string;
    name: string;
    tag?: string;
    logo?: string;
  };
  scheduledAt: string;
  status: MatchStatus;
  bestOf: number;
  currentScore?: MatchScore;
}
