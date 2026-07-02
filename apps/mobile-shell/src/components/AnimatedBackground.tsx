/**
 * App-wide ambient backdrop: a handful of large, heavily-blurred pastel orbs
 * drifting slowly behind all content. Fixed to the viewport and non-interactive,
 * it sits below the app (z -10) above the body's static aurora. Soft, high-key
 * colors keep the light theme airy while adding gentle motion.
 */

interface BgOrb {
  color: string
  size: string
  position: { top?: string; bottom?: string; left?: string; right?: string }
  drift: string
  duration: string
  delay: string
  opacity: number
}

const ORBS: BgOrb[] = [
  {
    color: 'var(--color-glow-violet)',
    size: '26rem',
    position: { top: '-7rem', left: '-8rem' },
    drift: 'drift-1',
    duration: '52s',
    delay: '0s',
    opacity: 0.28,
  },
  {
    color: 'var(--color-glow-peach)',
    size: '20rem',
    position: { top: '18%', right: '-6rem' },
    drift: 'drift-3',
    duration: '64s',
    delay: '-12s',
    opacity: 0.22,
  },
  {
    color: 'var(--color-glow-mint)',
    size: '22rem',
    position: { bottom: '-4rem', left: '8%' },
    drift: 'drift-2',
    duration: '58s',
    delay: '-26s',
    opacity: 0.22,
  },
  {
    color: 'var(--color-glow-sky)',
    size: '18rem',
    position: { bottom: '10%', right: '6%' },
    drift: 'drift-4',
    duration: '46s',
    delay: '-8s',
    opacity: 0.26,
  },
  {
    color: 'var(--color-glow-violet)',
    size: '20rem',
    position: { top: '40%', left: '12%' },
    drift: 'drift-5',
    duration: '70s',
    delay: '-34s',
    opacity: 0.18,
  },
]

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="bg-orb absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            ...orb.position,
            opacity: orb.opacity,
            background: `radial-gradient(circle at 50% 50%, ${orb.color}, transparent 70%)`,
            animation: `${orb.drift} ${orb.duration} ease-in-out ${orb.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}
