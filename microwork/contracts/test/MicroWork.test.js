const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MicroWorkEscrow", function () {
    let escrow;
    let owner, client, worker, arbiter;

    beforeEach(async function () {
        [owner, client, worker, arbiter] = await ethers.getSigners();
        const MicroWorkEscrow = await ethers.getContractFactory("MicroWorkEscrow");
        escrow = await MicroWorkEscrow.deploy();
        await escrow.waitForDeployment();
        await escrow.setArbiter(arbiter.address);
    });

    describe("Job Creation", function () {
        it("Should create a job with escrow payment", async function () {
            const payment = ethers.parseEther("0.1");
            await expect(
                escrow.connect(client).createJob("Fix a bug", { value: payment })
            ).to.emit(escrow, "JobCreated");

            const job = await escrow.getJob(0);
            expect(job.client).to.equal(client.address);
            expect(job.payment).to.equal(payment);
            expect(job.status).to.equal(0); // Open
        });
    });

    describe("Job Flow (Pull-over-push)", function () {
        beforeEach(async function () {
            await escrow.connect(client).createJob("Design a logo", { value: ethers.parseEther("0.05") });
        });

        it("Should allow worker to accept, then both confirm and pull funds", async function () {
            await escrow.connect(worker).acceptJob(0);
            await escrow.connect(client).confirmCompletion(0);
            await escrow.connect(worker).confirmCompletion(0);

            const balanceEscrow = await escrow.balances(worker.address);
            expect(balanceEscrow).to.equal(ethers.parseEther("0.05"));

            const workerBalBefore = await ethers.provider.getBalance(worker.address);
            const tx = await escrow.connect(worker).withdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const workerBalAfter = await ethers.provider.getBalance(worker.address);

            // Using BigInt directly avoids floating point issues
            expect(workerBalAfter + gasUsed - workerBalBefore).to.equal(ethers.parseEther("0.05"));
        });
    });

    describe("Dispute and Arbitration", function () {
        beforeEach(async function () {
            await escrow.connect(client).createJob("Write docs", { value: ethers.parseEther("0.1") });
            await escrow.connect(worker).acceptJob(0);
        });

        it("Should allow arbitration in favor of worker", async function () {
            await escrow.connect(client).disputeJob(0);
            await escrow.connect(arbiter).resolveDispute(0, true);

            const bal = await escrow.balances(worker.address);
            expect(bal).to.equal(ethers.parseEther("0.1"));
        });

        it("Should allow arbitration in favor of client", async function () {
            await escrow.connect(worker).disputeJob(0);
            await escrow.connect(arbiter).resolveDispute(0, false);

            const bal = await escrow.balances(client.address);
            expect(bal).to.equal(ethers.parseEther("0.1"));
        });
    });
});
