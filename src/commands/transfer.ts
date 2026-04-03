import { readFileSync } from 'node:fs';
import { apiGet, apiPost } from '../api.js';
import { printKeyValue, printTable, printJson, printError } from '../output.js';

export async function runTransferSend(opts: { to: string; amount: string; token: string; comment: string; json: boolean }): Promise<void> {
  try {
    const body: Record<string, any> = { to: opts.to, amount: opts.amount };
    if (opts.comment) body.comment = opts.comment;
    const result = await apiPost('/v1/safe/tx/transfer', body);
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Request ID': result.id,
        'To': result.to,
        'Amount': `${opts.amount} ${opts.token}`,
        'Status': result.status,
      });
      process.stdout.write('\nApprove in your wallet app.\n');
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runTransferStatus(id: string, opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiGet(`/v1/safe/tx/${id}`);
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Request ID': result.id,
        'To': result.to ?? '',
        'Status': result.status,
      });
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runTransferPending(opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiGet('/v1/safe/tx/pending');
    const requests = result.requests ?? [];
    if (opts.json) { printJson(result); return; }
    if (!requests.length) { process.stdout.write('No pending transfers.\n'); return; }
    const rows = requests.map((r: any) => ({
      id: r.id,
      to: r.to ?? '',
      amount: r.amount ?? r.amountNano ?? '',
      status: r.status,
    }));
    printTable(rows, [
      { key: 'id', header: 'ID' },
      { key: 'to', header: 'To' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status' },
    ]);
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runTransferBatch(opts: { file: string; json: boolean }): Promise<void> {
  try {
    const raw = readFileSync(opts.file, 'utf-8');
    const transfers = JSON.parse(raw);
    const result = await apiPost('/v1/safe/tx/batch', { transfers });
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Batch ID': result.id ?? 'created',
        'Transfers': `${transfers.length}`,
        'Status': result.status ?? 'pending',
      });
      process.stdout.write('\nApprove in your wallet app — one signature for all transfers.\n');
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
