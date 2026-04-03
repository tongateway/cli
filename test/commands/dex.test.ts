import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('dex commands', () => {
  let stdoutWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('AGENT_GATEWAY_TOKEN', 'test-token');
    vi.stubEnv('AGENT_GATEWAY_API_URL', 'https://test.api');
    stdoutWrite = vi.fn();
    vi.spyOn(process.stdout, 'write').mockImplementation(stdoutWrite);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('dex pairs lists available tokens', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tokens: ['TON', 'NOT', 'USDT', 'BUILD'], pairs: ['TON/NOT', 'NOT/TON'] }),
    }));
    const { runDexPairs } = await import('../../src/commands/dex.js');
    await runDexPairs({ json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('TON');
    expect(output).toContain('NOT');
    expect(output).toContain('BUILD');
  });

  it('dex swap places an order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'order-1', swap: { fromToken: 'NOT', toToken: 'TON', slippage: 4 } }),
    }));
    const { runDexSwap } = await import('../../src/commands/dex.js');
    await runDexSwap({ from: 'NOT', to: 'TON', amount: '10000', price: '0.000289', json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('order-1');
    expect(output).toContain('NOT');
    expect(output).toContain('TON');
  });
});
