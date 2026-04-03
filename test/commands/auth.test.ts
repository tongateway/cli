import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const TEST_HOME = join(tmpdir(), 'tgw-test-auth-' + Date.now());

describe('auth command', () => {
  let stdoutWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    mkdirSync(join(TEST_HOME, '.tongateway'), { recursive: true });
    vi.stubEnv('HOME', TEST_HOME);
    vi.stubEnv('AGENT_GATEWAY_TOKEN', '');
    vi.stubEnv('AGENT_GATEWAY_API_URL', 'https://test.api');
    stdoutWrite = vi.fn();
    vi.spyOn(process.stdout, 'write').mockImplementation(stdoutWrite);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(TEST_HOME, { recursive: true, force: true });
  });

  it('prints connect link when no token argument', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ authId: 'abc-123', authUrl: 'https://tongateway.ai/connect?authId=abc-123' }),
    }));

    const { runAuth } = await import('../../src/commands/auth.js');
    await runAuth(undefined, { json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('tongateway.ai/connect');
    expect(output).toContain('auth:complete');
  });

  it('saves token and prints wallet address on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQtest123', status: 'active' }),
    }));

    const { runAuth } = await import('../../src/commands/auth.js');
    await runAuth('my-token-abc', { json: false });

    const saved = readFileSync(join(TEST_HOME, '.tongateway', 'token'), 'utf-8');
    expect(saved).toBe('my-token-abc');

    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('EQtest123');
  });

  it('outputs JSON when --json flag set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQtest123', status: 'active' }),
    }));

    const { runAuth } = await import('../../src/commands/auth.js');
    await runAuth('my-token-abc', { json: true });

    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    const parsed = JSON.parse(output);
    expect(parsed.address).toBe('EQtest123');
  });
});
