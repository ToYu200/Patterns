import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { fetchCoachingSession } from '../api/platform';
import type { TrainingReport } from '../types';

type CoachingProgram = 'individual' | 'team';

const PROGRAMS = [
  { value: 'individual', label: 'Индивидуальная' },
  { value: 'team', label: 'Командная' },
];

const Coaching: React.FC = () => {
  const [program, setProgram] = useState<CoachingProgram>('individual');
  const [report, setReport] = useState<TrainingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetchCoachingSession(program)
      .then((session) => {
        if (active) {
          setReport(session);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setReport(null);
          setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить тренировку');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [program, requestVersion]);

  const selectProgram = (selectedProgram: CoachingProgram) => {
    setProgram(selectedProgram);
    setLoading(true);
    setError('');
    setReport(null);
  };

  const retry = () => {
    setLoading(true);
    setError('');
    setRequestVersion((version) => version + 1);
  };

  return (
    <Container size="lg">
      <Group justify="space-between" align="flex-end" mb="md">
        <div>
          <Title order={2}>Тренировочная сессия</Title>
          <Text size="sm" c="dimmed">
            Тренер создаётся фабрикой и проводит занятие по выбранной стратегии.
          </Text>
        </div>
        <SegmentedControl
          data={PROGRAMS}
          value={program}
          onChange={(value) => selectProgram(value as CoachingProgram)}
        />
      </Group>

      {error && (
        <Alert color="red" mb="md" title="Backend недоступен">
          {error}
          <Button size="xs" variant="light" color="red" ml="md" onClick={retry}>
            Повторить
          </Button>
        </Alert>
      )}

      {loading && (
        <Card padding="xl" withBorder>
          <Group justify="center">
            <Loader size="sm" />
            <Text>Создаём тренировочную сессию...</Text>
          </Group>
        </Card>
      )}

      {!loading && report && (
        <Stack gap="md">
          <Card padding="lg" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">
                  Тренер
                </Text>
                <Title order={3}>{report.coach.nickname}</Title>
                <Text mt={6}>{report.coach.bio}</Text>
              </div>
              <Stack gap="xs" align="flex-end">
                <Badge color="orange">{report.coach.specialty}</Badge>
                <Badge variant="light">{report.program}</Badge>
              </Stack>
            </Group>
          </Card>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {report.plans.map((plan) => (
              <Card key={plan.traineeId} padding="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={700}>Ученик: {plan.traineeId}</Text>
                  <Badge variant="outline">Iterator</Badge>
                </Group>
                <Text size="sm" mb="sm">
                  {plan.focus}
                </Text>
                <Text size="xs" c="dimmed" tt="uppercase" mb={6}>
                  Упражнения Strategy
                </Text>
                <Stack gap={4}>
                  {plan.exercises.map((exercise) => (
                    <Text key={exercise} size="sm">
                      - {exercise}
                    </Text>
                  ))}
                </Stack>
                <Text size="xs" c="dimmed" tt="uppercase" mt="md" mb={6}>
                  Уведомление Observer
                </Text>
                {(report.notifications[plan.traineeId] ?? []).map((notification) => (
                  <Text key={notification} size="sm" c="orange">
                    {notification}
                  </Text>
                ))}
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Container>
  );
};

export default Coaching;
