// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationNFT
 * @dev Soulbound ERC721 — minted on job completion, cannot be transferred.
 *      Only the linked escrow contract can mint tokens.
 *      Tracks per-worker job count for the MicroLoan eligibility check.
 */
contract ReputationNFT is ERC721, Ownable {
    // ---- State ----
    uint256 private _nextTokenId;
    address public escrowContract;

    struct JobRecord {
        uint256 jobId;
        uint256 timestamp;
        address worker;
    }

    /// tokenId => JobRecord
    mapping(uint256 => JobRecord) public jobRecords;

    /// worker address => number of completed jobs
    mapping(address => uint256) public workerJobCount;

    // ---- Events ----
    event ReputationMinted(address indexed worker, uint256 indexed tokenId, uint256 jobId);
    event EscrowUpdated(address indexed oldEscrow, address indexed newEscrow);

    // ---- Constructor ----
    constructor() ERC721("MicroWork Reputation", "MWR") Ownable(msg.sender) {}

    // ---- Modifiers ----
    modifier onlyEscrow() {
        require(msg.sender == escrowContract, "ReputationNFT: caller is not the escrow");
        _;
    }

    // ---- Admin ----

    /// @notice Set the escrow contract address. Only callable by owner.
    function setEscrow(address _escrow) external onlyOwner {
        require(_escrow != address(0), "ReputationNFT: zero address");
        emit EscrowUpdated(escrowContract, _escrow);
        escrowContract = _escrow;
    }

    // ---- Core ----

    /// @notice Mint a soulbound reputation NFT to a worker. Only callable by escrow.
    function mint(address worker, uint256 jobId) external onlyEscrow {
        uint256 tokenId = _nextTokenId++;
        _safeMint(worker, tokenId);

        jobRecords[tokenId] = JobRecord({
            jobId: jobId,
            timestamp: block.timestamp,
            worker: worker
        });

        workerJobCount[worker]++;
        emit ReputationMinted(worker, tokenId, jobId);
    }

    // ---- Soulbound overrides (block all transfers) ----

    /// @dev Always reverts — tokens are soulbound.
    function transferFrom(address, address, uint256) public pure override {
        revert("ReputationNFT: soulbound, transfers disabled");
    }

    /// @dev Always reverts — tokens are soulbound.
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("ReputationNFT: soulbound, transfers disabled");
    }

    // ---- Views ----

    /// @notice Get the job record for a given token.
    function getJobRecord(uint256 tokenId) external view returns (JobRecord memory) {
        return jobRecords[tokenId];
    }
}
