import React, { useEffect, useState } from 'react';
import { Stack, Title } from '@mantine/core';
import MatchCard from './MatchCard';
import type { Match } from '../types';
import { fetchMatches } from '../api/platform';

export const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches(10).then(setMatches);
  }, []);

  return (
    <div>
      <Title order={5}>Последние матчи</Title>
      <Stack mt="sm">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </Stack>
    </div>
  );
};

export default MatchList;
