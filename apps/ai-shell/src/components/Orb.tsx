interface OrbProps {
  /** Diameter in pixels. */
  size?: number
  /** When false the orb spins slowly and dims its glow (idle state). */
  active?: boolean
  /** When true the core morphs circle ↔ rounded-square while it rotates. */
  loading?: boolean
  className?: string
}

/**
 * A spinning gradient orb with a blurred glow halo.
 * Reused large on the welcome screen and compact inside the chat input.
 */
export function Orb({
  size = 140,
  active = true,
  loading = false,
  className = '',
}: OrbProps) {
  const spin = active ? '6s' : '14s'
  const coreShape = loading
    ? 'orb-morph 2.4s ease-in-out infinite'
    : 'orb-pulse 4s ease-in-out infinite'

  return (
    <div
      aria-hidden
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-500"
        style={{
          opacity: active ? 0.75 : 0.35,
          background:
            'conic-gradient(from var(--angle), var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1))',
          animation: `spin-angle ${spin} linear infinite`,
        }}
      />
      {/* Core orb */}
      <div
        className="relative rounded-full"
        style={{
          width: '82%',
          height: '82%',
          background:
            'conic-gradient(from var(--angle), var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1))',
          animation: `spin-angle ${spin} linear infinite, ${coreShape}`,
          boxShadow: 'inset 0 0 24px rgba(255,255,255,0.35)',
        }}
      >
        {/* Inner highlight to give it depth */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '14%',
            background:
              'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%)',
          }}
        />
      </div>
    </div>
  )
}
