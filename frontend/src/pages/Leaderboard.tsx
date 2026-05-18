import React from 'react';
import { Container, Card, Title, Text } from '@mantine/core';
import LeaderboardTable from '../components/LeaderboardTable';

const Leaderboard: React.FC = () => {
  return (
    <Container size="lg">
      <Card padding="md" withBorder>
        <Title order={3}>Рейтинг</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Топ игроков по рейтингу ELO.
        </Text>
        <LeaderboardTable />
      </Card>
    </Container>
  );
};

export default Leaderboard;
