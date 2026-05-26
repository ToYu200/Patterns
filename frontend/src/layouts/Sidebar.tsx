import React from 'react';
import { NavLink, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Find Match', to: '/find' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Coaching', to: '/coaching' },
    { label: 'Profile', to: '/profile/p1' },
  ];

  return (
    <Stack
      gap="xs"
      p="md"
      style={{
        borderRight: '1px solid rgba(255,140,66,0.1)',
        backgroundColor: 'rgba(10, 14, 21, 0.4)',
        minWidth: 200,
      }}
    >
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          label={label}
          component={Link}
          to={to}
          onClick={onNavigate}
          style={{ cursor: 'pointer' }}
          classNames={{
            root: 'sidebar-link',
          }}
        />
      ))}
    </Stack>
  );
};

export default Sidebar;
