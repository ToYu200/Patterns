import React from 'react';
import { Group, Title, Button } from '@mantine/core';
import { Link } from 'react-router-dom';

export const HeaderBar: React.FC = () => {
  return (
    <Group 
      justify="space-between" 
      align="center" 
      h="60px" 
      px="md" 
      wrap="nowrap" 
      gap="sm"
      style={{
        borderBottom: '1px solid rgba(255,140,66,0.2)',
        backgroundColor: 'rgba(10, 14, 21, 0.6)',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Title order={3} style={{ margin: 0, letterSpacing: '2px' }}>
          PvP Academy
        </Title>
      </Link>

      <Group gap="xs" wrap="nowrap">
        <Button component={Link} to="/find" variant="light" size="sm">
          Find Match
        </Button>
        <Button component={Link} to="/leaderboard" variant="subtle" size="sm">
          Leaderboard
        </Button>
      </Group>
    </Group>
  );
};

export default HeaderBar;
