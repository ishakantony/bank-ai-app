import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Orb } from '../components/Orb'
import { BrandMark } from '../components/BrandMark'
import { TopicGrid } from '../components/TopicGrid'
import { AppShell } from '../components/AppShell'
import { useChatStore } from '../store/chatStore'
import type { Topic } from '../types'

export function WelcomePage() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const startGeneralFresh = useChatStore((s) => s.startGeneralFresh)

  function handleSubmit(text: string) {
    // Home input always starts a fresh general thread.
    startGeneralFresh(text)
    setMessage('')
    navigate('/chat')
  }

  function handleSelectTopic(topic: Topic) {
    // Each topic is its own thread; resume or show its welcome screen.
    navigate(`/chat?topic=${topic.id}`)
  }

  return (
    <AppShell value={message} onChange={setMessage} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center pb-6 pt-12 sm:pt-16">
        <div className="animate-float-in flex flex-col items-center">
          <Orb size={266} />
          <div className="mt-6">
            <BrandMark />
          </div>
          <h2 className="mt-5 text-center text-3xl font-medium text-white/85 sm:text-4xl">
            What can I help?
          </h2>
        </div>

        <section
          className="animate-float-in mt-12 w-full"
          style={{ animationDelay: '0.1s' }}
        >
          <TopicGrid onSelect={handleSelectTopic} />
        </section>
      </div>
    </AppShell>
  )
}
