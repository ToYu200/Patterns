import React, { useEffect, useState } from 'react';
import {
  MatchmakingContext,
  type MatchmakingMode,
  type MatchmakingRegion,
} from './matchmakingContext';

export const MatchmakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<MatchmakingMode>('1v1');
  const [region, setRegion] = useState<MatchmakingRegion>('EU');
  const [secondsInQueue, setSecondsInQueue] = useState(0);

  useEffect(() => {
    if (!searching) return;
    const timer = window.setInterval(() => setSecondsInQueue((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [searching]);

  function startSearch(m: MatchmakingMode, r: MatchmakingRegion) {
    setMode(m);
    setRegion(r);
    setSecondsInQueue(0);
    setSearching(true);
  }

  function cancelSearch() {
    setSearching(false);
    setSecondsInQueue(0);
  }

  return (
    <MatchmakingContext.Provider
      value={{ searching, mode, region, secondsInQueue, startSearch, cancelSearch }}
    >
      {children}
    </MatchmakingContext.Provider>
  );
};
