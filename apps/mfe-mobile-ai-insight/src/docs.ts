import type { BlockDoc } from '@bank-poc/blocks-kit'

/**
 * Docs for the mobile AI insight cards, exposed via Module Federation (the
 * `./docs` expose) in the same convention as the AI block remotes. The remote
 * owns its own documentation alongside its schema + component. Keyed by block
 * name (the id the carousel feed references).
 */
const docs: Record<string, BlockDoc> = {
  insightCard: {
    title: 'AI insight card',
    summary:
      'A prose-first AI insight card for the mobile home carousel. The payload is `{ variant, widget, introText, prompt, widgetData }`: `variant` picks the slot size — `hero` (full-bleed slide), `wide`/`tall` (bento lead cell), `compact` (single bento cell). `introText` is the card\'s real content — a markdown paragraph supporting the inline `:hl[text]{tone=positive|negative|warning|info}` highlight directive, so the headline number/delta renders as bright colored text. On `hero`/`wide` a secondary `widget` visualization sits alongside the prose — `categories` (ranked bars, the default), `donut`, `gauge`, `progress`, or `countdown` — driven by the opaque `widgetData`, validated inside the card; an unknown `widget` or bad `widgetData` simply renders no widget (introText + CTA) rather than crashing. `tall`/`compact` are introText-only. A fixed "Full Insight ✨" pill floats bottom-right (icon-only on `compact`) and deep-links into the Bank AI chat, seeding the first message with `prompt`.',
    category: 'spending',
    keywords: [
      'ai', 'insight', 'spend', 'carousel', 'mobile', 'bento', 'banner',
      'introtext', 'markdown', 'highlight', 'widget', 'categories', 'bar',
      'donut', 'gauge', 'progress', 'countdown',
    ],
    examples: [
      {
        label: 'Categories bars (default)',
        data: {
          variant: 'hero',
          widget: 'categories',
          introText:
            'Your **June spending** hit :hl[RM6,800]{tone=warning} — :hl[+45% vs your 6-month average]{tone=negative}. Dining and Raya travel led the jump.',
          prompt: 'Break down my June spending and why it jumped 45%',
          widgetData: {
            categories: [
              { label: 'Dining', amount: 2450 },
              { label: 'Travel', amount: 1980 },
              { label: 'Shopping', amount: 1420 },
              { label: 'Groceries', amount: 950 },
            ],
          },
        },
      },
      {
        label: 'Long intro (fades)',
        data: {
          variant: 'hero',
          widget: 'categories',
          introText:
            'Your **June spending** climbed to :hl[RM6,800]{tone=warning}, up :hl[45%]{tone=negative} against your six-month average. Dining and Raya travel led the surge, while groceries and utilities held steady. A handful of one-off buys — flights, a hotel stay, and a new phone — pushed the total higher than any month so far this year, worth a closer look.',
          prompt: 'Break down my June spending and why it jumped 45%',
          widgetData: {
            categories: [
              { label: 'Dining', amount: 2450 },
              { label: 'Travel', amount: 1980 },
              { label: 'Shopping', amount: 1420 },
              { label: 'Groceries', amount: 950 },
            ],
          },
        },
      },
      {
        label: 'Donut (category mix)',
        data: {
          variant: 'hero',
          widget: 'donut',
          introText:
            "Here's where your :hl[RM6,800]{tone=info} went in June — split across :hl[4 categories]{tone=info}, with Dining and Travel on top.",
          prompt: 'Show my June spending split by category',
          widgetData: {
            slices: [
              { label: 'Dining', value: 2450 },
              { label: 'Travel', value: 1980 },
              { label: 'Shopping', value: 1420 },
              { label: 'Groceries', value: 950 },
            ],
          },
        },
      },
      {
        label: 'Gauge (savings rate)',
        data: {
          variant: 'tall',
          widget: 'gauge',
          introText:
            'Your **savings rate** is :hl[32%]{tone=positive} this month — :hl[+6 pts]{tone=positive} and on track for a healthy month.',
          prompt: 'How is my savings rate trending this year?',
          widgetData: { value: 32, max: 100, unit: '%', label: 'On track' },
        },
      },
      {
        label: 'Progress (goal)',
        data: {
          variant: 'wide',
          widget: 'progress',
          introText:
            'Your **emergency fund** is at :hl[RM8,200 of RM10,000]{tone=positive} — :hl[82%]{tone=positive} of the way to six months of expenses.',
          prompt: 'How close am I to my emergency-fund goal?',
          widgetData: {
            value: 8200,
            max: 10000,
            label: 'Emergency fund',
            valueLabel: 'RM8,200 of RM10,000',
          },
        },
      },
      {
        label: 'Countdown (card payment)',
        data: {
          variant: 'compact',
          widget: 'countdown',
          introText:
            'Your **Platinum-i** statement of :hl[RM6,200]{tone=warning} is due in :hl[6 days]{tone=warning}, on 25 Jul.',
          prompt: 'When is my credit card payment due and how much?',
          widgetData: {
            month: 'Jul',
            day: 25,
            count: 6,
            unit: 'days',
            caption: 'until your card payment',
          },
        },
      },
    ],
  },
}

export default docs
