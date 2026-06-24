/** A suggested conversation starter shown on the welcome screen. */
export interface Topic {
  id: TopicId
  name: string
  description: string
  /** Key mapped to a lucide-react icon in TopicCard. */
  icon: 'transfer' | 'card' | 'savings' | 'security'
}

/** The four topic threads, keyed by `Topic.id`. */
export type TopicId = 'transfer' | 'cards' | 'savings' | 'security'

/** Every conversation lives in a thread: one per topic, plus the no-topic "general" thread. */
export type ThreadId = TopicId | 'general'

export type Role = 'user' | 'assistant'

/** A single chat message. `status` only applies to assistant messages. */
export interface Message {
  id: string
  role: Role
  content: string
  status?: 'streaming' | 'error'
}
