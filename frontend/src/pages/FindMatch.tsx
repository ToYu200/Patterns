import React, { useState } from 'react';
import { Container, Select, Button, Group, Card, Text, Stack } from '@mantine/core';
import { useMatchmaking } from '../hooks/useMatchmaking';
import type { MatchmakingMode, MatchmakingRegion } from '../context/matchmakingContext';
import { MODE_LABEL_RU, REGION_LABEL_RU } from '../matchmakingLabels';

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
  const [selMode, setSelMode] = useState<MatchmakingMode>(mode);
  const [selRegion, setSelRegion] = useState<MatchmakingRegion>(region);

  return (
    <Container size="sm">
      <Card padding="lg" withBorder>
        <Text fw={700}>Поиск матча</Text>
        <Text size="sm" c="dimmed" mt={4}>
          Состояние очереди хранится в контексте (без сервера).
        </Text>
        <Stack gap="md" mt="md">
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
            <Button onClick={() => startSearch(selMode, selRegion)}>Начать поиск</Button>
          ) : (
            <Button color="red" variant="light" onClick={() => cancelSearch()}>
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
