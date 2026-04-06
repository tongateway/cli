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

export async function runDexSwap(opts: { from?: string; to?: string; amount?: string; price?: string; file?: string; json: boolean }): Promise<void> {
  try {
    if (opts.file) {
      // Batch: send orders one by one (TonConnect can only handle one tx at a time)
      const raw = readFileSync(opts.file, 'utf-8');
      const orders = JSON.parse(raw) as Array<{ fromToken: string; toToken: string; amount: string; price: number }>;

      if (!orders.length) {
        printError('No orders in file.');
        process.exitCode = 1;
        return;
      }

      const results: any[] = [];
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        if (!opts.json) {
          process.stdout.write(`\n--- Order ${i + 1}/${orders.length} ---\n\n`);
        }

        const result = await apiPost('/v1/dex/order', {
          fromToken: o.fromToken,
          toToken: o.toToken,
          amount: o.amount,
          price: o.price,
        });

        results.push(result);
        printSwapResult(result, opts);

        // Wait between orders so user can approve each one
        if (i < orders.length - 1 && !opts.json) {
          process.stdout.write('\nWaiting 5s for approval before next order...\n');
          await new Promise(r => setTimeout(r, 5000));
        }
      }

      if (opts.json) {
        printJson({ orders: results });
      }
    } else if (opts.from && opts.to && opts.amount && opts.price) {
      const result = await apiPost('/v1/dex/order', {
        fromToken: opts.from,
        toToken: opts.to,
        amount: opts.amount,
        price: parseFloat(opts.price),
      });
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
