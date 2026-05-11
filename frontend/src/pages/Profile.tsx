import React from 'react';
import { useParams } from 'react-router-dom';
import { players, matches } from '../mock/data';
import { Container, Avatar, Title, Text, Card, Grid, Progress } from '@mantine/core';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const player = players.find((p) => p.id === id) || players[0];
  const history = matches.filter((m) => m.players.includes(player.id));

  return (
    <Container size="md">
      <Card padding="lg" withBorder>
        <Grid gap="md">
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Avatar size={120} radius="xl" mx={{ base: 'auto', sm: 0 }}>
              {player.nickname[0]}
            </Avatar>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 9 }}>
            <Title order={2}>{player.nickname}</Title>
            <Text mt="xs">
              Рейтинг (ELO): {player.elo} • {player.rank}
            </Text>
            <Text mt="sm">Винрейт: {player.winrate}%</Text>
            <Text mt="sm">Любимая игра: {player.favoriteGame}</Text>
          </Grid.Col>
        </Grid>
      </Card>

      <Title order={4} mt="lg">
        Статистика матчей
      </Title>
      <Card mt="sm" padding="md" withBorder>
        <Text>Сыграно игр: {player.games}</Text>
        <Text size="sm" c="dimmed" mt={4}>
          Винрейт
        </Text>
        <Progress value={player.winrate} mt="xs" />
      </Card>

      <Title order={4} mt="lg">
        История матчей
      </Title>
      <Grid mt="sm" gap="md">
        {history.length === 0 ? (
          <Grid.Col span={12}>
            <Text c="dimmed" size="sm">
              Пока нет сыгранных матчей в демо-истории.
            </Text>
          </Grid.Col>
        ) : (
          history.map((h) => (
            <Grid.Col key={h.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder padding="sm">
                <Text fw={700}>{h.map}</Text>
                <Text size="xs" c="dimmed">
                  {h.date} — счёт: {h.result}
                </Text>
              </Card>
            </Grid.Col>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Profile;
