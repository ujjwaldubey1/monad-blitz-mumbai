import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import {
    ESCROW_ADDRESS, ESCROW_ABI,
    REPUTATION_NFT_ADDRESS, REPUTATION_NFT_ABI,
    JOB_STATUS,
} from '../constants/contracts';
import { SkeletonCard, SkeletonScore } from '../components/Skeleton';

function WorkerDashboard() {
    const { address, isConnected } = useAccount();

    // Read worker reputation
    const { data: jobCount, isLoading: isLoadingRep } = useReadContract({
        address: REPUTATION_NFT_ADDRESS,
        abi: REPUTATION_NFT_ABI,
        functionName: 'workerJobCount',
        args: [address],
        query: { enabled: !!address },
    });

    // Read total jobs
    const { data: totalJobs, isLoading: isLoadingTotal } = useReadContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'totalJobs',
    });

    const repCount = jobCount ? Number(jobCount) : 0;
    const total = totalJobs ? Number(totalJobs) : 0;
    const nextMilestone = repCount < 5 ? 5 : repCount < 10 ? 10 : repCount < 25 ? 25 : 50;
    const progress = Math.min((repCount / nextMilestone) * 100, 100);

    if (!isConnected) {
        return (
            <div className="animate-fade-in pt-8 text-center">
                <h1 className="font-antigravity text-3xl text-tx-primary mb-3">Dashboard</h1>
                <p className="text-tx-secondary">Connect your wallet to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="pt-2">
                <h1 className="font-antigravity text-3xl md:text-4xl text-tx-primary">
                    Your Dashboard
                </h1>
            </div>

            {/* Reputation Score Card */}
            {isLoadingRep ? (
                <SkeletonScore />
            ) : (
                <div className="card p-8 text-center animate-fade-in-scale">
                    <div className="font-antigravity text-5xl text-tx-primary mb-1">
                        {repCount}
                    </div>
                    <p className="text-sm text-tx-secondary mb-1">verified jobs completed</p>

                    {repCount >= 5 && (
                        <div className="inline-flex items-center gap-1.5 mt-2 mb-4">
                            <span className="badge badge-green">
                                💳 Credit Unlocked
                            </span>
                        </div>
                    )}

                    {/* Progress bar to next milestone */}
                    <div className="mt-4 max-w-xs mx-auto">
                        <div className="flex justify-between text-xs text-tx-tertiary mb-1.5">
                            <span>{repCount} completed</span>
                            <span>{nextMilestone} milestone</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill bg-accent"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Job Feed */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-tx-primary">Open Jobs</h2>
                    <span className="text-sm text-tx-tertiary">{total} total</span>
                </div>

                {isLoadingTotal ? (
                    <div className="space-y-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : total === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {Array.from({ length: Math.min(total, 20) }, (_, i) => (
                            <JobCard key={i} jobId={total - 1 - i} userAddress={address} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ===== Individual Job Card ===== */

function JobCard({ jobId, userAddress }) {
    const { data: job, isLoading } = useReadContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'getJob',
        args: [BigInt(jobId)],
    });

    const {
        data: acceptHash,
        writeContract: writeAccept,
        isPending: isAccepting,
    } = useWriteContract();

    const {
        data: confirmHash,
        writeContract: writeConfirm,
        isPending: isConfirming,
    } = useWriteContract();

    const { isLoading: isAcceptTxLoading } = useWaitForTransactionReceipt({ hash: acceptHash });
    const { isLoading: isConfirmTxLoading } = useWaitForTransactionReceipt({ hash: confirmHash });

    if (isLoading) return <SkeletonCard />;
    if (!job) return null;

    const status = Number(job.status);
    const statusLabel = JOB_STATUS[status] || 'Unknown';
    const payment = formatEther(job.payment);
    const isClient = job.client?.toLowerCase() === userAddress?.toLowerCase();
    const isWorker = job.worker?.toLowerCase() === userAddress?.toLowerCase();
    const isOpen = status === 0;
    const isInProgress = status === 1;
    const isCompleted = status === 2;

    // Can this user confirm?
    const canConfirm = isInProgress && (
        (isClient && !job.clientConfirmed) ||
        (isWorker && !job.workerConfirmed)
    );

    return (
        <div className={`card p-5 animate-fade-in ${isCompleted ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm text-tx-primary font-medium leading-relaxed flex-1">
                    {job.description || 'No description'}
                </p>
                <StatusBadge status={status} label={statusLabel} />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <span className="font-antigravity text-2xl text-tx-primary">{payment}</span>
                    <span className="text-sm text-tx-tertiary ml-1.5">MON</span>
                </div>

                <div className="flex gap-2">
                    {isOpen && !isClient && (
                        <button
                            className="btn-primary text-sm !py-2 !px-5"
                            disabled={isAccepting || isAcceptTxLoading}
                            onClick={() =>
                                writeAccept({
                                    address: ESCROW_ADDRESS,
                                    abi: ESCROW_ABI,
                                    functionName: 'acceptJob',
                                    args: [BigInt(jobId)],
                                })
                            }
                        >
                            {isAccepting || isAcceptTxLoading ? 'Accepting...' : 'Accept Job'}
                        </button>
                    )}

                    {canConfirm && (
                        <button
                            className="btn-green text-sm !py-2 !px-5"
                            disabled={isConfirming || isConfirmTxLoading}
                            onClick={() =>
                                writeConfirm({
                                    address: ESCROW_ADDRESS,
                                    abi: ESCROW_ABI,
                                    functionName: 'confirmCompletion',
                                    args: [BigInt(jobId)],
                                })
                            }
                        >
                            {isConfirming || isConfirmTxLoading ? 'Confirming...' : 'Confirm Complete'}
                        </button>
                    )}

                    {isInProgress && (
                        <ConfirmationPills job={job} />
                    )}
                </div>
            </div>
        </div>
    );
}

/* ===== Confirmation pill indicators ===== */

function ConfirmationPills({ job }) {
    return (
        <div className="flex gap-1.5 items-center">
            <Pill filled={job.clientConfirmed} label="Client" />
            <Pill filled={job.workerConfirmed} label="Worker" />
        </div>
    );
}

function Pill({ filled, label }) {
    return (
        <div
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${filled
                    ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                    : 'bg-bg-subtle border-border text-tx-tertiary'
                }`}
            title={`${label} ${filled ? 'confirmed' : 'pending'}`}
        >
            {label} {filled ? '✓' : '○'}
        </div>
    );
}

/* ===== Status Badge ===== */

function StatusBadge({ status, label }) {
    const styles = {
        0: 'badge-green',
        1: 'badge-amber',
        2: 'badge-neutral',
        3: 'badge-neutral',
    };
    return <span className={`badge ${styles[status] || 'badge-neutral'}`}>{label}</span>;
}

/* ===== Empty State ===== */

function EmptyState() {
    return (
        <div className="card p-12 text-center">
            <div className="text-4xl mb-4 opacity-40">📋</div>
            <h3 className="font-antigravity text-xl text-tx-primary mb-2">
                No open jobs right now
            </h3>
            <p className="text-sm text-tx-tertiary max-w-sm mx-auto">
                Check back soon or ask a client to post a job. New gigs appear here instantly.
            </p>
        </div>
    );
}

export default WorkerDashboard;
