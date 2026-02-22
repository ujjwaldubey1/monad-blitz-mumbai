/* Loading Skeleton Components */

export function SkeletonLine({ width = '100%', height = '16px', className = '' }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height }}
        />
    );
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`card p-6 space-y-4 ${className}`}>
            <SkeletonLine width="60%" height="20px" />
            <SkeletonLine width="100%" height="14px" />
            <SkeletonLine width="80%" height="14px" />
            <div className="flex gap-3 pt-2">
                <SkeletonLine width="100px" height="36px" className="!rounded-full" />
                <SkeletonLine width="120px" height="36px" className="!rounded-full" />
            </div>
        </div>
    );
}

export function SkeletonScore({ className = '' }) {
    return (
        <div className={`card p-8 text-center space-y-4 ${className}`}>
            <SkeletonLine width="80px" height="48px" className="mx-auto" />
            <SkeletonLine width="120px" height="14px" className="mx-auto" />
            <SkeletonLine width="100%" height="6px" className="mt-4" />
        </div>
    );
}
