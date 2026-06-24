/**
 * App-wide ambient backdrop: a handful of large, heavily-blurred colored orbs
 * drifting slowly behind all content. Fixed to the viewport and non-interactive,
 * it sits below the app (z -10) but above the body's static gradients. Low
 * opacity + blur keep the overall theme dark while adding subtle color motion.
 */

interface BgOrb {
  /** CSS color (a theme token) for the orb's radial glow. */
  color: string
  /** Diameter, e.g. '22rem'. */
  size: string
  /** Start position as inset values; any of top/bottom/left/right. */
  position: { top?: string; bottom?: string; left?: string; right?: string }
  /** Which drift keyframe to follow. */
  drift: string
  /** Animation duration — long for a slow, calm feel. */
  duration: string
  /** Negative/positive delay so the orbs desync. */
  delay: string
  opacity: number
}

const ORBS: BgOrb[] = [
  {
    color: 'var(--color-accent-1)', // violet
    size: '26rem',
    position: { top: '-6rem', left: '-8rem' },
    drift: 'drift-1',
    duration: '52s',
    delay: '0s',
    opacity: 0.38,
  },
  {
    color: 'var(--color-glow-warm)', // orange
    size: '20rem',
    position: { top: '20%', right: '-6rem' },
    drift: 'drift-3',
    duration: '64s',
    delay: '-12s',
    opacity: 0.3,
  },
  {
    color: 'var(--color-glow-green)', // emerald
    size: '22rem',
    position: { bottom: '-4rem', left: '10%' },
    drift: 'drift-2',
    duration: '58s',
    delay: '-26s',
    opacity: 0.3,
  },
  {
    color: 'var(--color-accent-3)', // cyan
    size: '18rem',
    position: { bottom: '8%', right: '8%' },
    drift: 'drift-4',
    duration: '46s',
    delay: '-8s',
    opacity: 0.32,
  },
  {
    color: 'var(--color-accent-2)', // magenta
    size: '20rem',
    position: { top: '38%', left: '14%' },
    drift: 'drift-5',
    duration: '70s',
    delay: '-34s',
    opacity: 0.26,
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
