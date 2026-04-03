import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('agent wallet commands', () => {
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

  it('agent deploy starts deployment', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQagent', walletId: 1, agentPublicKey: 'pubkey123' }),
    }));
    const { runAgentDeploy } = await import('../../src/commands/agent.js');
    await runAgentDeploy({ json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('EQagent');
  });

  it('agent info shows wallet details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQagent', balance: '500000000', seqno: 5 }),
    }));
    const { runAgentInfo } = await import('../../src/commands/agent.js');
    await runAgentInfo({ address: 'EQagent', json: false });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('EQagent');
    expect(output).toContain('5');
  });

  it('agent info outputs JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQagent', balance: '500000000', seqno: 5 }),
    }));
    const { runAgentInfo } = await import('../../src/commands/agent.js');
    await runAgentInfo({ address: 'EQagent', json: true });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    const parsed = JSON.parse(output);
    expect(parsed.address).toBe('EQagent');
  });
});
