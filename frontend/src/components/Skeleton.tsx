export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton rounded-xl bg-black/5 ${className}`} />;
}
