export const PRIMARY_NAV = [
  { to: '/', label: 'Главная' },
  { to: '/find', label: 'Поиск матча' },
  { to: '/leaderboard', label: 'Рейтинг' },
  { to: '/coaching', label: 'Тренер' },
] as const;

export type PrimaryNavItem = (typeof PRIMARY_NAV)[number];

export function isNavActive(pathname: string, to: string): boolean {
  if (to === '/') {
    return pathname === '/';
  }

  if (to.startsWith('/profile/')) {
    return pathname.startsWith('/profile');
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
