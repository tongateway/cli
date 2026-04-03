import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('transfer commands', () => {
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

  it('transfer send creates a transfer request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'tx-1', to: 'EQabc', amountNano: '1500000000', status: 'pending' }),
    }));
    const { runTransferSend } = await import('../../src/commands/transfer.js');
    await runTransferSend({ to: 'EQabc', amount: '1.5', token: 'TON', comment: '', json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('tx-1');
    expect(output).toContain('pending');
  });

  it('transfer status shows request status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'tx-1', status: 'confirmed', to: 'EQabc' }),
    }));
    const { runTransferStatus } = await import('../../src/commands/transfer.js');
    await runTransferStatus('tx-1', { json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('confirmed');
  });

  it('transfer pending lists pending transfers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ requests: [{ id: 'tx-1', to: 'EQabc', amount: '1000000000', status: 'pending' }] }),
    }));
    const { runTransferPending } = await import('../../src/commands/transfer.js');
    await runTransferPending({ json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('tx-1');
    expect(output).toContain('pending');
  });
});
