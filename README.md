# Soroban Decentralized Lottery

A transparent, secure, and decentralized lottery system built on the **Stellar Network** using the **Soroban Smart Contract** framework.

## 📝 Project Description
This project implements a fair-play lottery system where users can participate by purchasing tickets. Unlike traditional lotteries, the logic is entirely on-chain, ensuring that the "Pick Winner" process is verifiable and the funds are managed by the contract code rather than a centralized entity.

## 🚀 What it does
1.  **Ticket Purchase**: Users can call the `buy_ticket` function to enter their address into the participant pool.
2.  **Random Selection**: The contract utilizes Soroban's native `prng` (Pseudo-Random Number Generator) to select a winner, ensuring cryptographic unpredictability within the Stellar runtime.
3.  **Admin Control**: An authorized administrator initializes the lottery and triggers the winner selection process.

## ✨ Features
* **Decentralized**: No central server; all data lives on the Stellar ledger.
* **Secure Auth**: Uses Soroban's `require_auth()` to ensure only the user can spend their own funds/identity to enter.
* **Transparency**: Anyone can query the `get_players` function to see the current pool.
* **Gas Efficient**: Optimized Rust code for minimal resource consumption.

## 🛠 Setup & Deployment
1. **Build the contract**:
   ```bash
   stellar contract build

contract deployment link : https://stellar.expert/explorer/testnet/contract/CCAEG5HJRFLTWTLCLDJ6B5CADIPISJYE5AAHIHUNJFKQGNN3L46NJNJV
<img width="1920" height="1080" alt="Screenshot 2026-03-19 144407" src="https://github.com/user-attachments/assets/d1896aee-b8fe-45df-b67a-22091bd20565" />

