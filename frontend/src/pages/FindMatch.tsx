import React, { useState } from 'react';
import { Alert, Container, Select, Button, Group, Card, Text, Stack } from '@mantine/core';
import { useMatchmaking } from '../hooks/useMatchmaking';
import type { MatchmakingMode, MatchmakingRegion } from '../context/matchmakingContext';
import { MODE_LABEL_RU, REGION_LABEL_RU } from '../matchmakingLabels';
import { useAuth } from '../hooks/useAuth';
import { cancelMatchmaking, startMatchmaking } from '../api/platform';

const MODES_GAME: { value: MatchmakingMode; label: string }[] = [
  { value: '1v1', label: MODE_LABEL_RU['1v1'] },
  { value: '5v5', label: MODE_LABEL_RU['5v5'] },
  { value: 'duel', label: MODE_LABEL_RU.duel },
];

const REGIONS: { value: MatchmakingRegion; label: string }[] = [
  { value: 'EU', label: `EU — ${REGION_LABEL_RU.EU}` },
  { value: 'NA', label: `NA — ${REGION_LABEL_RU.NA}` },
  { value: 'ASIA', label: `ASIA — ${REGION_LABEL_RU.ASIA}` },
];

const FindMatch: React.FC = () => {
  const { searching, startSearch, cancelSearch, secondsInQueue, mode, region } = useMatchmaking();
  const { token } = useAuth();
  const [selMode, setSelMode] = useState<MatchmakingMode>(mode);
  const [selRegion, setSelRegion] = useState<MatchmakingRegion>(region);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');

  const handleStart = async () => {
    setError('');
    if (!token) {
      setError('Для поиска матча нужно войти в аккаунт.');
      return;
    }
    const ticket = (await startMatchmaking(token, selMode, selRegion)) as { id: string };
    setTicketId(ticket.id);
    startSearch(selMode, selRegion);
  };

  const handleCancel = async () => {
    setError('');
    if (token && ticketId) {
      await cancelMatchmaking(token, ticketId);
    }
    setTicketId('');
    cancelSearch();
  };

  return (
    <Container size="sm">
      <Card padding="lg" withBorder>
        <Text fw={700}>Поиск матча</Text>
        <Text size="sm" c="dimmed" mt={4}>
          Состояние очереди хранится в контексте (без сервера).
        </Text>
        <Stack gap="md" mt="md">
          {error && <Alert color="red">{error}</Alert>}
          <Group align="flex-end" wrap="wrap" grow>
            <Select
              label="Режим"
              placeholder="Выберите режим"
              data={MODES_GAME}
              value={selMode}
              onChange={(v) => v && setSelMode(v as MatchmakingMode)}
            />
            <Select
              label="Регион"
              placeholder="Выберите регион"
              data={REGIONS}
              value={selRegion}
              onChange={(v) => v && setSelRegion(v as MatchmakingRegion)}
            />
          </Group>

          {!searching ? (
            <Button onClick={handleStart}>Начать поиск</Button>
          ) : (
            <Button color="red" variant="light" onClick={handleCancel}>
              Отменить поиск
            </Button>
          )}
        </Stack>

        {searching && (
          <Card mt="md" padding="sm" withBorder bg="dark.7">
            <Text fw={500}>Ищем матч…</Text>
            <Text size="sm" mt={4}>
              Режим: {MODE_LABEL_RU[mode]} ({mode}) • Регион: {REGION_LABEL_RU[region]} ({region})
            </Text>
            <Text size="sm" mt={4}>
              В очереди: <strong>{secondsInQueue} с</strong>
            </Text>
          </Card>
        )}
      </Card>
    </Container>
  );
};

export default FindMatch;
