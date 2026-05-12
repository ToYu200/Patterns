import type { AuthResult, AuthUser, Match, Player, Tournament } from '../types';
import { matches, players, tournaments } from '../mock/data';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

async function getJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function postJSON<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed');
  }
  return data as T;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? 'Unauthorized');
  }
  return data as AuthUser;
}

export function login(email: string, password: string): Promise<AuthResult> {
  return postJSON<AuthResult>('/auth/login', { email, password });
}

export function register(username: string, email: string, password: string): Promise<AuthResult> {
  return postJSON<AuthResult>('/auth/register', { username, email, password });
}

export function startMatchmaking(token: string, mode: string, region: string) {
  return postJSON('/matchmaking/search', { mode, region }, token);
}

export function cancelMatchmaking(token: string, ticketId: string) {
  return postJSON('/matchmaking/cancel', { ticketId }, token);
}

export function fetchPlayers(limit = 20): Promise<Player[]> {
  return getJSON<Player[]>(`/players?limit=${limit}`, players);
}

export function fetchTopPlayers(limit = 3): Promise<Player[]> {
  return getJSON<Player[]>(`/players/top?limit=${limit}`, players.slice(0, limit));
}

export function fetchPlayer(id: string): Promise<Player> {
  return getJSON<Player>(`/players/${id}`, players.find((p) => p.id === id) ?? players[0]);
}

export function fetchMatches(limit = 10): Promise<Match[]> {
  return getJSON<Match[]>(`/matches/recent?limit=${limit}`, matches);
}

export function fetchTournaments(limit = 20): Promise<Tournament[]> {
  return getJSON<Tournament[]>(`/tournaments?limit=${limit}`, tournaments);
}
