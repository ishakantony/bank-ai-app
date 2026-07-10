/**
 * Suspense placeholder shown while a block chunk / federated remote loads.
 * Framed like BlockCard with a shimmer sweep so it reads as a loading card and
 * the layout doesn't jump when the real block fades in.
 */
export function ComponentSkeleton() {
  return (
    <div className="relative my-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      {/* moving sheen */}
      <div className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* title line */}
      <div className="h-3.5 w-2/5 rounded-full bg-white/10" />
      {/* body block (chart/table stand-in) */}
      <div className="mt-4 h-24 rounded-xl bg-white/[0.06]" />
      {/* two content lines */}
      <div className="mt-3 h-3 w-3/4 rounded-full bg-white/10" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-white/10" />
    </div>
  )
}
