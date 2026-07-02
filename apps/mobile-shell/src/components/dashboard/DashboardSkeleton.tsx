/** Loading placeholder mirroring the dashboard's rhythm while data streams in. */
export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 rounded-3xl bg-white/50" />
      <div className="flex gap-3">
        <div className="h-[104px] w-[78%] rounded-2xl bg-white/50" />
        <div className="h-[104px] w-1/4 rounded-2xl bg-white/40" />
      </div>
      <div className="flex justify-between gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="size-14 rounded-2xl bg-white/50" />
            <div className="h-2 w-10 rounded bg-white/40" />
          </div>
        ))}
      </div>
      <div className="h-72 rounded-3xl bg-white/50" />
    </div>
  )
}
