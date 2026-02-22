const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MicroWork", function () {
    let microWork;
    let owner, employer, worker;

    beforeEach(async function () {
        [owner, employer, worker] = await ethers.getSigners();
        const MicroWork = await ethers.getContractFactory("MicroWork");
        microWork = await MicroWork.deploy();
    });

    describe("Task Creation", function () {
        it("Should create a task with escrow payment", async function () {
            const payment = ethers.parseEther("0.1");
            await expect(
                microWork.connect(employer).createTask("Fix a bug", { value: payment })
            ).to.emit(microWork, "TaskCreated");

            const task = await microWork.getTask(0);
            expect(task.employer).to.equal(employer.address);
            expect(task.payment).to.equal(payment);
            expect(task.status).to.equal(0); // Open
        });

        it("Should reject task creation with 0 payment", async function () {
            await expect(
                microWork.connect(employer).createTask("Free work", { value: 0 })
            ).to.be.revertedWith("Payment must be greater than 0");
        });
    });

    describe("Task Claiming", function () {
        beforeEach(async function () {
            await microWork
                .connect(employer)
                .createTask("Design a logo", { value: ethers.parseEther("0.05") });
        });

        it("Should let a worker claim an open task", async function () {
            await expect(microWork.connect(worker).claimTask(0)).to.emit(
                microWork,
                "TaskAssigned"
            );
        });

        it("Should prevent employer from claiming own task", async function () {
            await expect(
                microWork.connect(employer).claimTask(0)
            ).to.be.revertedWith("Employer cannot claim own task");
        });
    });

    describe("Task Completion", function () {
        beforeEach(async function () {
            await microWork
                .connect(employer)
                .createTask("Write docs", { value: ethers.parseEther("0.1") });
            await microWork.connect(worker).claimTask(0);
        });

        it("Should pay the worker on completion", async function () {
            const balanceBefore = await ethers.provider.getBalance(worker.address);
            await microWork.connect(employer).completeTask(0);
            const balanceAfter = await ethers.provider.getBalance(worker.address);

            expect(balanceAfter).to.be.greaterThan(balanceBefore);
        });

        it("Should increment worker reputation", async function () {
            await microWork.connect(employer).completeTask(0);
            expect(await microWork.workerReputation(worker.address)).to.equal(1);
        });
    });

    describe("Task Cancellation", function () {
        it("Should refund employer on cancellation", async function () {
            const payment = ethers.parseEther("0.1");
            await microWork.connect(employer).createTask("Cancelled gig", { value: payment });

            const balanceBefore = await ethers.provider.getBalance(employer.address);
            await microWork.connect(employer).cancelTask(0);
            const balanceAfter = await ethers.provider.getBalance(employer.address);

            expect(balanceAfter).to.be.greaterThan(balanceBefore);
        });
    });
});
