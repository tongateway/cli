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

function printSwapResult(result: any, opts: { json: boolean }): void {
  if (opts.json) {
    printJson(result);
    return;
  }
  const s = result.swap ?? {};
  printKeyValue({
    'Order': `${s.fromToken} → ${s.toToken}`,
    'Amount': String(s.amount),
    'Price': `${s.price} ${s.toToken} per ${s.fromToken}`,
    'Slippage': `${s.slippage ?? 4}%`,
    'Request ID': result.id,
  });
  process.stdout.write('\nApprove in your wallet app.\n');
}

export async function runDexSwap(opts: { from?: string; to?: string; amount?: string; price?: string; slippage?: string; file?: string; json: boolean }): Promise<void> {
  try {
    const slippage = opts.slippage ? parseFloat(opts.slippage) : undefined;

    if (opts.file) {
      const raw = readFileSync(opts.file, 'utf-8');
      const orders = JSON.parse(raw) as Array<{ from?: string; fromToken?: string; to?: string; toToken?: string; amount: string; price: number }>;

      if (!orders.length) {
        printError('No orders in file.');
        process.exitCode = 1;
        return;
      }

      const payload = orders.map((o) => ({
        fromToken: o.from ?? o.fromToken,
        toToken: o.to ?? o.toToken,
        amount: String(o.amount),
        price: typeof o.price === 'string' ? parseFloat(o.price) : o.price,
      }));

      const body: Record<string, any> = { orders: payload };
      if (slippage !== undefined) body.slippage = slippage;

      const result = await apiPost('/v1/dex/order', body);

      if (opts.json) {
        printJson(result);
        return;
      }

      const orderList = result.orders || [];
      process.stdout.write(`\n${orderList.length} orders placed!\n\n`);
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
      process.stdout.write(`\nSlippage: ${orderList[0]?.slippage ?? slippage ?? 4}%\nRequest ID: ${result.id}\n`);
      process.stdout.write('\nApprove in your wallet app — one signature for all orders.\n');
    } else if (opts.from && opts.to && opts.amount && opts.price) {
      const body: Record<string, any> = {
        fromToken: opts.from,
        toToken: opts.to,
        amount: opts.amount,
        price: parseFloat(opts.price),
      };
      if (slippage !== undefined) body.slippage = slippage;

      const result = await apiPost('/v1/dex/order', body);
      printSwapResult(result, opts);
    } else {
      printError('Provide --from/--to/--amount/--price for a single order, or --file for batch.');
      process.exitCode = 1;
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
