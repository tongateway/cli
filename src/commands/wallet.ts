import { apiGet } from '../api.js';
import { printKeyValue, printTable, printJson, printError } from '../output.js';

function formatTon(nanoStr: string): string {
  const raw = BigInt(nanoStr);
  const whole = (raw / 1_000_000_000n).toString();
  const frac = (raw % 1_000_000_000n).toString().padStart(9, '0').replace(/0+$/, '') || '0';
  return `${whole}.${frac}`;
}

function formatJetton(balance: string, decimals: number): string {
  const raw = BigInt(balance);
  const divisor = BigInt(10 ** decimals);
  const whole = (raw / divisor).toString();
  const frac = (raw % divisor).toString().padStart(decimals, '0').replace(/0+$/, '') || '0';
  return `${whole}.${frac}`;
}

export async function runWalletInfo(opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiGet('/v1/wallet/balance');
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Address': result.address,
        'Balance': `${formatTon(result.balance)} TON`,
        'Status': result.status,
      });
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runWalletJettons(opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiGet('/v1/wallet/jettons');
    const balances = result.balances ?? [];
    if (opts.json) { printJson(result); return; }
    if (!balances.length) { process.stdout.write('No jettons found.\n'); return; }
    const rows = balances.map((b: any) => ({
      symbol: b.symbol ?? b.name ?? 'Unknown',
      balance: formatJetton(b.balance, b.decimals ?? 9),
      address: b.address,
    }));
    printTable(rows, [
      { key: 'symbol', header: 'Token' },
      { key: 'balance', header: 'Balance' },
      { key: 'address', header: 'Address' },
    ]);
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runWalletTransactions(opts: { limit: number; json: boolean }): Promise<void> {
  try {
    const result = await apiGet(`/v1/wallet/transactions?limit=${opts.limit}`);
    const events = result.events ?? [];
    if (opts.json) { printJson(result); return; }
    if (!events.length) { process.stdout.write('No recent transactions.\n'); return; }
    const rows = events.map((e: any) => ({
      time: new Date(e.timestamp * 1000).toISOString().replace('T', ' ').slice(0, 19),
      type: (e.actions ?? []).map((a: any) => a.type).join(', ') || 'unknown',
      scam: e.is_scam ? 'YES' : '',
    }));
    printTable(rows, [
      { key: 'time', header: 'Time' },
      { key: 'type', header: 'Type' },
      { key: 'scam', header: 'Scam' },
    ]);
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runWalletNfts(opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiGet('/v1/wallet/nfts');
    const nfts = result.nfts ?? [];
    if (opts.json) { printJson(result); return; }
    if (!nfts.length) { process.stdout.write('No NFTs found.\n'); return; }
    const rows = nfts.map((n: any) => ({
      name: n.name ?? 'Unnamed',
      collection: n.collection ?? '',
      address: n.address,
    }));
    printTable(rows, [
      { key: 'name', header: 'Name' },
      { key: 'collection', header: 'Collection' },
      { key: 'address', header: 'Address' },
    ]);
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
