import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const TOKEN_FILE = join(homedir(), '.tongateway', 'token');

export function loadToken(): string {
  if (process.env.AGENT_GATEWAY_TOKEN) return process.env.AGENT_GATEWAY_TOKEN;
  try {
    return readFileSync(TOKEN_FILE, 'utf-8').trim();
  } catch {
    return '';
  }
}

export function saveToken(token: string): void {
  mkdirSync(join(homedir(), '.tongateway'), { recursive: true });
  writeFileSync(TOKEN_FILE, token, 'utf-8');
}

export function getApiUrl(): string {
  return process.env.AGENT_GATEWAY_API_URL || 'https://api.tongateway.ai';
}
