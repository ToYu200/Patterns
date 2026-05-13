import React from 'react';
import { NavLink, Stack, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV, isNavActive } from '../navigation';
import { useAuth } from '../hooks/useAuth';

type SidebarProps = {
  /** Закрыть мобильное меню после перехода по ссылке. */
  onNavigate?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <Stack gap="xs">
      <Text fw={700} size="sm" c="dimmed">
        Разделы
      </Text>
      {PRIMARY_NAV.map(({ to, label }) => (
        <NavLink
          key={to}
          label={label}
          component={Link}
          to={to}
          active={isNavActive(pathname, to)}
          onClick={() => onNavigate?.()}
        />
      ))}
      {user ? (
        <>
          <NavLink
            label={`Профиль: ${user.username}`}
            component={Link}
            to={`/profile/${user.id}`}
            active={pathname.startsWith('/profile')}
            onClick={() => onNavigate?.()}
          />
          <NavLink label="Выйти" color="red" onClick={logout} />
        </>
      ) : (
        <NavLink
          label="Войти"
          component={Link}
          to="/login"
          active={pathname === '/login'}
          onClick={() => onNavigate?.()}
        />
      )}
    </Stack>
  );
};

export default Sidebar;
