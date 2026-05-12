export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  genre: GameGenre;
  maxPlayersPerTeam: number;
  minPlayersPerTeam: number;
  teamMode: TeamMode;
  estimatedMatchDuration: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  screenshots: string[];
  rules: string;
  setupRequirements: GameSetupRequirements;
  stats: GameStats;
}

export interface GameSetupRequirements {
  minLevel?: number;
  requiredRank?: string;
  equipment?: string[];
  rules: string[];
}

export interface GameStats {
  totalMatches: number;
  totalPlayers: number;
  averageRating: number;
  popularity: number;
}

export type GameGenre = 
  | 'fps'
  | 'moba'
  | 'rts'
  | 'fighting'
  | 'racing'
  | 'sports'
  | 'rpg'
  | 'strategy'
  | 'puzzle'
  | 'other';

export type TeamMode = 
  | '1v1'
  | '2v2'
  | '3v3'
  | '4v4'
  | '5v5'
  | '6v6'
  | 'free_for_all'
  | 'team_based';

export interface GameMode {
  id: string;
  gameId: string;
  name: string;
  description: string;
  rules: string;
  maxPlayersPerTeam: number;
  teamMode: TeamMode;
  isActive: boolean;
}
