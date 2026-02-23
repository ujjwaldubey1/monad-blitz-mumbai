import { useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import {
    MICROLOAN_ADDRESS, MICROLOAN_ABI,
    REPUTATION_NFT_ADDRESS, REPUTATION_NFT_ABI,
} from '../constants/contracts';
import { SkeletonScore, SkeletonCard } from '../components/Skeleton';

function MicroLoan() {
    const { address, isConnected } = useAccount();

    // Read worker's job count
    const { data: jobCount, isLoading: isLoadingJobs } = useReadContract({
        address: REPUTATION_NFT_ADDRESS,
        abi: REPUTATION_NFT_ABI,
        functionName: 'workerJobCount',
        args: [address],
        query: { enabled: !!address },
    });

    // Read eligibility
    const { data: eligible, isLoading: isLoadingEligible } = useReadContract({
        address: MICROLOAN_ADDRESS,
        abi: MICROLOAN_ABI,
        functionName: 'isEligible',
        args: [address],
        query: { enabled: !!address },
    });

    // Read active loan
    const { data: loan, isLoading: isLoadingLoan } = useReadContract({
        address: MICROLOAN_ADDRESS,
        abi: MICROLOAN_ABI,
        functionName: 'getLoan',
        args: [address],
        query: { enabled: !!address },
    });

    // Read pool balance
    const { data: poolBal } = useReadContract({
        address: MICROLOAN_ADDRESS,
        abi: MICROLOAN_ABI,
        functionName: 'poolBalance',
    });

    // Borrow
    const {
        data: borrowHash,
        writeContract: writeBorrow,
        isPending: isBorrowing,
        error: borrowError,
    } = useWriteContract();
    const { isLoading: isBorrowConfirming, isSuccess: borrowSuccess } =
        useWaitForTransactionReceipt({ hash: borrowHash });

    useEffect(() => {
        if (isBorrowConfirming) toast.loading('Processing loan...', { id: 'borrow' });
        else if (borrowSuccess) toast.success('Loan received!', { id: 'borrow' });
        else if (borrowError) toast.error(borrowError.shortMessage || 'Failed to borrow', { id: 'borrow' });
    }, [isBorrowConfirming, borrowSuccess, borrowError]);

    // Repay
    const {
        data: repayHash,
        writeContract: writeRepay,
        isPending: isRepaying,
        error: repayError,
    } = useWriteContract();
    const { isLoading: isRepayConfirming, isSuccess: repaySuccess } =
        useWaitForTransactionReceipt({ hash: repayHash });

    useEffect(() => {
        if (isRepayConfirming) toast.loading('Processing repayment...', { id: 'repay' });
        else if (repaySuccess) toast.success('Loan repaid!', { id: 'repay' });
        else if (repayError) toast.error(repayError.shortMessage || 'Failed to repay', { id: 'repay' });
    }, [isRepayConfirming, repaySuccess, repayError]);

    const count = jobCount ? Number(jobCount) : 0;
    const required = 5;
    const remaining = Math.max(required - count, 0);
    const progress = Math.min((count / required) * 100, 100);
    const hasActiveLoan = loan?.active === true;
    const dueDate = loan?.dueDate ? new Date(Number(loan.dueDate) * 1000) : null;
    const pool = poolBal ? formatEther(poolBal) : '0';

    if (!isConnected) {
        return (
            <div className="animate-fade-in pt-8 text-center">
                <h1 className="font-antigravity text-3xl text-tx-primary mb-3">Credit</h1>
                <p className="text-tx-secondary">Connect your wallet to access micro-credit.</p>
            </div>
        );
    }

    const isLoading = isLoadingJobs || isLoadingEligible || isLoadingLoan;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="pt-2">
                <h1 className="font-antigravity text-3xl md:text-4xl text-tx-primary">
                    Micro Credit
                </h1>
                <p className="text-tx-secondary text-sm mt-1">
                    Reputation-backed lending, no banks required
                </p>
            </div>

            {/* Credit Score Card */}
            {isLoading ? (
                <SkeletonScore />
            ) : (
                <div className="card p-8 text-center animate-fade-in-scale">
                    <p className="text-xs uppercase tracking-widest text-tx-tertiary mb-2 font-medium">
                        Your Credit Score
                    </p>
                    <div className="font-antigravity text-6xl text-tx-primary mb-1">
                        {count}
                    </div>
                    <p className="text-sm text-tx-secondary mb-5">
                        verified jobs on-chain
                    </p>

                    {/* Progress to eligibility */}
                    <div className="max-w-xs mx-auto">
                        <div className="flex justify-between text-xs text-tx-tertiary mb-1.5">
                            <span>{count} / {required} jobs</span>
                            <span>{progress >= 100 ? 'Eligible' : `${remaining} more needed`}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${progress}%`,
                                    background: progress >= 100 ? 'var(--accent-green)' : 'var(--accent)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Eligibility / Borrow / Active Loan */}
            {isLoading ? (
                <SkeletonCard />
            ) : hasActiveLoan && !repaySuccess ? (
                /* Active Loan Card */
                <div className="card p-6 animate-fade-in border-l-4 border-l-accent-amber">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="badge badge-amber">Active Loan</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <p className="text-xs text-tx-tertiary mb-0.5">Borrowed</p>
                            <p className="font-antigravity text-xl text-tx-primary">
                                {loan?.amount ? formatEther(loan.amount) : '0.01'} <span className="text-sm font-sans text-tx-tertiary">MON</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-tx-tertiary mb-0.5">Repayment</p>
                            <p className="font-antigravity text-xl text-tx-primary">
                                {loan?.repaymentAmount ? formatEther(loan.repaymentAmount) : '0.011'} <span className="text-sm font-sans text-tx-tertiary">MON</span>
                            </p>
                        </div>
                    </div>

                    {dueDate && (
                        <div className="mb-5">
                            <p className="text-xs text-tx-tertiary mb-0.5">Due date</p>
                            <p className="text-sm font-medium text-tx-primary">
                                {dueDate.toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <Countdown dueDate={dueDate} />
                        </div>
                    )}

                    <button
                        className="btn-primary w-full"
                        disabled={isRepaying || isRepayConfirming}
                        onClick={() =>
                            writeRepay({
                                address: MICROLOAN_ADDRESS,
                                abi: MICROLOAN_ABI,
                                functionName: 'repay',
                                value: parseEther('0.011'),
                            })
                        }
                    >
                        {isRepaying
                            ? 'Confirm in wallet...'
                            : isRepayConfirming
                                ? 'Processing repayment...'
                                : 'Repay 0.011 MON'}
                    </button>

                    {repayError && (
                        <p className="text-sm text-red-500 text-center mt-3 animate-fade-in">
                            {repayError.shortMessage || 'Repayment failed.'}
                        </p>
                    )}
                </div>
            ) : repaySuccess ? (
                /* Repayment success */
                <div className="card p-8 text-center animate-slide-up">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="font-antigravity text-2xl text-tx-primary mb-2">Loan Repaid</h3>
                    <p className="text-sm text-tx-secondary">Your credit record is clean. Borrow again anytime.</p>
                </div>
            ) : count < required ? (
                /* Locked state */
                <div className="card p-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">
                            🔒
                        </div>
                        <div>
                            <h3 className="font-semibold text-tx-primary text-sm">Credit Locked</h3>
                            <p className="text-xs text-tx-tertiary">
                                Complete {remaining} more job{remaining !== 1 ? 's' : ''} to unlock
                            </p>
                        </div>
                    </div>
                    <div className="bg-bg-subtle rounded-xl p-4 space-y-2.5">
                        <InfoRow label="Loan amount" value="0.01 MON" />
                        <InfoRow label="Fee (10%)" value="0.001 MON" />
                        <div className="border-t border-border pt-2.5">
                            <InfoRow label="Total repayment" value="0.011 MON" bold />
                        </div>
                        <InfoRow label="Repayment window" value="7 days" />
                    </div>
                </div>
            ) : (
                /* Eligible — borrow */
                <div className="card p-6 animate-fade-in border-l-4 border-l-accent-green">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="badge badge-green">✓ Eligible</span>
                    </div>

                    <div className="bg-bg-subtle rounded-xl p-4 space-y-2.5 mb-5">
                        <InfoRow label="Available" value="0.01 MON" bold />
                        <InfoRow label="Fee (10%)" value="0.001 MON" />
                        <div className="border-t border-border pt-2.5">
                            <InfoRow label="Total repayment" value="0.011 MON" bold />
                        </div>
                        <InfoRow label="Due in" value="7 days from borrow" />
                        <InfoRow label="Pool balance" value={`${parseFloat(pool).toFixed(4)} MON`} />
                    </div>

                    <button
                        className={`btn-primary w-full ${borrowSuccess ? '!bg-accent-green' : ''}`}
                        disabled={isBorrowing || isBorrowConfirming || borrowSuccess}
                        onClick={() =>
                            writeBorrow({
                                address: MICROLOAN_ADDRESS,
                                abi: MICROLOAN_ABI,
                                functionName: 'borrow',
                            })
                        }
                    >
                        {isBorrowing
                            ? 'Confirm in wallet...'
                            : isBorrowConfirming
                                ? 'Processing loan...'
                                : borrowSuccess
                                    ? '✓ Loan Received'
                                    : 'Borrow Instantly'}
                    </button>

                    {borrowError && (
                        <p className="text-sm text-red-500 text-center mt-3 animate-fade-in">
                            {borrowError.shortMessage || 'Borrow failed.'}
                        </p>
                    )}
                </div>
            )}

            {/* Philosophy */}
            <p className="text-xs text-tx-tertiary text-center pt-4 pb-8 italic">
                No bank. No CIBIL score. Just proof of work.
            </p>
        </div>
    );
}

/* ===== Helper Components ===== */

function InfoRow({ label, value, bold = false }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-tx-secondary">{label}</span>
            <span className={`text-sm ${bold ? 'font-semibold text-tx-primary' : 'text-tx-primary'}`}>
                {value}
            </span>
        </div>
    );
}

function Countdown({ dueDate }) {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();

    if (diff <= 0) {
        return <p className="text-xs text-red-500 font-medium mt-1">⚠ Overdue</p>;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
        <p className="text-xs text-tx-tertiary mt-1">
            {days}d {hours}h remaining
        </p>
    );
}

export default MicroLoan;
