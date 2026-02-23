// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IReputationNFT.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MicroWorkEscrow
 * @dev Core escrow contract for the MicroWork platform.
 *      Client locks payment → worker accepts → both confirm → payment releases + reputation NFT mints.
 *
 *      Added: ReentrancyGuard, Arbiter Role, Pull-over-Push Payments
 */
contract MicroWorkEscrow is ReentrancyGuard {
    // ---- Enums ----
    enum JobStatus { Open, InProgress, Completed, Disputed, Resolved }

    // ---- Structs ----
    struct Job {
        uint256 id;
        address client;
        address worker;
        uint256 payment;
        string description;
        JobStatus status;
        bool clientConfirmed;
        bool workerConfirmed;
    }

    // ---- State ----
    uint256 private _nextJobId;
    address public owner;
    address public arbiter; // The role that can resolve disputed jobs
    IReputationNFT public reputationNFT;

    mapping(uint256 => Job) public jobs;
    mapping(address => uint256) public balances; // Pull-over-push withdrawals

    // ---- Events ----
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 payment, string description);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event CompletionConfirmed(uint256 indexed jobId, address indexed confirmer, string role);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 payment);
    event JobDisputed(uint256 indexed jobId, address indexed disputer);
    event JobResolved(uint256 indexed jobId, address winner, uint256 payment);
    event JobCancelled(uint256 indexed jobId);
    event ReputationNFTUpdated(address indexed nft);
    event ArbiterUpdated(address indexed oldArbiter, address indexed newArbiter);
    event Withdrawn(address indexed user, uint256 amount);

    // ---- Modifiers ----
    modifier onlyOwner() {
        require(msg.sender == owner, "Escrow: not owner");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Escrow: not arbiter");
        _;
    }

    // ---- Constructor ----
    constructor() {
        owner = msg.sender;
        arbiter = msg.sender; // By default owner is arbiter
    }

    // ---- Admin ----

    function setReputationNFT(address _nft) external onlyOwner {
        require(_nft != address(0), "Escrow: zero address");
        reputationNFT = IReputationNFT(_nft);
        emit ReputationNFTUpdated(_nft);
    }

    function setArbiter(address _arbiter) external onlyOwner {
        require(_arbiter != address(0), "Escrow: zero address");
        emit ArbiterUpdated(arbiter, _arbiter);
        arbiter = _arbiter;
    }

    // ---- Core ----

    function createJob(string calldata _description) external payable nonReentrant {
        require(msg.value > 0, "Escrow: payment must be > 0");

        uint256 jobId = _nextJobId++;
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            worker: address(0),
            payment: msg.value,
            description: _description,
            status: JobStatus.Open,
            clientConfirmed: false,
            workerConfirmed: false
        });

        emit JobCreated(jobId, msg.sender, msg.value, _description);
    }

    function acceptJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Escrow: job not open");
        require(job.client != msg.sender, "Escrow: client cannot accept own job");

        job.worker = msg.sender;
        job.status = JobStatus.InProgress;

        emit JobAccepted(_jobId, msg.sender);
    }

    function confirmCompletion(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Escrow: job not in progress");
        require(
            msg.sender == job.client || msg.sender == job.worker,
            "Escrow: not a party to this job"
        );

        if (msg.sender == job.client) {
            require(!job.clientConfirmed, "Escrow: client already confirmed");
            job.clientConfirmed = true;
            emit CompletionConfirmed(_jobId, msg.sender, "client");
        } else {
            require(!job.workerConfirmed, "Escrow: worker already confirmed");
            job.workerConfirmed = true;
            emit CompletionConfirmed(_jobId, msg.sender, "worker");
        }

        if (job.clientConfirmed && job.workerConfirmed) {
            job.status = JobStatus.Completed;

            // Pull-over-push: add to worker's balance
            balances[job.worker] += job.payment;

            if (address(reputationNFT) != address(0)) {
                reputationNFT.mint(job.worker, _jobId);
            }

            emit JobCompleted(_jobId, job.worker, job.payment);
        }
    }

    function disputeJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Escrow: job not in progress");
        require(
            msg.sender == job.client || msg.sender == job.worker,
            "Escrow: not a party to this job"
        );

        job.status = JobStatus.Disputed;
        emit JobDisputed(_jobId, msg.sender);
    }

    /// @notice Arbiter resolves the dispute
    function resolveDispute(uint256 _jobId, bool _favorWorker) external onlyArbiter {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Disputed, "Escrow: job not disputed");
        
        job.status = JobStatus.Resolved;
        
        address winner = _favorWorker ? job.worker : job.client;
        balances[winner] += job.payment;

        // Optionally mint reputation if worker won
        if (_favorWorker && address(reputationNFT) != address(0)) {
            reputationNFT.mint(job.worker, _jobId);
        }

        emit JobResolved(_jobId, winner, job.payment);
    }

    function cancelJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Escrow: not the client");
        require(job.status == JobStatus.Open, "Escrow: can only cancel open jobs");

        job.status = JobStatus.Disputed; // Reuse Disputed as terminal state for cancelled
        
        // Pull-over-push instead of direct call
        balances[msg.sender] += job.payment;

        emit JobCancelled(_jobId);
    }

    /// @notice Workers and clients withdraw available funds securely
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Escrow: no balance to withdraw");

        balances[msg.sender] = 0;
        
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Escrow: withdrawal failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    // ---- Views ----

    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    function totalJobs() external view returns (uint256) {
        return _nextJobId;
    }
}
