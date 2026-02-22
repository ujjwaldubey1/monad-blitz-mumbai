# MicroWork — On-Chain Gig Micropayments for India's Informal Workers

> **No bank. No CIBIL score. Just proof of work.**

MicroWork is a decentralized gig micropayment platform built on **Monad Testnet**, designed for India's 450M+ informal workers — plumbers, electricians, delivery riders, domestic helpers — who are invisible to the traditional financial system.

Workers complete micro-jobs, get paid instantly through blockchain escrow, build an on-chain reputation, and unlock **micro-credit** — all without a bank account or credit history.

---

## 🔥 The Problem

India's informal economy is massive — ₹93 lakh crore ($1.1T) — yet the workers powering it face three brutal realities:

| Problem | Reality |
|---------|---------|
| **No proof of work** | A plumber who has done 500+ jobs has zero verifiable track record |
| **Payment disputes** | Clients refuse to pay after work is done. Workers have no recourse |
| **Zero credit access** | Banks require salary slips, ITR, CIBIL. Informal workers have none of this |

**MicroWork solves all three with one protocol.**

---

## 🏗️ How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Client      │     │  Escrow     │     │  Worker      │
│  posts job   │────▶│  locks MON  │────▶│  accepts job │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                    Both confirm completion      │
                           │                    │
                    ┌──────▼──────┐     ┌──────▼──────┐
                    │  Payment    │     │  Reputation  │
                    │  released   │     │  NFT minted  │
                    └─────────────┘     └──────┬──────┘
                                               │
                                        5+ jobs done?
                                               │
                                        ┌──────▼──────┐
                                        │  Micro-loan  │
                                        │  unlocked!   │
                                        └─────────────┘
```

### Step-by-Step User Flow

1. **Client posts a job** → describes the work + locks payment (MON) in escrow
2. **Worker browses & accepts** → picks a job from the open feed
3. **Work gets done** → both client and worker confirm completion on-chain
4. **Payment releases instantly** → MON goes straight to the worker's wallet
5. **Reputation NFT mints** → a soulbound (non-transferable) NFT recording the completed job
6. **Credit unlocks at 5 jobs** → workers with 5+ completed jobs can borrow 0.01 MON instantly

---

## 🧩 Smart Contracts

Three contracts working together, deployed on **Monad Testnet (Chain ID: 10143)**:

### 1. MicroWorkEscrow
The core payment protocol. Handles the full job lifecycle.

| Function | What it does |
|----------|-------------|
| `createJob()` | Client locks MON in escrow with a job description |
| `acceptJob()` | Worker claims an open job |
| `confirmCompletion()` | Either party confirms. When BOTH confirm → payment releases + NFT mints |
| `disputeJob()` | Either party can flag a dispute |
| `cancelJob()` | Client cancels an open job and gets a refund |

**Address:** `0xbcce751bE9026B62Fd7B58686a7aa89c66c155f1`

### 2. ReputationNFT (Soulbound ERC721)
On-chain work history. Every completed job mints a **non-transferable** NFT to the worker.

- Tracks `workerJobCount` — how many jobs each address has completed
- Soulbound — `transferFrom()` always reverts. You can't buy or sell reputation
- Used by MicroLoan to check credit eligibility

**Address:** `0x04951f27C2522d94C5FbFa51415A50603b1c7d70`

### 3. MicroLoan
Reputation-backed micro-lending. No banks, no credit scores — just proof of work.

| Parameter | Value |
|-----------|-------|
| Loan amount | 0.01 MON |
| Fee | 10% (0.001 MON) |
| Repayment | 0.011 MON |
| Duration | 7 days |
| Eligibility | 5+ completed jobs |

**Address:** `0x5ba59BcCCba4eB7cc05a2c525b19a6c74D58b806`

---

## 🖥️ Frontend

A **mobile-first React dApp** with three pages:

### Jobs Page
Post a micro-job with a description and payment amount. Funds lock in escrow instantly.

### Worker Dashboard
- **Reputation score** — number of verified jobs completed on-chain
- **Job feed** — browse, accept, and confirm open jobs
- **Milestone progress** — visual tracker toward credit eligibility

### Micro Credit Page
- **Credit score** — your on-chain job count IS your credit score
- **Borrow** — one-tap instant loan with 7-day repayment
- **Repay** — clear your loan and borrow again

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Monad Testnet (EVM, 10K TPS) |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Wallet** | RainbowKit + wagmi v2 + viem |
| **Deployment** | Vercel (frontend), Monad Testnet (contracts) |

---

## 📁 Project Structure

```
microwork/
├── contracts/                    # Smart contract layer
│   ├── contracts/
│   │   ├── MicroWorkEscrow.sol   # Core escrow protocol
│   │   ├── ReputationNFT.sol     # Soulbound reputation tokens
│   │   ├── MicroLoan.sol         # Reputation-backed lending
│   │   └── interfaces/
│   │       └── IReputationNFT.sol
│   ├── scripts/
│   │   ├── deploy.js             # Deployment script
│   │   └── fundPool.js           # Fund the lending pool
│   ├── hardhat.config.js
│   └── deployed-addresses.json
│
└── frontend/                     # React dApp
    ├── src/
    │   ├── pages/
    │   │   ├── PostJob.jsx       # Create jobs + lock escrow
    │   │   ├── WorkerDashboard.jsx # Reputation + job feed
    │   │   └── MicroLoan.jsx     # Credit + borrow/repay
    │   ├── components/
    │   │   └── Skeleton.jsx      # Loading states
    │   ├── constants/
    │   │   └── contracts.js      # Addresses + ABIs
    │   ├── App.jsx               # App shell + routing
    │   ├── main.jsx              # Providers
    │   └── wagmi.js              # Chain config
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet with Monad Testnet configured
- Some MON tokens (get from Monad faucet)

### Monad Testnet Configuration
| Setting | Value |
|---------|-------|
| Network Name | Monad Testnet |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Chain ID | `10143` |
| Currency | MON |
| Explorer | `https://testnet.monadexplorer.com` |

### Run Locally

```bash
# Clone
git clone https://github.com/ujjwaldubey1/monad-blitz-mumbai.git
cd monad-blitz-mumbai/microwork/frontend

# Install
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173`, connect MetaMask, and start posting jobs!

### Deploy Contracts (already deployed)

```bash
cd microwork/contracts
npm install
npx hardhat run scripts/deploy.js --network monadTestnet
```

### Fund the Lending Pool

```bash
npx hardhat run scripts/fundPool.js --network monadTestnet
```

---

## 💡 Use Cases

### For Workers
- **Plumber** finishes a pipe repair → gets paid instantly → NFT minted → after 5 jobs, borrows 0.01 MON for tools
- **Delivery rider** completes deliveries → builds verifiable work history without any paperwork
- **Domestic helper** earns credit score through work, not bank statements

### For Clients
- **Homeowner** posts "Fix kitchen sink — 0.05 MON" → payment locked → pays only when work is verified
- **Small business** hires temporary workers with guaranteed escrow — no trust issues
- **Community** funds the lending pool to support local workers

---

## 🔮 What's Next

- [ ] Dispute resolution with DAO arbitration
- [ ] Multi-token payment support (USDC, USDT)
- [ ] Worker profiles with skill tags and ratings
- [ ] Mobile-native app (React Native)
- [ ] Cross-chain reputation portability
- [ ] Integration with India Stack (UPI, Aadhaar)
- [ ] Mainnet deployment on Monad

---

## 🏆 Built For

**Monad Blitz Mumbai Hackathon** — Feb 2026

### Team
- **Ujjwal Dubey** — Full Stack + Smart Contracts

---

## 📄 License

MIT

---

<p align="center">
  <strong>MicroWork</strong> — Because your work history should belong to you, not a corporation.
</p>
