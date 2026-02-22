const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    console.log("---");

    // ============================================
    // 1. Deploy ReputationNFT
    // ============================================
    console.log("1/4  Deploying ReputationNFT...");
    const ReputationNFT = await hre.ethers.getContractFactory("ReputationNFT");
    const repNFT = await ReputationNFT.deploy();
    await repNFT.waitForDeployment();
    const repNFTAddress = await repNFT.getAddress();
    console.log(`     ✅ ReputationNFT deployed to: ${repNFTAddress}`);

    // ============================================
    // 2. Deploy MicroWorkEscrow
    // ============================================
    console.log("2/4  Deploying MicroWorkEscrow...");
    const MicroWorkEscrow = await hre.ethers.getContractFactory("MicroWorkEscrow");
    const escrow = await MicroWorkEscrow.deploy();
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log(`     ✅ MicroWorkEscrow deployed to: ${escrowAddress}`);

    // ============================================
    // 3. Wire them together
    // ============================================
    console.log("3/4  Wiring contracts together...");

    // Tell ReputationNFT who the escrow is (so only escrow can mint)
    const tx1 = await repNFT.setEscrow(escrowAddress);
    await tx1.wait();
    console.log("     ✅ ReputationNFT.setEscrow → escrow linked");

    // Tell Escrow where the ReputationNFT is (so it can call mint on completion)
    const tx2 = await escrow.setReputationNFT(repNFTAddress);
    await tx2.wait();
    console.log("     ✅ MicroWorkEscrow.setReputationNFT → NFT linked");

    // ============================================
    // 4. Deploy MicroLoan (needs ReputationNFT address)
    // ============================================
    console.log("4/4  Deploying MicroLoan...");
    const MicroLoan = await hre.ethers.getContractFactory("MicroLoan");
    const microLoan = await MicroLoan.deploy(repNFTAddress);
    await microLoan.waitForDeployment();
    const microLoanAddress = await microLoan.getAddress();
    console.log(`     ✅ MicroLoan deployed to: ${microLoanAddress}`);

    // ============================================
    // Save addresses to JSON
    // ============================================
    const addresses = {
        network: "monadTestnet",
        chainId: 10143,
        deployer: deployer.address,
        contracts: {
            ReputationNFT: repNFTAddress,
            MicroWorkEscrow: escrowAddress,
            MicroLoan: microLoanAddress,
        },
        deployedAt: new Date().toISOString(),
    };

    const outPath = path.join(__dirname, "..", "deployed-addresses.json");
    fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
    console.log("\n📄 Addresses saved to deployed-addresses.json");

    // ============================================
    // Summary
    // ============================================
    console.log("\n========================================");
    console.log("  🎉 ALL CONTRACTS DEPLOYED & WIRED");
    console.log("========================================");
    console.log(`  ReputationNFT  : ${repNFTAddress}`);
    console.log(`  MicroWorkEscrow: ${escrowAddress}`);
    console.log(`  MicroLoan      : ${microLoanAddress}`);
    console.log("========================================\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
