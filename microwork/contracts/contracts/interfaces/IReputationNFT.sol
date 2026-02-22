// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationNFT {
    function mint(address worker, uint256 jobId) external;
    function workerJobCount(address worker) external view returns (uint256);
}
