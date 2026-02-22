// ============================================
// Contract Addresses (Monad Testnet)
// ============================================
export const ESCROW_ADDRESS = "0xbcce751bE9026B62Fd7B58686a7aa89c66c155f1";
export const REPUTATION_NFT_ADDRESS = "0x04951f27C2522d94C5FbFa51415A50603b1c7d70";
export const MICROLOAN_ADDRESS = "0x5ba59BcCCba4eB7cc05a2c525b19a6c74D58b806";

// ============================================
// ABIs (JSON format — reliable, no parsing)
// ============================================

export const ESCROW_ABI = [
    {
        type: "function",
        name: "createJob",
        inputs: [{ name: "_description", type: "string" }],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "acceptJob",
        inputs: [{ name: "_jobId", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "confirmCompletion",
        inputs: [{ name: "_jobId", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "disputeJob",
        inputs: [{ name: "_jobId", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "cancelJob",
        inputs: [{ name: "_jobId", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "getJob",
        inputs: [{ name: "_jobId", type: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "id", type: "uint256" },
                    { name: "client", type: "address" },
                    { name: "worker", type: "address" },
                    { name: "payment", type: "uint256" },
                    { name: "description", type: "string" },
                    { name: "status", type: "uint8" },
                    { name: "clientConfirmed", type: "bool" },
                    { name: "workerConfirmed", type: "bool" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "totalJobs",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
    },
];

export const REPUTATION_NFT_ABI = [
    {
        type: "function",
        name: "workerJobCount",
        inputs: [{ name: "", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getJobRecord",
        inputs: [{ name: "tokenId", type: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "jobId", type: "uint256" },
                    { name: "timestamp", type: "uint256" },
                    { name: "worker", type: "address" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "escrowContract",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "owner", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
];

export const MICROLOAN_ABI = [
    {
        type: "function",
        name: "LOAN_AMOUNT",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "REPAYMENT_AMOUNT",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "LOAN_DURATION",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "MIN_JOBS_REQUIRED",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "isEligible",
        inputs: [{ name: "_worker", type: "address" }],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLoan",
        inputs: [{ name: "_worker", type: "address" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "amount", type: "uint256" },
                    { name: "repaymentAmount", type: "uint256" },
                    { name: "dueDate", type: "uint256" },
                    { name: "active", type: "bool" },
                    { name: "repaid", type: "bool" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "poolBalance",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "borrow",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "repay",
        inputs: [],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "receive",
        stateMutability: "payable",
    },
];

// ============================================
// Job Status Enum Mapping
// ============================================
export const JOB_STATUS = {
    0: "Open",
    1: "InProgress",
    2: "Completed",
    3: "Disputed",
};

export const JOB_STATUS_COLORS = {
    0: "badge-green",
    1: "badge-amber",
    2: "badge-neutral",
    3: "badge-neutral",
};
