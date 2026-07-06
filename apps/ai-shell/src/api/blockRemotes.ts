import type { BlockRemoteManifest } from '@bank-poc/shared'

/**
 * Fetch the block-remote manifest — which federated block remotes exist and
 * where to load them from. Called once at boot to register remote blocks with
 * the block registry.
 */
export async function fetchBlockRemotes(): Promise<BlockRemoteManifest> {
  const res = await fetch('/api/block-remotes')
  if (!res.ok) {
    throw new Error(`Failed to load block remotes (${res.status})`)
  }
  return (await res.json()) as BlockRemoteManifest
}
