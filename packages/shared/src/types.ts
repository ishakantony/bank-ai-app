/** A suggested conversation starter shown on the welcome screen. */
export interface Topic {
  id: TopicId
  name: string
  description: string
  /** Key mapped to a lucide-react icon in TopicCard. */
  icon: 'transfer' | 'card' | 'savings' | 'security' | 'insights'
}

/** The topic threads, keyed by `Topic.id`. */
export type TopicId = 'transfer' | 'cards' | 'savings' | 'security' | 'insights'

/** Visual + semantic accent for an insight card. */
export type InsightTone = 'amber' | 'blue' | 'green'

/** A personalized financial insight shown on the Insights welcome screen. */
export interface Insight {
  id: string
  title: string
  description: string
  /** Key mapped to a lucide-react icon in InsightCard. */
  icon: 'portfolio' | 'spending' | 'idleCash'
  tone: InsightTone
}

/** Every conversation lives in a thread: one per topic, plus the no-topic "general" thread. */
export type ThreadId = TopicId | 'general'

export type Role = 'user' | 'assistant'

/**
 * One federated block remote: its Module Federation name, the runtime
 * `remoteEntry.js` URL to load it from, and the block names it exposes (each
 * name matches a ```bank:<name>``` fence). Served by the backend so remote
 * locations are dynamic — a team can redeploy or add blocks without a host
 * release.
 */
export interface BlockRemote {
  name: string
  entry: string
  blocks: string[]
}

/** The manifest of block remotes the host fetches at boot to register them. */
export interface BlockRemoteManifest {
  remotes: BlockRemote[]
}

/** A single chat message. `status` only applies to assistant messages. */
export interface Message {
  id: string
  role: Role
  content: string
  status?: 'streaming' | 'error'
}
