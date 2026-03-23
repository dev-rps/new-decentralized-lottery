# 🎰 Nexus Lottery - Soroban DApp

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue.svg)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart_Contract-orange.svg)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)

A fully decentralized, transparent, and permissionless lottery system built on the **Stellar Network** using **Soroban Smart Contracts**. Participate in mathematically fair prize pools with on-chain verifiable randomness and a **Pull-over-Push** prize distribution model.

---

## 🚀 Live DApp
**🔗 [Explore the Lottery DApp](https://new-decentralized-lottery.vercel.app/)**

**Contract Address:** [`CCIZ7EKPCYIZVIQ5IEBYJJBRIA4LJWXB6NSQDPEB72HIQKQPVHVLZ3MK`](https://stellar.expert/explorer/testnet/contract/CCIZ7EKPCYIZVIQ5IEBYJJBRIA4LJWXB6NSQDPEB72HIQKQPVHVLZ3MK)

![Contract Interface](https://github.com/user-attachments/assets/836357b6-192c-4ece-9bad-947dfd6f306a)

![DApp Interface](https://github.com/user-attachments/assets/d6486459-c08b-4167-bc64-60baf49013c8)

---

## ✨ Features

- **🌍 Fully On-Chain:** All lottery states, participant lists, and prize pools are managed strictly by code on the Stellar ledger.
- **🔐 Permissionless:** Anyone can create a new pool or buy a ticket without central approval.
- **🎲 Verifiable Randomness:** Uses Soroban's native `prng` (Pseudo-Random Number Generator) for fair winner selection.
- **🛡️ Pull-over-Push Security:** Winner selection and prize distribution are split into separate transactions (`draw_winner` + `claim_prize`) to avoid Soroban footprint errors.
- **📜 Draw History:** Full on-chain history of past lotteries with winner addresses and claim status.
- **⏱️ Live Countdown:** Real-time countdown timer with automatic state transitions.
- **💸 Dynamic Ticket Pricing:** Supports any SAC (Smart Asset Contract) compliant tokens (e.g., Native XLM).

---

## 🛠️ Tech Stack

- **Smart Contract:** Rust & Soroban SDK
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Framer Motion
- **Blockchain Interaction:** `@stellar/stellar-sdk` & `@stellar/freighter-api`
- **Network:** Stellar Testnet

---

## 🧠 Architectural Overview

### 1. Smart Contract Storage
The contract uses **Persistent Storage** to manage the state of each lottery round. This ensures that:
- Participant lists scale correctly without hitting instance size limits too early.
- Storage is maintained across different ledger entries for high reliability.

### 2. Randomness Mechanism
The `draw_winner` function utilizes the provided `env.prng().u64_in_range(0, count)` to select an index from the participant array. This bypasses the predictability of block-based randomness found in less advanced networks.

### 3. Frontend Polling
The Next.js frontend utilizes background indexing and simulation-based polling to provide a real-time "ACTIVE/ENDED" status and countdown timer without requiring an external centralized backend.

---

## 📄 Smart Contract API

### `create_lottery(creator, token, ticket_price, duration)`
Initializes a new prize pool.
- `creator`: The address authorized to manage the draw (though anyone can call it after expiry).
- `token`: The SAC token used for the prize pool (e.g., XLM).
- `ticket_price`: Cost per entry in Stroops (10^7 scale).
- `duration`: Time in seconds until the draw is unlocked.

### `buy_ticket(lottery_id, buyer)`
Enters a user into the specified pool.
- Requires caller authentication.
- Checks if the lottery is active and the buyer has sufficient balance.

### `draw_winner(lottery_id)`
Selects the winner using on-chain PRNG.
- Can only be called after the `end_time` has passed.
- Stores the winner address in contract state but **does not transfer tokens** (Pull-over-Push pattern).

### `claim_prize(lottery_id)`
Transfers the prize pool to the selected winner.
- Can only be called after `draw_winner` has been executed.
- Prevents double-claims via `prize_claimed` flag.
- Anyone can trigger this — the funds always go to the winner's address.

### `get_lottery(lottery_id)`
View function to return current pool metadata, participants, winner, and claim status.

### `get_latest_id()`
Returns the most recent lottery ID for frontend discovery.

---

## ⚙️ Development & Setup

### 1. Smart Contract (Rust)
```bash
# Navigate to the contract directory
cd contracts/lottery

# Build the WASM binary
stellar contract build

# Run automated integration tests
cargo test
```

### 2. Frontend (Next.js)
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run localized development server
npm run dev
```

---

## 🚀 Deployment Guide

To deploy your own instance of the lottery:

1. **Deploy WASM:**
   ```bash
   stellar contract deploy \
     --wasm target/wasm32v1-none/release/lottery.wasm \
     --source YOUR_ACCOUNT_ALIAS \
     --network testnet
   ```
2. **Update Frontend:**
   Copy the generated `Contract ID` and update it in `frontend/src/lib/stellar.ts`.

---

## 🤝 Contributing
Contributions are welcome! Please fork the repo and submit a PR for any features like "Multiple Payouts" or "Governance Voting".

## 👤 Author
- **Rudra Pratap Singh**
- [rpscodes@gmail.com](mailto:rpscodes@gmail.com)
- GitHub: [@dev-rps](https://github.com/dev-rps)

---

## 📜 License
Licensed under the **MIT License**.
