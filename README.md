# tgw

[![npm version](https://img.shields.io/npm/v/@tongateway/cli.svg)](https://www.npmjs.com/package/@tongateway/cli)
[![npm downloads](https://img.shields.io/npm/dm/@tongateway/cli.svg)](https://www.npmjs.com/package/@tongateway/cli)
[![npm total downloads](https://img.shields.io/npm/dt/@tongateway/cli.svg)](https://www.npmjs.com/package/@tongateway/cli)

TON blockchain from your terminal. Wallet info, transfers, DEX swaps, .ton DNS, and agent wallets.

## Install

```bash
npm i -g @tongateway/cli
```

## Quick Start

```bash
# Connect your wallet
tgw auth

# Check balance
tgw wallet info

# Send TON
tgw transfer send --to alice.ton --amount 1.5

# Swap tokens
tgw dex swap --from USDT --to BUILD --amount 10 --price 500
```

## Authentication

```bash
tgw auth                    # Get a connect link — open it, connect your wallet
tgw auth:complete <authId>  # Complete auth after connecting
tgw auth <token>            # Or pass a token directly
```

Token is saved to `~/.tongateway/token`. Or set `AGENT_GATEWAY_TOKEN` env var.

## Commands

### Wallet

| Command | Description |
|---------|-------------|
| `tgw wallet info` | Address, TON balance, account status |
| `tgw wallet jettons` | All token balances (USDT, NOT, DOGS, BUILD, etc.) |
| `tgw wallet transactions` | Recent transaction history |
| `tgw wallet nfts` | NFTs in the wallet |

### Transfer

| Command | Description |
|---------|-------------|
| `tgw transfer send --to <addr> --amount <n>` | Send TON (supports .ton names) |
| `tgw transfer send --to <addr> --amount <n> --token USDT` | Send jettons |
| `tgw transfer status <id>` | Check transfer status |
| `tgw transfer pending` | List pending transfers |
| `tgw transfer batch --file <path>` | Batch transfer (up to 4, single approval) |

### DEX

| Command | Description |
|---------|-------------|
| `tgw dex pairs` | List available tokens |
| `tgw dex swap --from <token> --to <token> --amount <n> --price <p>` | Place a limit order |
| `tgw dex swap --file orders.json` | Batch orders (single approval) |
| `tgw dex swap ... --slippage <percent>` | Custom slippage (default: 1%) |

Supported tokens: TON, NOT, USDT, DOGS, BUILD, AGNT, CBBTC, PX, XAUT0

**Batch orders** are sent as one transaction — one wallet approval for all orders:

```json
[
  {"fromToken": "NOT", "toToken": "TON", "amount": "10000", "price": 0.000289},
  {"fromToken": "USDT", "toToken": "AGNT", "amount": "5", "price": 20}
]
```

### Lookup

| Command | Description |
|---------|-------------|
| `tgw lookup resolve <name>` | Resolve .ton domain to address |
| `tgw lookup price` | TON price in USD |
| `tgw lookup price --currency EUR` | TON price in other currencies |

### Agent Wallet

Autonomous wallets that execute transfers without approval.

| Command | Description |
|---------|-------------|
| `tgw agent deploy` | Deploy an agent wallet |
| `tgw agent info --address <addr>` | Balance, seqno, status |
| `tgw agent transfer --address <addr> --to <recipient> --amount <n>` | Transfer (no approval) |
| `tgw agent batch --address <addr> --file <path>` | Batch transfer (up to 255) |

## JSON Output

Every command supports `--json` for scripting and AI agents:

```bash
tgw --json wallet info
tgw --json wallet jettons | jq '.balances[].symbol'
tgw --json dex pairs
```

## Examples

```bash
# Check wallet
tgw wallet info
# Address  EQ9d43...0c02
# Balance  823.18 TON
# Status   active

# View tokens
tgw wallet jettons
# Token   Balance         Address
# NOT     3,186,370.6     0:2f95...
# USDT    107.79          0:b113...
# BUILD   45,277.57       0:589d...

# Resolve .ton name and send
tgw lookup resolve alice.ton
# alice.ton  EQ83df...31a8

tgw transfer send --to alice.ton --amount 0.5
# Request ID  tx-def456
# To          alice.ton
# Amount      0.5 TON
# Status      pending
# Approve in your wallet app.

# Swap on DEX
tgw dex swap --from NOT --to TON --amount 10000 --price 0.000289
# Order      NOT -> TON
# Amount     10000
# Price      0.000289 TON per NOT
# Slippage   1%
# Request ID tx-abc123
# Approve in your wallet app.
```

## Links

- [Website](https://tongateway.ai)
- [MCP Server](https://github.com/tongateway/mcp) (for AI agent integration)
- [API Docs](https://api.tongateway.ai/docs)

## License

MIT
