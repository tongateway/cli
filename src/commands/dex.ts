import { readFileSync } from 'node:fs';
import { apiGet, apiPost } from '../api.js';
import { printKeyValue, printTable, printJson, printError } from '../output.js';

export async function runDexPairs(opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiGet('/v1/dex/pairs');
    if (opts.json) {
      printJson(result);
    } else {
      const tokens = result.tokens ?? [];
      process.stdout.write(`Available tokens: ${tokens.join(', ')}\n`);
      process.stdout.write('\nAny pair combination is supported.\n');
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runDexSwap(opts: { from?: string; to?: string; amount?: string; price?: string; file?: string; json: boolean }): Promise<void> {
  try {
    let body: Record<string, any>;

    if (opts.file) {
      const raw = readFileSync(opts.file, 'utf-8');
      const orders = JSON.parse(raw) as Array<{ fromToken: string; toToken: string; amount: string; price: number }>;
      body = { orders };
    } else if (opts.from && opts.to && opts.amount && opts.price) {
      body = {
        fromToken: opts.from,
        toToken: opts.to,
        amount: opts.amount,
        price: parseFloat(opts.price),
      };
    } else {
      printError('Provide --from/--to/--amount/--price for a single order, or --file for batch.');
      process.exitCode = 1;
      return;
    }

    const result = await apiPost('/v1/dex/order', body);

    if (opts.json) {
      printJson(result);
      return;
    }

    const orderList = result.orders || (result.swap ? [result.swap] : []);

    if (orderList.length === 1) {
      const s = orderList[0];
      printKeyValue({
        'Order': `${s.fromToken} → ${s.toToken}`,
        'Amount': String(s.amount),
        'Price': `${s.price} ${s.toToken} per ${s.fromToken}`,
        'Slippage': `${s.slippage ?? 4}%`,
        'Request ID': result.id,
      });
    } else {
      process.stdout.write(`${orderList.length} orders placed!\n\n`);
      const rows = orderList.map((s: any, i: number) => ({
        num: String(i + 1),
        pair: `${s.fromToken} → ${s.toToken}`,
        amount: String(s.amount),
        price: String(s.price),
      }));
      printTable(rows, [
        { key: 'num', header: '#' },
        { key: 'pair', header: 'Pair' },
        { key: 'amount', header: 'Amount' },
        { key: 'price', header: 'Price' },
      ]);
      process.stdout.write(`\nSlippage: 4%\nRequest ID: ${result.id}\n`);
    }

    process.stdout.write('\nApprove in your wallet app.\n');
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
