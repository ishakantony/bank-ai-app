import { Orb } from './Orb'

/** Shown as an assistant bubble while waiting for the reply to arrive. */
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <Orb size={26} active className="shrink-0" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/5 px-3.5 py-3 ring-1 ring-white/10">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-white/50"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
