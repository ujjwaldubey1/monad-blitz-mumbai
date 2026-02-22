// scripts/fundPool.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    const MICROLOAN_ADDRESS = "0x5ba59BcCCba4eB7cc05a2c525b19a6c74D58b806";

    // Send 0.5 MON to the loan pool
    const tx = await deployer.sendTransaction({
        to: MICROLOAN_ADDRESS,
        value: hre.ethers.parseEther("0.5")
    });

    await tx.wait();
    console.log("Pool funded! Tx:", tx.hash);
}

main().catch(console.error);