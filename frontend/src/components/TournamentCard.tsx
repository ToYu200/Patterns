import React from 'react';
import { Card, Text } from '@mantine/core';
import type { Tournament } from '../types';

export const TournamentCard: React.FC<{ t: Tournament }> = ({ t }) => {
  return (
    <Card shadow="xs" padding="sm">
      <Text fw={700}>{t.name}</Text>
      <Text size="xs">
        Участников: {t.players} • Приз: {t.prize}
      </Text>
    </Card>
  );
};

export default TournamentCard;
