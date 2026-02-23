// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IReputationNFT.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MicroLoan
 * @dev Reputation-backed micro-lending for gig workers.
 *      Workers with 5+ completed jobs can borrow against their reputation.
 *      Dynamic Loan Tiers:
 *      5-19 jobs: 0.01 ether (10% fee)
 *      20-49 jobs: 0.05 ether (8% fee)
 *      50+ jobs: 0.10 ether (5% fee)
 *      One active loan per worker at a time.
 *      Anyone can fund the lending pool via receive().
 */
contract MicroLoan is ReentrancyGuard {
    // ---- Constants ----
    uint256 public constant LOAN_DURATION = 7 days;
    uint256 public constant MIN_JOBS_REQUIRED = 5;

    // ---- Structs ----
    struct Loan {
        uint256 amount;
        uint256 repaymentAmount;
        uint256 dueDate;
        bool active;
        bool repaid;
    }

    // ---- State ----
    address public owner;
    IReputationNFT public reputationNFT;

    mapping(address => Loan) public loans;

    // ---- Events ----
    event LoanTaken(address indexed borrower, uint256 amount, uint256 dueDate);
    event LoanRepaid(address indexed borrower, uint256 amount);
    event PoolFunded(address indexed funder, uint256 amount);

    // ---- Constructor ----
    constructor(address _reputationNFT) {
        require(_reputationNFT != address(0), "MicroLoan: zero address");
        owner = msg.sender;
        reputationNFT = IReputationNFT(_reputationNFT);
    }

    // ---- Internals ----
    function getLoanTerms(uint256 jobCount) public pure returns (uint256 loanAmount, uint256 repaymentAmount) {
        // Tier 1: 5-19 jobs -> 0.01 MON loan, 10% fee
        // Tier 2: 20-49 jobs -> 0.05 MON loan, 8% fee
        // Tier 3: 50+ jobs -> 0.10 MON loan, 5% fee
        
        if (jobCount >= 50) {
            return (0.10 ether, 0.105 ether); // 5% fee
        } else if (jobCount >= 20) {
            return (0.05 ether, 0.054 ether); // 8% fee
        } else {
            return (0.01 ether, 0.011 ether); // 10% fee
        }
    }

    // ---- Core ----

    /// @notice Borrow a micro-loan based on reputation tier.
    function borrow() external nonReentrant {
        uint256 jobCount = reputationNFT.workerJobCount(msg.sender);
        require(jobCount >= MIN_JOBS_REQUIRED, "MicroLoan: need 5+ completed jobs");
        require(!loans[msg.sender].active, "MicroLoan: existing loan still active");
        
        (uint256 loanAmount, uint256 repaymentAmount) = getLoanTerms(jobCount);
        require(address(this).balance >= loanAmount, "MicroLoan: pool insufficient");

        uint256 dueDate = block.timestamp + LOAN_DURATION;
        loans[msg.sender] = Loan({
            amount: loanAmount,
            repaymentAmount: repaymentAmount,
            dueDate: dueDate,
            active: true,
            repaid: false
        });

        (bool sent, ) = msg.sender.call{value: loanAmount}("");
        require(sent, "MicroLoan: transfer failed");

        emit LoanTaken(msg.sender, loanAmount, dueDate);
    }

    /// @notice Repay an active loan. Must send exactly the repayment amount.
    function repay() external payable nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "MicroLoan: no active loan");
        require(msg.value >= loan.repaymentAmount, "MicroLoan: insufficient repayment");

        loan.active = false;
        loan.repaid = true;

        // Refund any overpayment
        uint256 excess = msg.value - loan.repaymentAmount;
        if (excess > 0) {
            (bool refunded, ) = msg.sender.call{value: excess}("");
            require(refunded, "MicroLoan: refund failed");
        }

        emit LoanRepaid(msg.sender, loan.repaymentAmount);
    }

    // ---- Views ----

    /// @notice Check if a worker is eligible to borrow.
    function isEligible(address _worker) external view returns (bool) {
        uint256 jobCount = reputationNFT.workerJobCount(_worker);
        return jobCount >= MIN_JOBS_REQUIRED && !loans[_worker].active;
    }

    /// @notice Get loan details for a worker.
    function getLoan(address _worker) external view returns (Loan memory) {
        return loans[_worker];
    }

    /// @notice Current lending pool balance.
    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Anyone can fund the lending pool.
    receive() external payable {
        emit PoolFunded(msg.sender, msg.value);
    }
}
