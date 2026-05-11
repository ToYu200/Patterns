import type { MatchmakingMode, MatchmakingRegion } from './context/matchmakingContext';

export const MODE_LABEL_RU: Record<MatchmakingMode, string> = {
  '1v1': '1 на 1',
  '5v5': '5 на 5',
  duel: 'Дуэль',
};

export const REGION_LABEL_RU: Record<MatchmakingRegion, string> = {
  EU: 'Европа',
  NA: 'Северная Америка',
  ASIA: 'Азия',
};
