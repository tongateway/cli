import { getApiUrl } from '../config.js';
import { printKeyValue, printJson, printError } from '../output.js';

export async function runLookupResolve(name: string, opts: { json: boolean }): Promise<void> {
  try {
    const res = await fetch(`${getApiUrl()}/v1/dns/${encodeURIComponent(name)}/resolve`);
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error ?? 'Failed');
    if (opts.json) {
      printJson(data);
    } else if (data.address) {
      printKeyValue({ [name]: data.address });
    } else {
      process.stdout.write(`Domain "${name}" not found or has no wallet address.\n`);
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runLookupPrice(opts: { currency: string; json: boolean }): Promise<void> {
  try {
    const res = await fetch(`${getApiUrl()}/v1/market/price?tokens=TON&currencies=${opts.currency}`);
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error ?? 'Failed');
    if (opts.json) { printJson(data); return; }
    const prices = data.rates?.TON?.prices ?? {};
    const entries = Object.entries(prices);
    if (!entries.length) { process.stdout.write('Price data unavailable.\n'); return; }
    const kv: Record<string, string> = {};
    for (const [currency, price] of entries) {
      kv[`1 TON`] = `${price} ${currency}`;
    }
    printKeyValue(kv);
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
