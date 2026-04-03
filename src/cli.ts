#!/usr/bin/env node

import { Command } from 'commander';
import { runAuth } from './commands/auth.js';

const program = new Command();

program
  .name('tgw')
  .description('TON blockchain CLI — wallet, transfers, DEX, agent wallets')
  .version('0.1.0')
  .option('--json', 'Output raw JSON', false);

program
  .command('auth [token]')
  .description('Authenticate with TON gateway')
  .action(async (token: string | undefined) => {
    const opts = program.opts();
    await runAuth(token, { json: opts.json });
  });

program.parse();
