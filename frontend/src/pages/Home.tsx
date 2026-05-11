import React from 'react';
import { Container, Title, Button, Grid, Card } from '@mantine/core';
import { Link } from 'react-router-dom';
import TopPlayers from '../components/TopPlayers';
import MatchList from '../components/MatchList';
import TournamentCard from '../components/TournamentCard';
import { tournaments } from '../mock/data';

const Home: React.FC = () => {
  return (
    <Container size="lg">
      <Card shadow="md" padding="lg" mb="md" withBorder>
        <Title order={2}>Добро пожаловать</Title>
        <Button component={Link} to="/find" mt="md">
          Найти матч
        </Button>
      </Card>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TopPlayers />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <MatchList />
        </Grid.Col>
      </Grid>

      <Title order={4} mt="xl">
        Популярные турниры
      </Title>
      <Grid mt="sm" gap="md">
        {tournaments.map((t) => (
          <Grid.Col key={t.id} span={{ base: 12, sm: 6, md: 3 }}>
            <TournamentCard t={t} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
