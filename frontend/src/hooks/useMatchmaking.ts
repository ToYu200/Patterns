import { useContext } from 'react';
import { MatchmakingContext, type MatchmakingState } from '../context/matchmakingContext';

export function useMatchmaking(): MatchmakingState {
  const ctx = useContext(MatchmakingContext);
  if (!ctx) throw new Error('useMatchmaking: оберните приложение в MatchmakingProvider');
  return ctx;
}
