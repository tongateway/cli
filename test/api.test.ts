import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('api', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('AGENT_GATEWAY_TOKEN', 'test-token');
    vi.stubEnv('AGENT_GATEWAY_API_URL', 'https://test.api');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends GET with auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: 'EQabc' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { apiGet } = await import('../src/api.js');
    const result = await apiGet('/v1/wallet/balance');

    expect(mockFetch).toHaveBeenCalledWith('https://test.api/v1/wallet/balance', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
    });
    expect(result).toEqual({ address: 'EQabc' });
  });

  it('sends POST with body and auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'tx-123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { apiPost } = await import('../src/api.js');
    const result = await apiPost('/v1/safe/tx/transfer', { to: 'EQabc', amount: '1' });

    expect(mockFetch).toHaveBeenCalledWith('https://test.api/v1/safe/tx/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: '{"to":"EQabc","amount":"1"}',
    });
    expect(result).toEqual({ id: 'tx-123' });
  });

  it('throws on API error with message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    }));

    const { apiGet } = await import('../src/api.js');
    await expect(apiGet('/v1/wallet/balance')).rejects.toThrow('Unauthorized');
  });

  it('throws on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    const { apiGet } = await import('../src/api.js');
    await expect(apiGet('/v1/wallet/balance')).rejects.toThrow('Cannot reach api — check your connection.');
  });

  it('omits auth header when no token', async () => {
    vi.stubEnv('AGENT_GATEWAY_TOKEN', '');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { apiGet } = await import('../src/api.js');
    await apiGet('/v1/dex/pairs');

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty('Authorization');
  });
});
