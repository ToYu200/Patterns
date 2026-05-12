import React from 'react';
import { Burger, Group, Title, Button, Box } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV, isNavActive } from '../navigation';
import { useAuth } from '../hooks/useAuth';

type HeaderBarProps = {
  mobileNavOpened: boolean;
  onToggleMobileNav: () => void;
  onNavigate: () => void;
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  mobileNavOpened,
  onToggleMobileNav,
  onNavigate,
}) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <Group justify="space-between" align="center" h="100%" px="md" wrap="nowrap" gap="sm">
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Burger
          opened={mobileNavOpened}
          onClick={onToggleMobileNav}
          hiddenFrom="sm"
          size="sm"
          aria-label={mobileNavOpened ? 'Закрыть меню' : 'Открыть меню навигации'}
        />
        <Link to="/" onClick={onNavigate} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Title order={4} style={{ margin: 0 }}>
            PvP Академия
          </Title>
        </Link>
      </Group>

      <Box visibleFrom="sm" style={{ flex: 1, minWidth: 0 }}>
        <Group gap={4} justify="flex-end" wrap="wrap">
          {PRIMARY_NAV.map(({ to, label }) => (
            <Button
              key={to}
              component={Link}
              to={to}
              variant={isNavActive(pathname, to) ? 'light' : 'subtle'}
              size="compact-xs"
              onClick={onNavigate}
            >
              {label}
            </Button>
          ))}
          {user ? (
            <>
              <Button
                component={Link}
                to={`/profile/${user.id}`}
                variant={isNavActive(pathname, '/profile/') ? 'light' : 'subtle'}
                size="compact-xs"
                onClick={onNavigate}
              >
                {user.username}
              </Button>
              <Button size="compact-xs" variant="subtle" color="red" onClick={logout}>
                Выйти
              </Button>
            </>
          ) : (
            <Button component={Link} to="/login" size="compact-xs" variant="light" onClick={onNavigate}>
              Войти
            </Button>
          )}
        </Group>
      </Box>
    </Group>
  );
};

export default HeaderBar;
