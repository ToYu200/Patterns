import type { Player, Match, Tournament } from '../types';

export const DEMO_CURRENT_USER_ID = 'p1';

export const players: Player[] = [
  { id: 'p1', nickname: 'ZeroCool', elo: 2100, rank: 'Алмаз', winrate: 62, games: 540, favoriteGame: 'CS:GO', avatar: '' },
  { id: 'p2', nickname: 'Neo', elo: 1980, rank: 'Платина', winrate: 58, games: 420, favoriteGame: 'Valorant', avatar: '' },
  { id: 'p3', nickname: 'Tracer', elo: 1850, rank: 'Золото', winrate: 55, games: 300, favoriteGame: 'Overwatch', avatar: '' },
  { id: 'p4', nickname: 'Ragnar', elo: 2400, rank: 'Претендент', winrate: 70, games: 1200, favoriteGame: 'League of Legends', avatar: '' },
];

export const matches: Match[] = [
  { id: 'm1', players: ['p1', 'p2'], result: '2:1', date: '2026-05-10', map: 'Dust2' },
  { id: 'm2', players: ['p3', 'p4'], result: '0:2', date: '2026-05-09', map: 'Mirage' },
  { id: 'm3', players: ['p1', 'p4'], result: '1:2', date: '2026-05-08', map: 'Inferno' },
];

export const tournaments: Tournament[] = [
  { id: 't1', name: 'Весенний кубок', players: 128, prize: '5 000 $' },
  { id: 't2', name: 'Любительская лига', players: 64, prize: '500 $' },
];
