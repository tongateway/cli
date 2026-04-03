import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const TEST_HOME = join(tmpdir(), 'tgw-test-config-' + Date.now());

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    mkdirSync(join(TEST_HOME, '.tongateway'), { recursive: true });
    vi.stubEnv('HOME', TEST_HOME);
    vi.stubEnv('AGENT_GATEWAY_TOKEN', '');
    vi.stubEnv('AGENT_GATEWAY_API_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(TEST_HOME, { recursive: true, force: true });
  });

  it('returns empty string when no token exists', async () => {
    const { loadToken } = await import('../src/config.js');
    expect(loadToken()).toBe('');
  });

  it('reads token from file', async () => {
    writeFileSync(join(TEST_HOME, '.tongateway', 'token'), 'file-token-123\n');
    const { loadToken } = await import('../src/config.js');
    expect(loadToken()).toBe('file-token-123');
  });

  it('env var overrides file token', async () => {
    writeFileSync(join(TEST_HOME, '.tongateway', 'token'), 'file-token');
    vi.stubEnv('AGENT_GATEWAY_TOKEN', 'env-token-456');
    const { loadToken } = await import('../src/config.js');
    expect(loadToken()).toBe('env-token-456');
  });

  it('saves token to file', async () => {
    const { saveToken, loadToken } = await import('../src/config.js');
    saveToken('saved-token-789');
    vi.stubEnv('AGENT_GATEWAY_TOKEN', '');
    expect(loadToken()).toBe('saved-token-789');
  });

  it('returns default API URL', async () => {
    const { getApiUrl } = await import('../src/config.js');
    expect(getApiUrl()).toBe('https://api.tongateway.ai');
  });

  it('env var overrides API URL', async () => {
    vi.stubEnv('AGENT_GATEWAY_API_URL', 'http://localhost:8080');
    const { getApiUrl } = await import('../src/config.js');
    expect(getApiUrl()).toBe('http://localhost:8080');
  });
});
