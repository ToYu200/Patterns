export interface Player {
  id: string;
  nickname: string;
  avatar?: string;
  elo: number;
  rank?: string;
  winrate: number;
  games: number;
  favoriteGame?: string;
}

export interface Match {
  id: string;
  players: string[];
  result?: string;
  date: string;
  map?: string;
}

export interface Tournament {
  id: string;
  name: string;
  players: number;
  prize?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  role: string;
  elo: number;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
