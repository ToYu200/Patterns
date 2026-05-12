export interface Tournament {
  id: string;
  name: string;
  slug: string;
  description: string;
  gameId: string;
  game: {
    id: string;
    name: string;
    slug: string;
  };
  organizerId: string;
  organizer: TournamentOrganizer;
  status: TournamentStatus;
  format: TournamentFormat;
  type: TournamentType;
  maxParticipants: number;
  currentParticipants: number;
  registeredTeams: TournamentTeam[];
  prizePool: TournamentPrizePool;
  schedule: TournamentSchedule;
  rules: string[];
  requirements: TournamentRequirements;
  settings: TournamentSettings;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  startsAt: string;
  endsAt?: string;
  stats: TournamentStats;
}

export interface TournamentOrganizer {
  id: string;
  type: 'user' | 'community';
  name: string;
  avatar?: string;
  isVerified: boolean;
}

export interface TournamentTeam {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  captainId: string;
  members: TournamentTeamMember[];
  status: TeamRegistrationStatus;
  registeredAt: string;
  seedNumber?: number;
  currentMatchId?: string;
  eliminatedAt?: string;
  finalPosition?: number;
}

export interface TournamentTeamMember {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
  };
  isCaptain: boolean;
  isSubstitute: boolean;
  joinedAt: string;
}

export interface TournamentPrizePool {
  totalAmount: number;
  currency: string;
  distribution: PrizeDistribution[];
  sponsoredBy?: string[];
}

export interface PrizeDistribution {
  position: number;
  amount: number;
  percentage: number;
  description?: string;
}

export interface TournamentSchedule {
  registrationStart: string;
  registrationEnd: string;
  checkInStart?: string;
  checkInEnd?: string;
  startAt: string;
  estimatedEndAt: string;
  matchDuration: number; // in minutes
  breakDuration?: number; // in minutes between matches
}

export interface TournamentRequirements {
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
}

export interface TournamentSettings {
  allowSubstitutes: boolean;
  maxSubstitutes: number;
  allowRescheduling: boolean;
  reschedulingDeadline?: number; // hours before match
  autoStartMatches: boolean;
  streamingRequired: boolean;
  recordingRequired: boolean;
  disallowedMaps?: string[];
  allowedMaps?: string[];
}

export interface TournamentStats {
  totalMatches: number;
  completedMatches: number;
  averageMatchDuration: number;
  totalPrizeDistributed: number;
  participantCount: number;
  viewerPeak?: number;
}

export type TournamentStatus = 
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'check_in'
  | 'ongoing'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type TournamentFormat = 
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'group_stage_knockout'
  | 'league'
  | 'custom';

export type TournamentType = 
  | 'online'
  | 'offline'
  | 'hybrid';

export type TeamRegistrationStatus = 
  | 'registered'
  | 'checked_in'
  | 'confirmed'
  | 'disqualified'
  | 'withdrawn'
  | 'eliminated';

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  rounds: TournamentRound[];
  currentRound: number;
  status: 'generating' | 'generated' | 'ongoing' | 'completed';
}

export interface TournamentRound {
  id: string;
  roundNumber: number;
  name: string;
  matches: string[]; // match IDs
  isCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
}
