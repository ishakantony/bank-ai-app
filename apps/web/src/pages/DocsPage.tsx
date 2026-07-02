import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MarkdownBasics } from '../components/docs/MarkdownBasics'
import { BlockGallery } from '../components/docs/BlockGallery'
import { Playground } from '../components/docs/Playground'
import { ChatThreadProvider } from '@bank-ai/blocks-runtime'

type Tab = 'basics' | 'gallery' | 'playground'

const TABS: { id: Tab; label: string }[] = [
  { id: 'basics', label: 'Markdown Basics' },
  { id: 'gallery', label: 'Custom Blocks' },
  { id: 'playground', label: 'Playground' },
]

/**
 * `/docs` — living documentation for the reply-authoring system. Three tabs
 * (tracked in `?tab=`): Markdown Basics (the plain prose affordances), Custom
 * Blocks (the searchable block gallery), and a Playground for composing reply
 * markdown with a live preview. Reachable by URL only; spans the full browser
 * width, unlike the phone-width app shell.
 *
 * Block content is wrapped in `ChatThreadProvider` with no thread so the page
 * is side-effect free: charts/cards render fully, while prompt/signal pills and
 * the wizard drawer (which would post into a real chat thread) stay inert and
 * render as static previews.
 */
export function DocsPage() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: Tab =
    raw === 'basics' || raw === 'playground' ? raw : 'gallery'

  function selectTab(next: Tab) {
    setParams(
      (prev) => {
        prev.set('tab', next)
        return prev
      },
      { replace: true },
    )
  }

  return (
    <div className="relative min-h-dvh w-full px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white/85"
        >
          <ArrowLeft className="size-4" />
          Bank AI
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Blocks &amp; Markdown
          </h1>
          <p className="mt-1 text-sm text-white/55">
            A living reference for everything an assistant reply can render — and
            a playground to try it yourself.
          </p>
        </div>
        <div className="inline-flex gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/55 hover:text-white/85'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <ChatThreadProvider value={null}>
        {tab === 'basics' ? (
          <MarkdownBasics />
        ) : tab === 'playground' ? (
          <Playground />
        ) : (
          <BlockGallery />
        )}
      </ChatThreadProvider>
    </div>
  )
}
