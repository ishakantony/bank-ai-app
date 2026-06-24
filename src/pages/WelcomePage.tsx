import { useState } from 'react'
import { Orb } from '../components/Orb'
import { BrandMark } from '../components/BrandMark'
import { TopicGrid } from '../components/TopicGrid'
import { ChatInput } from '../components/ChatInput'
import { Footer } from '../components/Footer'
import type { Topic } from '../types'

export function WelcomePage() {
  const [message, setMessage] = useState('')

  function handleSubmit(text: string) {
    // Welcome screen only — no chat backend yet.
    console.log('submit:', text)
  }

  function handleSelectTopic(topic: Topic) {
    setMessage(`Help me with: ${topic.name}`)
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[26rem] flex-col px-4">
      <main className="flex flex-1 flex-col items-center overflow-y-auto pb-6 pt-12 sm:pt-16">
        <div className="animate-float-in flex flex-col items-center">
          <Orb size={140} />
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
      </main>

      <div className="shrink-0 pt-2">
        <ChatInput
          value={message}
          onChange={setMessage}
          onSubmit={handleSubmit}
        />
        <Footer />
      </div>
    </div>
  )
}
