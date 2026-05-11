import React, { useMemo } from 'react';
import { Table, Text, Badge, Stack } from '@mantine/core';
import { players, DEMO_CURRENT_USER_ID } from '../mock/data';

export const LeaderboardTable: React.FC = () => {
  const sorted = useMemo(() => [...players].sort((a, b) => b.elo - a.elo), []);
  const yourPlace = sorted.findIndex((p) => p.id === DEMO_CURRENT_USER_ID) + 1;
  const you = sorted.find((p) => p.id === DEMO_CURRENT_USER_ID);

  const rows = sorted.map((p, idx) => {
    const isYou = p.id === DEMO_CURRENT_USER_ID;
    return (
      <Table.Tr key={p.id} style={{ background: isYou ? 'var(--mantine-color-dark-6)' : undefined }}>
        <Table.Td>{idx + 1}</Table.Td>
        <Table.Td>
          {p.nickname}
          {isYou && (
            <Badge ml="sm" size="xs" variant="light">
              Вы
            </Badge>
          )}
        </Table.Td>
        <Table.Td>{p.elo}</Table.Td>
        <Table.Td>{p.winrate}%</Table.Td>
        <Table.Td>{p.games}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack gap="md" mt="md">
      {you && (
        <Text size="sm">
          Ваше место: <strong>№{yourPlace}</strong> — {you.nickname} (рейтинг {you.elo}, винрейт {you.winrate}%)
        </Text>
      )}
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>№</Table.Th>
            <Table.Th>Игрок</Table.Th>
            <Table.Th>Рейтинг (ELO)</Table.Th>
            <Table.Th>Винрейт</Table.Th>
            <Table.Th>Игры</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
};

export default LeaderboardTable;
