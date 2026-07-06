import type { BlockDoc } from '@bank-poc/blocks-kit'

/**
 * Docs for the portfolio blocks, exposed to the host's `/docs` gallery +
 * playground via Module Federation (the `./docs` expose). The remote owns its
 * own documentation the same way it owns its schema + component, so a team can
 * keep the two in sync without a host release. Keyed by block name (the
 * ```bank:<name>``` fence name).
 */
const docs: Record<string, BlockDoc> = {
  portfolioValue: {
    title: 'Portfolio value',
    summary:
      'A portfolio value overview: a hero total value with an optional gain/loss badge above a soft area chart tracing the value across `series` (oldest → newest). `gain`/`gainPct` describe the change over `periodLabel`, tinted by `gainTone` (inferred from the sign of `gain` when omitted). `currency` defaults to "RM".',
    category: 'portfolio',
    keywords: ['portfolio', 'value', 'growth', 'performance', 'area', 'gain', 'trend'],
    examples: [
      {
        label: 'Past 12 months',
        data: {
          value: 164200,
          currency: 'RM',
          periodLabel: 'Past 12 months',
          gain: 12400,
          gainPct: 8.2,
          series: [
            { label: 'Jul', value: 151800 },
            { label: 'Sep', value: 154300 },
            { label: 'Nov', value: 149600 },
            { label: 'Jan', value: 157100 },
            { label: 'Mar', value: 159900 },
            { label: 'May', value: 164200 },
          ],
        },
      },
    ],
  },
  holdingsTable: {
    title: 'Holdings table',
    summary:
      'A holdings table: a header (title + combined value) over a list of rows, each with a category icon, the holding name, its value, and an optional tone-coloured return — a gain reads green, a loss red, flat is muted. `category` keys into epf/prs/asb/unitTrust/stocks/cash. `currency` defaults to "RM".',
    category: 'portfolio',
    keywords: ['portfolio', 'holdings', 'positions', 'epf', 'asb', 'unit trust', 'return', 'list'],
    examples: [
      {
        label: 'Your holdings',
        data: {
          title: 'Your holdings',
          currency: 'RM',
          total: 164200,
          holdings: [
            { name: 'EPF', category: 'epf', value: 82400, returnPct: 5.4 },
            { name: 'ASB', category: 'asb', value: 38600, returnPct: 5.0 },
            { name: 'Public Mutual PRS Growth', category: 'prs', value: 21800, returnPct: 9.1 },
            { name: 'Global Equity Unit Trust', category: 'unitTrust', value: 14200, returnPct: -2.3 },
            { name: 'Bursa shares', category: 'stocks', value: 5400, returnPct: 12.6 },
            { name: 'Cash', category: 'cash', value: 1800, returnPct: 0 },
          ],
        },
      },
    ],
  },
  allocationRing: {
    title: 'Allocation ring',
    summary:
      'An asset-allocation ring: a donut whose centre shows the combined total and whose slices (asset classes) are splayed left/right with dashed leader lines. Each slice percent defaults to its share of the total value; `side` pins a label left/right. `title` defaults to "Asset allocation" (pass "" to hide it); `currency` defaults to "RM".',
    category: 'portfolio',
    keywords: ['portfolio', 'allocation', 'asset class', 'donut', 'ring', 'mix', 'diversification'],
    examples: [
      {
        label: 'Current mix',
        data: {
          title: 'Asset allocation',
          currency: 'RM',
          total: 164200,
          slices: [
            { label: 'Equities', value: 82100 },
            { label: 'Fixed income', value: 41050 },
            { label: 'Unit trusts', value: 24630 },
            { label: 'Cash', value: 16420 },
          ],
        },
      },
    ],
  },
}

export default docs
