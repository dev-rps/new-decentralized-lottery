# 🎰 Nexus Lottery - Soroban DApp

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue.svg)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart_Contract-orange.svg)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)

## 📖 Project Description
**Nexus Lottery** is a fully decentralized, transparent, and permissionless prize pool system built on the **Stellar Network** using **Soroban Smart Contracts**. 

Traditional lotteries often suffer from opaque draw mechanisms and centralized control. Nexus solves this by anchoring the entire lifecycle on-chain:
- **Verifiable Randomness**: Selects winners using Soroban's native `prng` (Pseudo-Random Number Generator), ensuring mathematical fairness that cannot be tampered with by administrators.
- **Permissionless Pool Creation**: Any user can launch a new prize pool for any SAC-compliant token (XLM, USDC, etc.), democratizing the lottery experience.
- **Security-First Architecture**: Implements a **Pull-over-Push** prize distribution model, separating the draw from the payout to maintain ledger integrity and avoid gas limit errors.

---

## 📸 Visual Proof 

### 1. Wallet Connected State
![Wallet Connected](https://github.com/user-attachments/assets/8518d62d-4385-4bdf-bd1c-c04e814fddf6)


### 2. Balance Displayed
![Balance Displayed](https://github.com/user-attachments/assets/333e177a-e10f-4eff-aa0e-6327d5246c03)


### 3. Successful Testnet Transaction
![Successful Transaction](https://github.com/user-attachments/assets/45ef0c92-adb6-4537-8dab-000fb4712f49)


### 4. Transaction Result Shown to User
![Transaction Result](https://github.com/user-attachments/assets/dfc2c4d6-3599-48c6-8a70-a89be3d5775b)

---

## 🚀 Live DApp
**🔗 [Explore the Lottery DApp](https://new-decentralized-lottery.vercel.app/)**

**Contract Address:** [`CCIZ7EKPCYIZVIQ5IEBYJJBRIA4LJWXB6NSQDPEB72HIQKQPVHVLZ3MK`](https://stellar.expert/explorer/testnet/contract/CCIZ7EKPCYIZVIQ5IEBYJJBRIA4LJWXB6NSQDPEB72HIQKQPVHVLZ3MK)

![Contract Interface](https://github.com/user-attachments/assets/ef4b2b0e-1915-4dad-a802-2df6f05e499f)

![DApp Interface](https://github.com/user-attachments/assets/94dc6d80-ded1-4a3c-a60c-3c61ccc5c118)

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

## ⚙️ Setup & Installation

### Prerequisites
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli) installed.
- [Node.js v20+](https://nodejs.org/) and `npm` installed.
- [Freighter Wallet](https://www.freighter.app/) extension (Testnet enabled).

### 1. Smart Contract (Soroban/Rust)
```bash
# Navigate to the contract directory
cd contracts/lottery

# Build the WASM binary
stellar contract build

# Run unit tests to verify logic
cargo test
```

### 2. Frontend (Next.js)
```bash
# Navigate to the frontend directory from root
cd frontend

# Install dependencies
npm install

# Create a .env.local (optional) or update CONTRACT_ID in src/lib/stellar.ts
# Run localized development server
npm run dev
```
Open `http://localhost:3000` to interact with the local DApp.

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
