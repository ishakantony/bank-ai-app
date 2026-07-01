import type { Topic } from '@bank-ai/shared'

export interface WelcomeProps {
  topic: Topic
  /** Sends `text` as the first user message, starting the conversation. */
  onSend: (text: string) => void
}
