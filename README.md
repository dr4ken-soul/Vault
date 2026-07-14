# Vault

Autonomous fantasy football manager for the **Tether Developers Cup**.

A QVAC-path agent evaluates your squad on device, negotiates trades with other agents, and settles in **USDt** through **WDK**. You never pick a lineup and never approve a trade manually.

**Tracks:** QVAC (Local AI) · WDK (Wallets)

## Demo in 60 seconds

1. `npm install` (first time only)
2. `npm run dev`
3. Open the local URL
4. Click **Connect wallet and enter demo**
5. Watch the dashboard: agent evaluates, proposes, negotiates, and settles a USDt trade into the live feed

Full pre-demo checklist, spoken script, and submission steps: **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)**

## Setup

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Optional environment:

```bash
# .env
VITE_EVM_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## What is real

| Surface | Implementation |
| --- | --- |
| Wallet creation | `@tetherto/wdk` + `@tetherto/wdk-wallet-evm` BIP-39 seed wallets |
| Spending limits | WDK policy registration + application-level enforcement |
| Settlement | WDK-signed settlement receipts with deterministic `txRef` hashes |
| Agent loop | On-device evaluate → propose → negotiate → settle |
| QVAC | Adapter for `@qvac/sdk` when available; pure on-device evaluator in the browser demo path (no cloud LLM) |
| UI | Full landing + wallet-gated app (`/app`, `/squad`, `/agent`, `/trades`) |

Player stats are **illustrative and internally consistent** for the hackathon demo. Live match feeds are out of scope for this MVP (see `APP_BLUEPRINT.md`).

## Project docs

| File | Purpose |
| --- | --- |
| `CLAUDE.md` | Agent rules and non-negotiables |
| `APP_BLUEPRINT.md` | Product scope and data model |
| `BUILD_GUIDE.md` | Build phases |
| `FRONTEND_SPEC.md` | UI specification |
| `MARKETING.md` | Social copy |

## Stack

- React 18+ / Vite / TypeScript
- Tailwind CSS (design tokens as CSS variables)
- `motion/react`
- TanStack React Query
- Zustand
- React Router
- `@tetherto/wdk` + `@tetherto/wdk-wallet-evm`
- QVAC adapter (`@qvac/sdk` optional on Node/Bare hosts)

## License

MIT
