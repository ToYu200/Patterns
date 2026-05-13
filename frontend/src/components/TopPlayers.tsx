import React, { useEffect, useState } from 'react';
import { Stack, Title } from '@mantine/core';
import PlayerCard from './PlayerCard';
import type { Player } from '../types';
import { fetchTopPlayers } from '../api/platform';

export const TopPlayers: React.FC = () => {
  const [top, setTop] = useState<Player[]>([]);

  useEffect(() => {
    fetchTopPlayers(3).then(setTop);
  }, []);

  return (
    <div>
      <Title order={5}>Топ игроков</Title>
      <Stack mt="sm">
        {top.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </Stack>
    </div>
  );
};

export default TopPlayers;
