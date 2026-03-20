# 🎰 Soroban Decentralized Lottery

## 📌 Project Description

The **Soroban Decentralized Lottery** is a transparent, secure, and fully on-chain lottery system built on the Stellar network. It enables verifiable and tamper-proof prize distribution where participants enter by purchasing tickets, and winners are selected using cryptographic randomness.

This project is designed to eliminate the need for centralized lotteries by ensuring that funds are managed strictly by contract code, and the "Pick Winner" process is publicly verifiable.

## ⚡ What it does

* **Ticket Purchase:** Allows users to enter the participant pool by paying a set ticket price in a single transaction.
* **On-Chain Randomness:** Utilizes Soroban's native `prng` (Pseudo-Random Number Generator) for mathematically fair winner selection.
* **Automated Payouts:** Automatically transfers the entire prize pool to the winner without requiring a middleman.
* **State Management:** Securely manages active/inactive states to prevent entries after a round has concluded.

## ✨ Features

* **🌍 Decentralized:** No central server; all participant data and funds live securely on the Stellar ledger.
* **🔐 Secure Auth:** Uses Soroban's `require_auth()` to ensure participants are spending their own funds to enter.
* **🔍 Complete Transparency:** Anyone can query the `get_players` function to see the current participant pool.
* **⚡ Gas Efficient:** Optimized Rust code for minimal resource and fee consumption.
* **🛡️ Admin Controls:** Authorized admins can initialize the contract, set ticket prices, and trigger the final draw.

## 🛠️ Tech Stack

* **Language:** Rust
* **Framework:** Soroban SDK
* **Blockchain:** Stellar Network



## 🧠 How it Works

1. **Initialization:** The Admin initializes the contract with a specific Token (e.g., test USDC/XLM) and a Ticket Price.
2. **Participation:** Users invoke `buy_ticket`. The contract charges them the ticket price and adds their address to the ledger.
3. **The Draw:** The Admin invokes `pick_winner`. The contract generates a random number, selects a winner, transfers the pooled tokens to them, and resets the lottery for the next round!

## 📄 Contract Functions

🔹 `initialize`
* **Purpose:** Sets up the lottery round.
* **Parameters:** `admin` (Address), `token_addr` (Address), `ticket_price` (i128)

🔹 `buy_ticket`
* **Purpose:** Enters a user into the lottery.
* **Parameters:** `buyer` (Address)

🔹 `pick_winner`
* **Purpose:** Selects a random winner and pays out the pool.
* **Returns:** Winner's Address

🔹 `get_players`
* **Purpose:** Views the current participant pool.
* **Returns:** Vector of Addresses

## ⚙️ Installation & Build

```bash
# Clone the repository
git clone https://github.com/dev-rps/decentralized-lottery.git

# Navigate into the project
cd decentralized-lottery/contracts/hello-world

# Build the contract
stellar contract build
```

## 🚀 Deployment

Deploy the contract on the Stellar Testnet:
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source YOUR_ACCOUNT \
  --network testnet
```

## 🌐 Deployed Smart Contract

* **Contract Address:** `CD6YZWTTVLPVWB5CEH76IE7YVYQBY3V7VZFKMWTZ2ZDMD4XPYFYEWSJJ`
* **Network:** Stellar Testnet
* **Link Address:** https://stellar.expert/explorer/testnet/contract/CD6YZWTTVLPVWB5CEH76IE7YVYQBY3V7VZFKMWTZ2ZDMD4XPYFYEWSJJ


## 🧪 Future Improvements

* 📦 **Multiple Winners:** Support for 1st, 2nd, and 3rd place prize splits.
* ⏳ **Time-Locked Draws:** Automatically trigger draws via a cron job instead of an admin trigger.
* 🎯 **Dynamic Ticket Pricing:** Allowing users to buy multiple entries in a single transaction.
* 🌐 **Frontend Dashboard:** A React/Next.js UI for users to seamlessly buy tickets with their Freighter wallet.

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request if you want to add new features or optimize the logic.

## 👤 Author

* **Name:** Rudra Pratap Singh
* **Email:** rpscodes@gmail.com
* **GitHub:** [dev-rps](https://github.com/dev-rps)

## 📜 License

This project is licensed under the MIT License.

## ⭐ Acknowledgment

Built using the powerful **Soroban SDK** on the Stellar network to enable scalable, transparent, and efficient smart contract development.

## dApp Full Stack Deployment
**contract address:** CD6YZWTTVLPVWB5CEH76IE7YVYQBY3V7VZFKMWTZ2ZDMD4XPYFYEWSJJ
<img width="1920" height="1080" alt="contract-id" src="https://github.com/user-attachments/assets/1e63b610-e023-49a6-9689-f7174a0896bc" />

**dApp Link:** https://new-decentralized-lottery.vercel.app/
<img width="1920" height="1080" alt="frontend-lottery" src="https://github.com/user-attachments/assets/8d003d71-6507-4b22-9c60-d657b11875e2" />





