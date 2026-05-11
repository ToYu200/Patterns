import React from 'react';
import { matches } from '../mock/data';
import { Stack, Title } from '@mantine/core';
import MatchCard from './MatchCard';

export const MatchList: React.FC = () => {
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
