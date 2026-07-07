import type { Insight, Locale, Topic } from '@bank-poc/shared'

/**
 * Static seed data served by the real backend, keyed by locale. This is
 * intentionally a separate copy from the MSW mock (`src/mocks/handlers.ts`): the
 * mock and the real Hono server are two independent backends, and these
 * topic/insight cards are static content that doesn't need a single source of
 * truth across them. The right bucket is selected from the request's
 * `Accept-Language` header.
 */

export const topics: Record<Locale, Topic[]> = {
  en: [
    { id: 'transfer', name: 'Transfer Money', description: 'Send funds to anyone, instantly and securely.', icon: 'transfer' },
    { id: 'cards', name: 'Card Services', description: 'Freeze, replace or manage your cards.', icon: 'card' },
    { id: 'savings', name: 'Savings & Goals', description: 'Track your goals and grow your savings.', icon: 'savings' },
    { id: 'security', name: 'Fraud & Security', description: 'Report suspicious activity and stay protected.', icon: 'security' },
    { id: 'insights', name: 'Insights', description: 'Personalized tips to make the most of your money.', icon: 'insights' },
  ],
  ms: [
    { id: 'transfer', name: 'Pindah Wang', description: 'Hantar dana kepada sesiapa sahaja, segera dan selamat.', icon: 'transfer' },
    { id: 'cards', name: 'Perkhidmatan Kad', description: 'Bekukan, gantikan atau urus kad anda.', icon: 'card' },
    { id: 'savings', name: 'Simpanan & Matlamat', description: 'Jejaki matlamat anda dan kembangkan simpanan anda.', icon: 'savings' },
    { id: 'security', name: 'Penipuan & Keselamatan', description: 'Laporkan aktiviti mencurigakan dan kekal terlindung.', icon: 'security' },
    { id: 'insights', name: 'Wawasan', description: 'Petua diperibadikan untuk memanfaatkan wang anda sepenuhnya.', icon: 'insights' },
  ],
  zh: [
    { id: 'transfer', name: '转账', description: '即时、安全地向任何人汇款。', icon: 'transfer' },
    { id: 'cards', name: '卡片服务', description: '冻结、更换或管理您的卡片。', icon: 'card' },
    { id: 'savings', name: '储蓄与目标', description: '追踪您的目标并增长储蓄。', icon: 'savings' },
    { id: 'security', name: '欺诈与安全', description: '举报可疑活动,保持受到保护。', icon: 'security' },
    { id: 'insights', name: '洞察', description: '个性化建议,让您的钱发挥最大价值。', icon: 'insights' },
  ],
}

export const insights: Record<Locale, Insight[]> = {
  en: [
    { id: 'portfolio', title: 'Your investment portfolio needs rebalancing', description: 'Your allocation has drifted from your target. Tap to review.', icon: 'portfolio', tone: 'amber' },
    { id: 'spending', title: 'Spending this month', description: "You've spent RM2,140 — 18% more than last month.", icon: 'spending', tone: 'blue' },
    { id: 'idleCash', title: 'Idle cash', description: 'RM8,500 sitting in checking could be earning more.', icon: 'idleCash', tone: 'green' },
  ],
  ms: [
    { id: 'portfolio', title: 'Portfolio pelaburan anda perlu diimbang semula', description: 'Peruntukan anda telah menyimpang daripada sasaran. Ketik untuk semak.', icon: 'portfolio', tone: 'amber' },
    { id: 'spending', title: 'Perbelanjaan bulan ini', description: 'Anda telah membelanjakan RM2,140 — 18% lebih daripada bulan lepas.', icon: 'spending', tone: 'blue' },
    { id: 'idleCash', title: 'Wang terbiar', description: 'RM8,500 dalam akaun semasa boleh memperoleh lebih banyak.', icon: 'idleCash', tone: 'green' },
  ],
  zh: [
    { id: 'portfolio', title: '您的投资组合需要重新平衡', description: '您的资产配置已偏离目标。点击查看。', icon: 'portfolio', tone: 'amber' },
    { id: 'spending', title: '本月支出', description: '您本月已花费 RM2,140 — 比上月高出 18%。', icon: 'spending', tone: 'blue' },
    { id: 'idleCash', title: '闲置现金', description: '闲置在往来账户中的 RM8,500 本可赚取更多。', icon: 'idleCash', tone: 'green' },
  ],
}
