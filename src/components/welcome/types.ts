import type { Topic } from '../../types'

export interface WelcomeProps {
  topic: Topic
  /** Sends `text` as the first user message, starting the conversation. */
  onSend: (text: string) => void
}
