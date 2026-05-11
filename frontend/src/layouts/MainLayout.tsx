import React from 'react';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import HeaderBar from './Header';
import Sidebar from './Sidebar';

/** Оболочка: шапка + боковая панель (Mantine AppShell v9). На узком экране меню открывается кнопкой «Меню». */
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure(false);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileNavOpened },
      }}
    >
      <AppShell.Header>
        <HeaderBar
          mobileNavOpened={mobileNavOpened}
          onToggleMobileNav={toggleMobileNav}
          onNavigate={closeMobileNav}
        />
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        <Sidebar onNavigate={closeMobileNav} />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
