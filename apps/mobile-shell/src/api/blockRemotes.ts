import type { BlockRemoteManifest } from '@bank-poc/shared'

/**
 * Fetch the federated-block manifest the shell registers at boot. The shell
 * ships no blocks today, so the mock returns `{ remotes: [] }` — but wiring the
 * fetch + registration now means adding a remote later is a backend-only change.
 */
export async function fetchBlockRemotes(): Promise<BlockRemoteManifest> {
  const res = await fetch('/api/block-remotes')
  if (!res.ok) {
    throw new Error(`Failed to load block remotes (${res.status})`)
  }
  return (await res.json()) as BlockRemoteManifest
}
