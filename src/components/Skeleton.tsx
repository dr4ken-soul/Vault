export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />
}

export function KpiSkeleton() {
  return (
    <div className="surface p-4">
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="h-7 w-28" />
    </div>
  )
}

export function TradeRowSkeleton() {
  return (
    <div className="surface flex items-center gap-3 p-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-2 h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function PlayerTileSkeleton() {
  return (
    <div className="surface p-4">
      <Skeleton className="mb-3 h-10 w-10 rounded-full" />
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-4 h-3 w-24" />
      <Skeleton className="mb-3 h-28 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
