import type { BlockRemoteManifest } from '@bank-poc/shared'
import { apiFetch } from './http'

/**
 * Fetch the block-remote manifest — which federated block remotes exist and
 * where to load them from. Called once at boot to register remote blocks with
 * the block registry.
 */
export async function fetchBlockRemotes(): Promise<BlockRemoteManifest> {
  const res = await apiFetch('/api/block-remotes')
  if (!res.ok) {
    throw new Error(`Failed to load block remotes (${res.status})`)
  }
  return (await res.json()) as BlockRemoteManifest
}
