import React from 'react';
import { Card, Text, Group } from '@mantine/core';
import type { Match } from '../types';

export const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  return (
    <Card shadow="xs" padding="sm">
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text fw={700}>Матч {match.id}</Text>
          <Text size="xs">
            Карта: {match.map} • Дата: {match.date}
          </Text>
        </div>
        <Text fw={700}>{match.result}</Text>
      </Group>
    </Card>
  );
};

export default MatchCard;
