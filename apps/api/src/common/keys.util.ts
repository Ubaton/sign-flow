import { randomBytes } from 'node:crypto';

export type KeyEnv = 'live' | 'test';

function randomToken(): string {
  return randomBytes(24).toString('base64url');
}

export function generatePublicKey(env: KeyEnv = 'live'): string {
  return `pk_${env}_${randomToken()}`;
}

export function generateSecretKey(env: KeyEnv = 'live'): string {
  return `sk_${env}_${randomToken()}`;
}
