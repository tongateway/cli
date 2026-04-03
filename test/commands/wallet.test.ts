import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('wallet commands', () => {
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

  it('wallet info shows address and balance', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQabc', balance: '1500000000', status: 'active' }),
    }));
    const { runWalletInfo } = await import('../../src/commands/wallet.js');
    await runWalletInfo({ json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('EQabc');
    expect(output).toContain('1.5');
    expect(output).toContain('TON');
  });

  it('wallet info outputs JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQabc', balance: '1500000000', status: 'active' }),
    }));
    const { runWalletInfo } = await import('../../src/commands/wallet.js');
    await runWalletInfo({ json: true });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    const parsed = JSON.parse(output);
    expect(parsed.address).toBe('EQabc');
  });

  it('wallet jettons shows token list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        balances: [
          { symbol: 'NOT', name: 'Notcoin', balance: '5000000000000', decimals: 9, address: '0:abc' },
          { symbol: 'USDT', name: 'Tether', balance: '50000000', decimals: 6, address: '0:def' },
        ],
      }),
    }));
    const { runWalletJettons } = await import('../../src/commands/wallet.js');
    await runWalletJettons({ json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('NOT');
    expect(output).toContain('5000');
    expect(output).toContain('USDT');
    expect(output).toContain('50');
  });

  it('wallet transactions shows history', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        events: [
          { timestamp: 1700000000, actions: [{ type: 'TonTransfer' }], is_scam: false },
        ],
      }),
    }));
    const { runWalletTransactions } = await import('../../src/commands/wallet.js');
    await runWalletTransactions({ limit: 10, json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('TonTransfer');
  });

  it('wallet nfts shows NFT list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        nfts: [
          { name: 'Cool NFT', collection: 'CoolCollection', address: '0:nft1' },
        ],
      }),
    }));
    const { runWalletNfts } = await import('../../src/commands/wallet.js');
    await runWalletNfts({ json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('Cool NFT');
    expect(output).toContain('CoolCollection');
  });
});
