import React from 'react';
import { players } from '../mock/data';
import { Stack, Title } from '@mantine/core';
import PlayerCard from './PlayerCard';

export const TopPlayers: React.FC = () => {
  const top = players.slice(0, 3);
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
