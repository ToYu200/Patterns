import React from 'react';
import { Burger, Group, Title, Button } from '@mantine/core';
import { Link } from 'react-router-dom';

interface HeaderBarProps {
  mobileNavOpened?: boolean;
  onToggleMobileNav?: () => void;
  onNavigate?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  mobileNavOpened = false,
  onToggleMobileNav,
  onNavigate,
}) => {
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
      <Group gap="sm" wrap="nowrap">
        <Burger
          opened={mobileNavOpened}
          onClick={onToggleMobileNav}
          hiddenFrom="sm"
          size="sm"
          aria-label="Открыть меню"
        />
        <Link to="/" onClick={onNavigate} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Title order={3} style={{ margin: 0, letterSpacing: '2px' }}>
            PvP Academy
          </Title>
        </Link>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <Button component={Link} to="/coaching" onClick={onNavigate} variant="light" size="sm">
          Coaching
        </Button>
        <Button component={Link} to="/find" onClick={onNavigate} variant="subtle" size="sm">
          Find Match
        </Button>
        <Button component={Link} to="/leaderboard" onClick={onNavigate} variant="subtle" size="sm">
          Leaderboard
        </Button>
      </Group>
    </Group>
  );
};

export default HeaderBar;
