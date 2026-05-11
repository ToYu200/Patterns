import { createContext } from 'react';

export type MatchmakingRegion = 'EU' | 'NA' | 'ASIA';
export type MatchmakingMode = '1v1' | '5v5' | 'duel';

export interface MatchmakingState {
  searching: boolean;
  mode: MatchmakingMode;
  region: MatchmakingRegion;
  secondsInQueue: number;
  startSearch: (mode: MatchmakingMode, region: MatchmakingRegion) => void;
  cancelSearch: () => void;
}

export const MatchmakingContext = createContext<MatchmakingState | undefined>(undefined);
