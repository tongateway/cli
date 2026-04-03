import { saveToken, getApiUrl } from '../config.js';
import { printKeyValue, printJson, printError } from '../output.js';

export async function runAuth(token: string | undefined, opts: { json: boolean }): Promise<void> {
  if (!token) {
    // Start interactive auth flow — request a connect link from the API
    try {
      const res = await fetch(`${getApiUrl()}/v1/auth/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'tgw-cli' }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error ?? 'Failed');

      process.stdout.write([
        'Open this link and connect your wallet:',
        '',
        `  ${data.authUrl}`,
        '',
        'Then run:',
        `  tgw auth:complete ${data.authId}`,
        '',
      ].join('\n') + '\n');

      if (opts.json) {
        printJson(data);
      }
    } catch (e: any) {
      printError(e.message ?? 'Failed to start auth');
      process.exitCode = 1;
    }
    return;
  }

  saveToken(token);

  try {
    const res = await fetch(`${getApiUrl()}/v1/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error ?? 'Invalid token');

    if (opts.json) {
      printJson(data);
    } else {
      printKeyValue({
        'Authenticated': 'yes',
        'Address': data.address,
        'Status': data.status ?? 'active',
      });
    }
  } catch (e: any) {
    printError(e.message ?? 'Failed to verify token');
    process.exitCode = 1;
  }
}

export async function runAuthComplete(authId: string, opts: { json: boolean }): Promise<void> {
  try {
    // Retry up to 3 times with 2s delay (KV eventual consistency)
    let data: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`${getApiUrl()}/v1/auth/check/${authId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      data = await res.json() as any;
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      if (data.status === 'completed') break;
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
    }

    if (data.status === 'pending') {
      process.stdout.write('Wallet not connected yet. Open the link and try again.\n');
      process.exitCode = 1;
      return;
    }

    if (!data.token) {
      throw new Error('No token received');
    }

    saveToken(data.token);

    if (opts.json) {
      printJson({ address: data.address, status: 'authenticated' });
    } else {
      printKeyValue({
        'Authenticated': 'yes',
        'Address': data.address,
      });
    }
  } catch (e: any) {
    printError(e.message ?? 'Failed to complete auth');
    process.exitCode = 1;
  }
}
