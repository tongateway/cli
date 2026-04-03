---
name: tgw
description: "tgw CLI — TON blockchain from the terminal. Wallet info, transfers, jettons, NFTs, .ton DNS, prices, DEX swaps, and agent wallets. Package: @tongateway/cli"
---

# tgw CLI

`tgw` is a command-line tool for TON blockchain. Check balances, send transfers, swap tokens on DEX, resolve .ton names, and manage agent wallets — all from the terminal.

**Install:** `npm i -g @tongateway/cli`

## Authentication

```bash
tgw auth
# → generates a connect link: https://tongateway.ai/connect?authId=...
# → open the link, connect your wallet

tgw auth:complete <authId>
# → completes auth, saves token, prints wallet address

tgw auth <token>
# → saves token directly (if you already have one)
```

Token is stored in `~/.tongateway/token`. You can also set `AGENT_GATEWAY_TOKEN` env var.

## Commands

### Wallet

```bash
tgw wallet info                 # Address, TON balance, account status
tgw wallet jettons              # All token balances (USDT, NOT, DOGS, BUILD, etc.)
tgw wallet transactions         # Recent tx history
tgw wallet transactions --limit 50
tgw wallet nfts                 # NFTs in the wallet
```

### Transfer

```bash
tgw transfer send --to EQabc... --amount 1.5                    # Send 1.5 TON
tgw transfer send --to alice.ton --amount 100 --comment "gm"    # .ton names supported
tgw transfer send --to EQabc... --amount 50 --token USDT        # Send jettons
tgw transfer status <id>                                         # Check transfer status
tgw transfer pending                                             # List pending transfers
tgw transfer batch --file transfers.json                         # Batch (up to 4)
```

### Lookup

```bash
tgw lookup resolve alice.ton     # Resolve .ton domain to address
tgw lookup price                 # TON price in USD
tgw lookup price --currency EUR  # TON price in EUR
```

### DEX

```bash
tgw dex pairs                                                           # List tokens
tgw dex swap --from NOT --to TON --amount 10000 --price 0.000289        # Place order
tgw dex swap --from USDT --to AGNT --amount 5 --price 20               # 1 USDT = 20 AGNT
```

Supported tokens: TON, NOT, USDT, DOGS, BUILD, AGNT, CBBTC, PX, XAUT0

### Agent Wallet

```bash
tgw agent deploy                                          # Deploy agent wallet (autonomous, no approval)
tgw agent info --address EQagent...                       # Balance, seqno, status
tgw agent transfer --address EQagent... --to EQabc... --amount 1.5
tgw agent batch --address EQagent... --file transfers.json  # Batch (up to 255)
```

## JSON Output

Every command supports `--json` for machine-readable output:

```bash
tgw --json wallet info          # Raw JSON to stdout
tgw --json wallet jettons | jq '.balances[].symbol'
tgw --json dex pairs            # Pipe to scripts
```

## Usage Examples

### Check wallet and swap tokens

```bash
tgw wallet info
# Address  EQ9d43...0c02
# Balance  823.18 TON
# Status   active

tgw wallet jettons
# Token   Balance      Address
# NOT     3,186,370.6  0:2f95...
# USDT    107.79       0:b113...
# BUILD   45,277.57    0:589d...

tgw dex swap --from NOT --to TON --amount 10000 --price 0.000289
# Order    NOT → TON
# Amount   10000
# Price    0.000289 TON per NOT
# Slippage 4%
# Request ID tx-abc123
#
# Approve in your wallet app.
```

### Send TON to .ton domain

```bash
tgw lookup resolve alice.ton
# alice.ton  EQ83df...31a8

tgw transfer send --to alice.ton --amount 0.5
# Request ID  tx-def456
# To          alice.ton
# Amount      0.5 TON
# Status      pending
#
# Approve in your wallet app.
```

## Important

- All amounts are human-readable (e.g. `1.5` for 1.5 TON, not nanoTON)
- Transfers require wallet approval in your TON wallet app
- Agent wallet transfers execute immediately without approval
- Token persists in `~/.tongateway/token` across sessions
- `--json` flag works on every command for scripting/AI use

## Links

- Website: https://tongateway.ai
- npm: https://www.npmjs.com/package/@tongateway/cli
- GitHub: https://github.com/tongateway/cli
