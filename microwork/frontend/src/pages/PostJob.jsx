import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ESCROW_ADDRESS, ESCROW_ABI } from '../constants/contracts';

function PostJob() {
    const { isConnected } = useAccount();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const {
        data: hash,
        writeContract,
        isPending: isWriting,
        error: writeError,
        reset: resetWrite,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({ hash });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim() || !amount || parseFloat(amount) <= 0) return;

        writeContract({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: 'createJob',
            args: [description.trim()],
            value: parseEther(amount),
        });
    };

    const handleReset = () => {
        setDescription('');
        setAmount('');
        resetWrite();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero text */}
            <div className="pt-4">
                <h1 className="font-antigravity text-4xl md:text-5xl text-tx-primary mb-3">
                    Pay instantly.
                    <br />
                    Build trust.
                </h1>
                <p className="text-tx-secondary text-base max-w-md">
                    Post a micro-job, lock payment in escrow, and let the blockchain handle the rest.
                </p>
            </div>

            {/* Success state */}
            {isConfirmed ? (
                <div className="card p-8 text-center animate-slide-up">
                    {/* Animated checkmark */}
                    <div className="flex justify-center mb-5">
                        <svg width="64" height="64" viewBox="0 0 52 52">
                            <circle
                                className="checkmark-circle"
                                cx="26" cy="26" r="24"
                                fill="none"
                                stroke="#16A34A"
                                strokeWidth="2.5"
                            />
                            <path
                                className="checkmark-check"
                                fill="none"
                                stroke="#16A34A"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 27l7 7 15-15"
                            />
                        </svg>
                    </div>
                    <h3 className="font-antigravity text-2xl text-tx-primary mb-2">
                        Payment locked
                    </h3>
                    <p className="text-tx-secondary text-sm mb-6">
                        Workers can now accept your job. Funds are held securely in escrow until both parties confirm completion.
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="badge badge-green">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                            Live on Monad
                        </span>
                    </div>
                    <button onClick={handleReset} className="btn-outline">
                        Post another job
                    </button>
                </div>
            ) : (
                /* Job form */
                <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-tx-secondary mb-2">
                            Job description
                        </label>
                        <textarea
                            className="input-field"
                            placeholder="Describe what needs to be done..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            disabled={isWriting || isConfirming}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-tx-secondary mb-2">
                            Payment amount
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                className="input-field pr-16"
                                placeholder="0.05"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isWriting || isConfirming}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-tx-tertiary">
                                MON
                            </div>
                        </div>
                    </div>

                    {!isConnected ? (
                        <div className="text-center py-3">
                            <p className="text-sm text-tx-tertiary">
                                Connect your wallet to post a job
                            </p>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="btn-primary w-full"
                            disabled={isWriting || isConfirming || !description.trim() || !amount}
                        >
                            {isWriting
                                ? 'Confirm in wallet...'
                                : isConfirming
                                    ? 'Locking payment...'
                                    : 'Lock Payment in Escrow'}
                        </button>
                    )}

                    {writeError && (
                        <div className="text-sm text-red-500 text-center animate-fade-in">
                            {writeError.shortMessage || writeError.message || 'Transaction failed. Please try again.'}
                        </div>
                    )}

                    <p className="text-xs text-tx-tertiary text-center pt-1">
                        Payment held securely until both parties confirm completion
                    </p>
                </form>
            )}
        </div>
    );
}

export default PostJob;
