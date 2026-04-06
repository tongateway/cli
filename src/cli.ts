#!/usr/bin/env node

import { Command } from 'commander';
import { runAuth, runAuthComplete } from './commands/auth.js';
import { runWalletInfo, runWalletJettons, runWalletTransactions, runWalletNfts } from './commands/wallet.js';
import { runTransferSend, runTransferStatus, runTransferPending, runTransferBatch } from './commands/transfer.js';
import { runLookupResolve, runLookupPrice } from './commands/lookup.js';
import { runDexPairs, runDexSwap } from './commands/dex.js';
import { runAgentDeploy, runAgentInfo, runAgentTransfer, runAgentBatch } from './commands/agent.js';

const program = new Command();

program
  .name('tgw')
  .description('TON blockchain CLI — wallet, transfers, DEX, agent wallets')
  .version('0.2.0')
  .option('--json', 'Output raw JSON', false);

// --- Auth ---

program
  .command('auth [token]')
  .description('Authenticate — run with no args to get a connect link, or pass a token directly')
  .action(async (token: string | undefined) => {
    await runAuth(token, { json: program.opts().json });
  });

program
  .command('auth:complete <authId>')
  .description('Complete authentication after connecting wallet')
  .action(async (authId: string) => {
    await runAuthComplete(authId, { json: program.opts().json });
  });

// --- Wallet ---

const wallet = program.command('wallet').description('Wallet balance, tokens, transactions, NFTs');

wallet.command('info').description('Show wallet address, TON balance, and status')
  .action(async () => { await runWalletInfo({ json: program.opts().json }); });

wallet.command('jettons').description('List all token balances')
  .action(async () => { await runWalletJettons({ json: program.opts().json }); });

wallet.command('transactions').description('Show recent transaction history')
  .option('--limit <n>', 'Number of transactions', '10')
  .action(async (cmdOpts) => { await runWalletTransactions({ limit: parseInt(cmdOpts.limit, 10), json: program.opts().json }); });

wallet.command('nfts').description('List NFTs in the wallet')
  .action(async () => { await runWalletNfts({ json: program.opts().json }); });

// --- Transfer ---

const transfer = program.command('transfer').description('Send TON, check status, manage pending transfers');

transfer.command('send').description('Send TON or jettons')
  .requiredOption('--to <address>', 'Recipient address or .ton name')
  .requiredOption('--amount <amount>', 'Human-readable amount')
  .option('--token <symbol>', 'Token symbol', 'TON')
  .option('--comment <text>', 'Transfer comment', '')
  .action(async (cmdOpts) => { await runTransferSend({ ...cmdOpts, json: program.opts().json }); });

transfer.command('status <id>').description('Check transfer status')
  .action(async (id: string) => { await runTransferStatus(id, { json: program.opts().json }); });

transfer.command('pending').description('List pending transfers')
  .action(async () => { await runTransferPending({ json: program.opts().json }); });

transfer.command('batch').description('Batch transfer (up to 4)')
  .requiredOption('--file <path>', 'JSON file with transfers array')
  .action(async (cmdOpts) => { await runTransferBatch({ file: cmdOpts.file, json: program.opts().json }); });

// --- Lookup ---

const lookup = program.command('lookup').description('Resolve .ton names and check prices');

lookup.command('resolve <name>').description('Resolve a .ton domain name to an address')
  .action(async (name: string) => { await runLookupResolve(name, { json: program.opts().json }); });

lookup.command('price').description('Get current TON price')
  .option('--currency <code>', 'Currency code', 'USD')
  .action(async (cmdOpts) => { await runLookupPrice({ currency: cmdOpts.currency, json: program.opts().json }); });

// --- DEX ---

const dex = program.command('dex').description('DEX trading — pairs and swap orders');

dex.command('pairs').description('List available trading pairs')
  .action(async () => { await runDexPairs({ json: program.opts().json }); });

dex.command('swap').description('Place a DEX swap order (single or batch via --file)')
  .option('--from <symbol>', 'Token to sell')
  .option('--to <symbol>', 'Token to buy')
  .option('--amount <amount>', 'Amount to sell')
  .option('--price <price>', 'Price per fromToken in toToken')
  .option('--file <path>', 'JSON file with orders array for batch')
  .action(async (cmdOpts) => { await runDexSwap({ ...cmdOpts, json: program.opts().json }); });

// --- Agent Wallet ---

const agent = program.command('agent').description('Agent wallet — deploy, transfer, info');

agent.command('deploy').description('Deploy an agent wallet smart contract')
  .action(async () => { await runAgentDeploy({ json: program.opts().json }); });

agent.command('info').description('Get agent wallet info')
  .requiredOption('--address <address>', 'Agent wallet address')
  .action(async (cmdOpts) => { await runAgentInfo({ address: cmdOpts.address, json: program.opts().json }); });

agent.command('transfer').description('Transfer from agent wallet')
  .requiredOption('--address <address>', 'Agent wallet address')
  .requiredOption('--to <recipient>', 'Recipient address')
  .requiredOption('--amount <amount>', 'Amount to send')
  .option('--token <symbol>', 'Token symbol', 'TON')
  .action(async (cmdOpts) => { await runAgentTransfer({ ...cmdOpts, json: program.opts().json }); });

agent.command('batch').description('Batch transfer from agent wallet (up to 255)')
  .requiredOption('--address <address>', 'Agent wallet address')
  .requiredOption('--file <path>', 'JSON file with transfers array')
  .action(async (cmdOpts) => { await runAgentBatch({ ...cmdOpts, json: program.opts().json }); });

program.parse();
