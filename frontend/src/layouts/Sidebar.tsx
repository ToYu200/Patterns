import React from 'react';
import { NavLink, Stack, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV, isNavActive } from '../navigation';

type SidebarProps = {
  /** Закрыть мобильное меню после перехода по ссылке. */
  onNavigate?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();

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
    </Stack>
  );
};

export default Sidebar;
