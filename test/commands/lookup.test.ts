import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('lookup commands', () => {
  let stdoutWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('AGENT_GATEWAY_TOKEN', '');
    vi.stubEnv('AGENT_GATEWAY_API_URL', 'https://test.api');
    stdoutWrite = vi.fn();
    vi.spyOn(process.stdout, 'write').mockImplementation(stdoutWrite);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('resolve shows address for domain', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQresolved123' }),
    }));
    const { runLookupResolve } = await import('../../src/commands/lookup.js');
    await runLookupResolve('alice.ton', { json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('alice.ton');
    expect(output).toContain('EQresolved123');
  });

  it('price shows TON price', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { TON: { prices: { USD: 3.45 } } } }),
    }));
    const { runLookupPrice } = await import('../../src/commands/lookup.js');
    await runLookupPrice({ currency: 'USD', json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('3.45');
    expect(output).toContain('USD');
  });
});
