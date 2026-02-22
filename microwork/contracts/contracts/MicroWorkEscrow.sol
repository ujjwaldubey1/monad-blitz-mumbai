// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IReputationNFT.sol";

/**
 * @title MicroWorkEscrow
 * @dev Core escrow contract for the MicroWork platform.
 *      Client locks payment → worker accepts → both confirm → payment releases + reputation NFT mints.
 *
 *      Job lifecycle:  Open → InProgress → Completed
 *                         ↘ Disputed (either party can flag)
 */
contract MicroWorkEscrow {
    // ---- Enums ----
    enum JobStatus { Open, InProgress, Completed, Disputed }

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
    IReputationNFT public reputationNFT;

    mapping(uint256 => Job) public jobs;

    // ---- Events ----
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 payment, string description);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event CompletionConfirmed(uint256 indexed jobId, address indexed confirmer, string role);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 payment);
    event JobDisputed(uint256 indexed jobId, address indexed disputer);
    event JobCancelled(uint256 indexed jobId);
    event ReputationNFTUpdated(address indexed nft);

    // ---- Modifiers ----
    modifier onlyOwner() {
        require(msg.sender == owner, "Escrow: not owner");
        _;
    }

    // ---- Constructor ----
    constructor() {
        owner = msg.sender;
    }

    // ---- Admin ----

    /// @notice Set the ReputationNFT contract address. Call this after deploying ReputationNFT.
    function setReputationNFT(address _nft) external onlyOwner {
        require(_nft != address(0), "Escrow: zero address");
        reputationNFT = IReputationNFT(_nft);
        emit ReputationNFTUpdated(_nft);
    }

    // ---- Core ----

    /// @notice Client creates a job and locks payment in escrow.
    function createJob(string calldata _description) external payable {
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

    /// @notice Worker accepts an open job.
    function acceptJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Escrow: job not open");
        require(job.client != msg.sender, "Escrow: client cannot accept own job");

        job.worker = msg.sender;
        job.status = JobStatus.InProgress;

        emit JobAccepted(_jobId, msg.sender);
    }

    /// @notice Either client or worker confirms task completion.
    ///         When BOTH confirm, payment is released and a reputation NFT is minted.
    function confirmCompletion(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Escrow: job not in progress");
        require(
            msg.sender == job.client || msg.sender == job.worker,
            "Escrow: not a party to this job"
        );

        // Record who confirmed
        if (msg.sender == job.client) {
            require(!job.clientConfirmed, "Escrow: client already confirmed");
            job.clientConfirmed = true;
            emit CompletionConfirmed(_jobId, msg.sender, "client");
        } else {
            require(!job.workerConfirmed, "Escrow: worker already confirmed");
            job.workerConfirmed = true;
            emit CompletionConfirmed(_jobId, msg.sender, "worker");
        }

        // If both confirmed → release payment + mint reputation
        if (job.clientConfirmed && job.workerConfirmed) {
            job.status = JobStatus.Completed;

            // Transfer payment to worker
            (bool sent, ) = job.worker.call{value: job.payment}("");
            require(sent, "Escrow: payment transfer failed");

            // Mint reputation NFT
            if (address(reputationNFT) != address(0)) {
                reputationNFT.mint(job.worker, _jobId);
            }

            emit JobCompleted(_jobId, job.worker, job.payment);
        }
    }

    /// @notice Either party can flag a dispute.
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

    /// @notice Client cancels an open job and gets a refund.
    function cancelJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Escrow: not the client");
        require(job.status == JobStatus.Open, "Escrow: can only cancel open jobs");

        job.status = JobStatus.Disputed; // reuse Disputed as terminal state
        (bool sent, ) = msg.sender.call{value: job.payment}("");
        require(sent, "Escrow: refund failed");

        emit JobCancelled(_jobId);
    }

    // ---- Views ----

    /// @notice Get job details.
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    /// @notice Total number of jobs created.
    function totalJobs() external view returns (uint256) {
        return _nextJobId;
    }
}
