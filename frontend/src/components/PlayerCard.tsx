import React from 'react';
import { Card, Avatar, Text, Group, Badge } from '@mantine/core';
import type { Player } from '../types';

export const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <Card shadow="sm" padding="sm">
      <Group>
        <Avatar radius="xl">{player.nickname[0]}</Avatar>
        <div>
          <Text fw={700}>{player.nickname}</Text>
          <Text size="xs">
            Рейтинг (ELO): {player.elo} • {player.rank}
          </Text>
        </div>
        <Badge ml="auto" title="Винрейт">
          {player.winrate}%
        </Badge>
      </Group>
    </Card>
  );
};

export default PlayerCard;
