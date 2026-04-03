import { apiGet, apiPost } from '../api.js';
import { printKeyValue, printJson, printError } from '../output.js';

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

export async function runDexSwap(opts: { from: string; to: string; amount: string; price: string; json: boolean }): Promise<void> {
  try {
    const result = await apiPost('/v1/dex/order', {
      fromToken: opts.from,
      toToken: opts.to,
      amount: opts.amount,
      price: parseFloat(opts.price),
    });
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Order': `${opts.from} → ${opts.to}`,
        'Amount': opts.amount,
        'Price': `${opts.price} ${opts.to} per ${opts.from}`,
        'Slippage': `${result.swap?.slippage ?? 4}%`,
        'Request ID': result.id,
      });
      process.stdout.write('\nApprove in your wallet app.\n');
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
