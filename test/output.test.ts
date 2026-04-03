import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('output', () => {
  let stdoutWrite: ReturnType<typeof vi.fn>;
  let stderrWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    stdoutWrite = vi.fn();
    stderrWrite = vi.fn();
    vi.spyOn(process.stdout, 'write').mockImplementation(stdoutWrite);
    vi.spyOn(process.stderr, 'write').mockImplementation(stderrWrite);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('printJson writes JSON to stdout', async () => {
    const { printJson } = await import('../src/output.js');
    printJson({ address: 'EQabc', balance: 100 });
    const output = stdoutWrite.mock.calls[0][0];
    expect(JSON.parse(output)).toEqual({ address: 'EQabc', balance: 100 });
  });

  it('printKeyValue formats key-value pairs', async () => {
    const { printKeyValue } = await import('../src/output.js');
    printKeyValue({ Address: 'EQabc', Balance: '1.5 TON' });
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('Address');
    expect(output).toContain('EQabc');
    expect(output).toContain('Balance');
    expect(output).toContain('1.5 TON');
  });

  it('printTable formats rows with columns', async () => {
    const { printTable } = await import('../src/output.js');
    printTable(
      [
        { symbol: 'NOT', balance: '1000.5' },
        { symbol: 'USDT', balance: '50.0' },
      ],
      [
        { key: 'symbol', header: 'Token' },
        { key: 'balance', header: 'Balance' },
      ],
    );
    const output = stdoutWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('Token');
    expect(output).toContain('Balance');
    expect(output).toContain('NOT');
    expect(output).toContain('1000.5');
  });

  it('printError writes to stderr', async () => {
    const { printError } = await import('../src/output.js');
    printError('Something went wrong');
    const output = stderrWrite.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('Something went wrong');
  });
});
