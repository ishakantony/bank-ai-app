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
 * A spinning brand-gradient orb with a blurred glow halo — the app's animated
 * brand mark, reused on the auth screens and (compact) beside inputs. Same
 * mechanics as the dark app's Orb, retuned to the light theme's brand palette.
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
          opacity: active ? 0.6 : 0.28,
          background:
            'conic-gradient(from var(--angle), var(--color-brand-1), var(--color-brand-2), var(--color-brand-3), var(--color-brand-1))',
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
            'conic-gradient(from var(--angle), var(--color-brand-1), var(--color-brand-2), var(--color-brand-3), var(--color-brand-1))',
          animation: `spin-angle ${spin} linear infinite, ${coreShape}`,
          boxShadow: 'inset 0 0 24px rgba(255,255,255,0.45)',
        }}
      >
        {/* Inner highlight to give it depth */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '14%',
            background:
              'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%)',
          }}
        />
      </div>
    </div>
  )
}
