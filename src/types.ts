/** A suggested conversation starter shown on the welcome screen. */
export interface Topic {
  id: string
  name: string
  description: string
  /** Key mapped to a lucide-react icon in TopicCard. */
  icon: 'transfer' | 'card' | 'savings' | 'security'
}
