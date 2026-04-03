import { readFileSync } from 'node:fs';
import { apiGet, apiPost } from '../api.js';
import { printKeyValue, printJson, printError } from '../output.js';

export async function runAgentDeploy(opts: { json: boolean }): Promise<void> {
  try {
    const result = await apiPost('/v1/agent-wallet/deploy', {});
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Agent Wallet': result.address,
        'Wallet ID': String(result.walletId ?? ''),
        'Public Key': result.agentPublicKey ?? '',
      });
      process.stdout.write('\nTop up this wallet with TON before using it.\n');
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runAgentInfo(opts: { address: string; json: boolean }): Promise<void> {
  try {
    const result = await apiGet(`/v1/agent-wallet/${encodeURIComponent(opts.address)}/info`);
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Address': result.address ?? opts.address,
        'Balance': result.balance ?? '',
        'Seqno': String(result.seqno ?? ''),
      });
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runAgentTransfer(opts: { address: string; to: string; amount: string; token: string; json: boolean }): Promise<void> {
  try {
    const result = await apiPost('/v1/safe/tx/transfer', {
      to: opts.to,
      amount: opts.amount,
      agentWallet: opts.address,
    });
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Request ID': result.id,
        'From': opts.address,
        'To': opts.to,
        'Amount': `${opts.amount} ${opts.token}`,
        'Status': result.status ?? 'pending',
      });
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}

export async function runAgentBatch(opts: { address: string; file: string; json: boolean }): Promise<void> {
  try {
    const raw = readFileSync(opts.file, 'utf-8');
    const transfers = JSON.parse(raw);
    const result = await apiPost('/v1/agent-wallet/batch', {
      walletAddress: opts.address,
      transfers,
    });
    if (opts.json) {
      printJson(result);
    } else {
      printKeyValue({
        'Wallet': opts.address,
        'Transfers': `${transfers.length}`,
        'Status': result.status ?? 'sent',
      });
    }
  } catch (e: any) {
    printError(e.message);
    process.exitCode = 1;
  }
}
