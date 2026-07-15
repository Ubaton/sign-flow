// Relative — proxied to the real API origin server-side via next.config.mjs's
// rewrites(), so the browser only ever sees this app's own origin. Keeps
// auth cookies same-site regardless of where the API is actually hosted.
export const API_URL = '/api';

export interface CurrentUser {
  id: string;
  email: string;
  provider: 'github' | 'google';
}

export type KeyEnv = 'live' | 'test';

export interface Project {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string;
  testPublicKey: string;
  testSecretKey: string;
  createdAt: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/auth/me');
}

export function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/projects');
}

export function createProject(name: string): Promise<Project> {
  return apiFetch<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function rotateProjectKeys(projectId: string, env: KeyEnv): Promise<Project> {
  return apiFetch<Project>(`/projects/${projectId}/keys/rotate`, {
    method: 'POST',
    body: JSON.stringify({ env }),
  });
}

export function logoutUrl(): string {
  return `${API_URL}/auth/oauth/logout`;
}

export function githubLoginUrl(): string {
  return `${API_URL}/auth/oauth/github`;
}

export function googleLoginUrl(): string {
  return `${API_URL}/auth/oauth/google`;
}

export { ApiError };
