import type { Topic } from '@bank-poc/shared'

export interface WelcomeProps {
  topic: Topic
  /** Sends `text` as the first user message, starting the conversation. */
  onSend: (text: string) => void
}
