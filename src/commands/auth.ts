import { saveToken, getApiUrl } from '../config.js';
import { printKeyValue, printJson, printError } from '../output.js';

export async function runAuth(token: string | undefined, opts: { json: boolean }): Promise<void> {
  if (!token) {
    const msg = [
      'Get your token at: https://tongateway.ai/token',
      '',
      'Then run:',
      '  tgw auth <token>',
      '',
      'Or set the AGENT_GATEWAY_TOKEN environment variable.',
    ].join('\n');
    process.stdout.write(msg + '\n');
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
