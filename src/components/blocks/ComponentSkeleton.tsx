/**
 * Suspense placeholder shown while a lazy block chunk loads. Sized roughly like
 * a chart card so the layout doesn't jump when the real component fades in.
 */
export function ComponentSkeleton() {
  return (
    <div className="my-3 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
  )
}
