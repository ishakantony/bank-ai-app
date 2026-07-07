import { http, HttpResponse, delay } from 'msw'
import type { ChatTurn } from '../api/chat'
import {
  DEFAULT_LOCALE,
  LOCALES,
  type BlockRemoteManifest,
  type Insight,
  type Locale,
  type ThreadId,
  type Topic,
} from '@bank-poc/shared'

// Mirrors the Hono server's manifest so mock mode drives runtime block loading
// too. Both point the host at the local spend (:9998) and portfolio (:9997)
// remotes. Locale-agnostic.
const blockRemotes: BlockRemoteManifest = {
  remotes: [
    {
      name: 'blocksSpend',
      entry: 'http://localhost:9998/remoteEntry.js',
      blocks: ['spendTrend', 'spendDonut', 'spendBreakdown'],
    },
    {
      name: 'blocksPortfolio',
      entry: 'http://localhost:9997/remoteEntry.js',
      blocks: ['portfolioValue', 'holdingsTable', 'allocationRing'],
    },
    {
      name: 'blocksWealth',
      entry: 'http://localhost:9996/remoteEntry.js',
      blocks: ['wizard', 'allocationDonut', 'driftBars', 'actionCard'],
    },
  ],
}

/**
 * Navigation phrases per locale. On the `insights` thread the backend matches
 * replies by *exact message text* — the user sends an insight card title or a
 * suggestion pill's text. These constants are referenced both as `insightReplies`
 * keys *and* inside the suggestion pills' send/label text (and insight card
 * titles), so a localized user's text always lines up with the localized reply
 * tables — never dead-ending to the `general` fallback.
 */
const NAV: Record<
  Locale,
  {
    rebalance: string
    showPortfolio: string
    spendMonth: string
    spendJune: string
    breakdown: string
    spendMay: string
    spendYear: string
    idleCash: string
  }
> = {
  en: {
    rebalance: 'Your investment portfolio needs rebalancing',
    showPortfolio: 'Show my full portfolio',
    spendMonth: 'Spending this month',
    spendJune: 'Show me spending in June',
    breakdown: 'View detailed breakdown',
    spendMay: 'Show me spending in May',
    spendYear: 'How much did I spend this year',
    idleCash: 'Idle cash',
  },
  ms: {
    rebalance: 'Portfolio pelaburan anda perlu diimbang semula',
    showPortfolio: 'Tunjukkan portfolio penuh saya',
    spendMonth: 'Perbelanjaan bulan ini',
    spendJune: 'Tunjukkan perbelanjaan pada Jun',
    breakdown: 'Lihat pecahan terperinci',
    spendMay: 'Tunjukkan perbelanjaan pada Mei',
    spendYear: 'Berapa banyak saya belanja tahun ini',
    idleCash: 'Wang terbiar',
  },
  zh: {
    rebalance: '您的投资组合需要重新平衡',
    showPortfolio: '显示我的完整投资组合',
    spendMonth: '本月支出',
    spendJune: '显示六月的支出',
    breakdown: '查看详细明细',
    spendMay: '显示五月的支出',
    spendYear: '我今年花了多少钱',
    idleCash: '闲置现金',
  },
}

/**
 * Wizard "aim" option labels per locale. Used both inside the idle-cash wizard
 * JSON (the option a user taps) and as the `wizardReplies` keys the submission's
 * first answer is matched against — so they stay in lockstep per locale.
 */
const WIZARD_AIM: Record<
  Locale,
  { wealth: string; retire: string; home: string; buffer: string }
> = {
  en: {
    wealth: 'Grow my wealth',
    retire: 'Save for retirement',
    home: 'Buy a home',
    buffer: 'Keep a rainy-day buffer',
  },
  ms: {
    wealth: 'Kembangkan kekayaan saya',
    retire: 'Simpan untuk persaraan',
    home: 'Beli rumah',
    buffer: 'Simpan dana kecemasan',
  },
  zh: {
    wealth: '增长我的财富',
    retire: '为退休储蓄',
    home: '购置房产',
    buffer: '保留应急储备',
  },
}

const topics: Record<Locale, Topic[]> = {
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

const insights: Record<Locale, Insight[]> = {
  en: [
    { id: 'portfolio', title: NAV.en.rebalance, description: 'Your allocation has drifted from your target. Tap to review.', icon: 'portfolio', tone: 'amber' },
    { id: 'spending', title: NAV.en.spendMonth, description: "You've spent RM6,800 — 45% more than your usual average.", icon: 'spending', tone: 'blue' },
    { id: 'idleCash', title: NAV.en.idleCash, description: 'RM8,500 sitting in checking could be earning more.', icon: 'idleCash', tone: 'green' },
  ],
  ms: [
    { id: 'portfolio', title: NAV.ms.rebalance, description: 'Peruntukan anda telah menyimpang daripada sasaran. Ketik untuk semak.', icon: 'portfolio', tone: 'amber' },
    { id: 'spending', title: NAV.ms.spendMonth, description: 'Anda telah membelanjakan RM6,800 — 45% lebih tinggi daripada purata biasa anda.', icon: 'spending', tone: 'blue' },
    { id: 'idleCash', title: NAV.ms.idleCash, description: 'RM8,500 dalam akaun semasa boleh memperoleh lebih banyak.', icon: 'idleCash', tone: 'green' },
  ],
  zh: [
    { id: 'portfolio', title: NAV.zh.rebalance, description: '您的资产配置已偏离目标。点击查看。', icon: 'portfolio', tone: 'amber' },
    { id: 'spending', title: NAV.zh.spendMonth, description: '您本月已花费 RM6,800 — 比您平常的平均值高出 45%。', icon: 'spending', tone: 'blue' },
    { id: 'idleCash', title: NAV.zh.idleCash, description: '闲置在往来账户中的 RM8,500 本可赚取更多。', icon: 'idleCash', tone: 'green' },
  ],
}

// Canned assistant replies, keyed by thread then locale. The frontend fakes
// streaming by typewriter-revealing whichever full string we return here.
const replies: Record<Locale, Record<ThreadId, string>> = {
  en: {
    transfer: `### Sending money

Happy to help you move funds. Here are your current **transfer limits and arrival times**:

| Method | Daily limit | Arrives | Fee |
| --- | --- | ---: | --- |
| DuitNow (instant) | RM25,000 | Seconds | Free |
| IBG (Interbank GIRO) | RM50,000 | Same/next business day | Free |
| International (SWIFT) | RM20,000 | 2–4 business days | RM15 |

To get started I'll need:

1. **Who** you're paying (a saved payee or a new recipient)
2. **How much** you'd like to send
3. **Which account** to send from

> 💡 Tip: Instant payments to a *new* recipient are held for review for up to 30 minutes the first time.

Who would you like to pay? You can also [manage your saved payees](https://example.com/payees).`,

    cards: `### Your cards

Here's a snapshot of the cards on your account:

| Card | Last 4 | Status | Monthly spend |
| --- | --- | --- | ---: |
| Everyday Debit | \`4471\` | 🟢 Active | RM1,240 |
| Travel Credit | \`8820\` | 🟢 Active | RM312 |
| Old Debit | \`1093\` | 🔴 Frozen | RM0 |

I can help you:

- **Freeze or unfreeze** a card instantly
- Order a **replacement** for a lost or damaged card
- Adjust **spending controls** and contactless limits

> ⚠️ If your card was lost or stolen, freeze it now and I'll start a replacement straight away.

Which card are we talking about?`,

    savings: `### Savings & goals

Great — let's grow those savings. Here's how your goals are tracking:

| Goal | Target | Saved | Progress |
| --- | ---: | ---: | --- |
| Emergency fund | RM6,000 | RM4,500 | 75% |
| Holiday 2026 | RM2,000 | RM600 | 30% |
| New laptop | RM1,500 | RM1,500 | ✅ Done |

A few things I can set up for you:

1. Open a **new goal** with an automatic monthly transfer
2. Project **how long** it'll take to hit a target at your current rate
3. Round up everyday spending into savings

> At RM250/month, your *Holiday 2026* goal is on track to complete by **November 2026**.

What are you saving for? You can also [view all goals](https://example.com/goals).`,

    security: `### Fraud & security

Your security is the priority. Here's the **recent activity** I flagged for review:

| Date | Merchant | Amount | Flag |
| --- | --- | ---: | --- |
| 24/06 | Unknown – Online | RM89.99 | 🔺 High risk |
| 23/06 | Kopitiam | RM4.20 | OK |
| 22/06 | Streaming Co. | RM12.99 | OK |

If you don't recognise the **RM89.99** charge, here's what we'll do:

- [x] Freeze the affected card
- [ ] Dispute the transaction
- [ ] Issue a replacement card

> ⚠️ **Never** share your one-time passcode (TAC) — Bank AI will never ask for it.

Want me to start a dispute? You can also [report fraud here](https://example.com/report-fraud).`,

    insights: `### Your financial insights

I keep an eye on your money and surface what matters. Right now I'm tracking:

| Insight | What's up |
| --- | --- |
| **Portfolio drift** | Your allocation has moved away from target |
| **Monthly spending** | You're trending 18% above last month |
| **Idle cash** | RM8,500 could be working harder |

Tap any insight above, or ask me something like *"why is my spending up?"*`,

    general: `## Hi, I'm Bank AI 👋

I can help you take care of your money. Here's what I'm good at:

| Topic | What I can do |
| --- | --- |
| **Transfers** | Send money, manage payees, check limits |
| **Cards** | Freeze, replace, set spending controls |
| **Savings** | Open goals, automate saving, track progress |
| **Security** | Review activity, lock your account, report fraud |

Just tell me what you'd like to do — for example:

- *"Send RM200 to Sam"*
- *"Freeze my travel card"*
- *"How's my holiday goal doing?"*

What would you like to do first?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Send money", "send": "I'd like to send some money" },
  { "kind": "prompt", "label": "Freeze a card" },
  { "kind": "prompt", "label": "Check my savings goals" },
  { "kind": "link", "label": "Open the banking app", "url": "https://example.com/app" }
] }
\`\`\``,
  },

  ms: {
    transfer: `### Menghantar wang

Dengan senang hati membantu anda memindahkan dana. Berikut ialah **had pemindahan dan masa ketibaan** semasa anda:

| Kaedah | Had harian | Tiba | Yuran |
| --- | --- | ---: | --- |
| DuitNow (segera) | RM25,000 | Beberapa saat | Percuma |
| IBG (Interbank GIRO) | RM50,000 | Hari bekerja sama/berikutnya | Percuma |
| Antarabangsa (SWIFT) | RM20,000 | 2–4 hari bekerja | RM15 |

Untuk bermula, saya perlukan:

1. **Siapa** yang anda mahu bayar (penerima disimpan atau penerima baharu)
2. **Berapa** yang anda mahu hantar
3. **Akaun mana** untuk menghantar

> 💡 Petua: Pembayaran segera kepada penerima *baharu* ditahan untuk semakan sehingga 30 minit pada kali pertama.

Siapa yang anda mahu bayar? Anda juga boleh [urus penerima disimpan anda](https://example.com/payees).`,

    cards: `### Kad anda

Berikut ialah gambaran kad dalam akaun anda:

| Kad | 4 akhir | Status | Perbelanjaan bulanan |
| --- | --- | --- | ---: |
| Debit Harian | \`4471\` | 🟢 Aktif | RM1,240 |
| Kredit Perjalanan | \`8820\` | 🟢 Aktif | RM312 |
| Debit Lama | \`1093\` | 🔴 Dibekukan | RM0 |

Saya boleh bantu anda:

- **Bekukan atau nyahbeku** kad dengan segera
- Pesan **gantian** untuk kad yang hilang atau rosak
- Laraskan **kawalan perbelanjaan** dan had tanpa sentuh

> ⚠️ Jika kad anda hilang atau dicuri, bekukan sekarang dan saya akan mulakan gantian dengan segera.

Kad mana yang kita bincangkan?`,

    savings: `### Simpanan & matlamat

Bagus — mari kembangkan simpanan itu. Berikut ialah perkembangan matlamat anda:

| Matlamat | Sasaran | Disimpan | Kemajuan |
| --- | ---: | ---: | --- |
| Dana kecemasan | RM6,000 | RM4,500 | 75% |
| Percutian 2026 | RM2,000 | RM600 | 30% |
| Komputer riba baharu | RM1,500 | RM1,500 | ✅ Selesai |

Beberapa perkara yang boleh saya sediakan untuk anda:

1. Buka **matlamat baharu** dengan pemindahan bulanan automatik
2. Unjurkan **berapa lama** untuk mencapai sasaran pada kadar semasa anda
3. Bundarkan perbelanjaan harian ke dalam simpanan

> Pada RM250/bulan, matlamat *Percutian 2026* anda dijangka selesai menjelang **November 2026**.

Apakah yang anda simpan? Anda juga boleh [lihat semua matlamat](https://example.com/goals).`,

    security: `### Penipuan & keselamatan

Keselamatan anda ialah keutamaan. Berikut ialah **aktiviti terkini** yang saya bendera untuk semakan:

| Tarikh | Peniaga | Jumlah | Bendera |
| --- | --- | ---: | --- |
| 24/06 | Tidak diketahui – Dalam talian | RM89.99 | 🔺 Risiko tinggi |
| 23/06 | Kopitiam | RM4.20 | OK |
| 22/06 | Streaming Co. | RM12.99 | OK |

Jika anda tidak mengenali caj **RM89.99** itu, inilah yang akan kita lakukan:

- [x] Bekukan kad yang terjejas
- [ ] Pertikaikan transaksi
- [ ] Keluarkan kad gantian

> ⚠️ **Jangan sekali-kali** kongsi kod laluan sekali guna (TAC) anda — Bank AI tidak akan sesekali memintanya.

Mahu saya mulakan pertikaian? Anda juga boleh [laporkan penipuan di sini](https://example.com/report-fraud).`,

    insights: `### Wawasan kewangan anda

Saya memantau wang anda dan menyerlahkan perkara penting. Sekarang saya sedang menjejaki:

| Wawasan | Apa yang berlaku |
| --- | --- |
| **Penyimpangan portfolio** | Peruntukan anda telah menjauh daripada sasaran |
| **Perbelanjaan bulanan** | Anda meningkat 18% berbanding bulan lepas |
| **Wang terbiar** | RM8,500 boleh bekerja lebih keras |

Ketik mana-mana wawasan di atas, atau tanya saya sesuatu seperti *"kenapa perbelanjaan saya meningkat?"*`,

    general: `## Hai, saya Bank AI 👋

Saya boleh membantu anda menguruskan wang anda. Berikut ialah kepakaran saya:

| Topik | Apa yang saya boleh lakukan |
| --- | --- |
| **Pindahan** | Hantar wang, urus penerima, semak had |
| **Kad** | Bekukan, gantikan, tetapkan kawalan perbelanjaan |
| **Simpanan** | Buka matlamat, automasikan simpanan, jejaki kemajuan |
| **Keselamatan** | Semak aktiviti, kunci akaun, laporkan penipuan |

Beritahu saya apa yang anda mahu lakukan — contohnya:

- *"Hantar RM200 kepada Sam"*
- *"Bekukan kad perjalanan saya"*
- *"Bagaimana matlamat percutian saya?"*

Apa yang anda mahu lakukan dahulu?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Hantar wang", "send": "Saya ingin menghantar wang" },
  { "kind": "prompt", "label": "Bekukan kad" },
  { "kind": "prompt", "label": "Semak matlamat simpanan saya" },
  { "kind": "link", "label": "Buka aplikasi perbankan", "url": "https://example.com/app" }
] }
\`\`\``,
  },

  zh: {
    transfer: `### 汇款

很乐意帮您转移资金。以下是您当前的**转账限额和到账时间**:

| 方式 | 每日限额 | 到账 | 费用 |
| --- | --- | ---: | --- |
| DuitNow(即时) | RM25,000 | 数秒 | 免费 |
| IBG(银行间转账) | RM50,000 | 当天/次个工作日 | 免费 |
| 国际(SWIFT) | RM20,000 | 2–4 个工作日 | RM15 |

开始前,我需要:

1. 您要付款给**谁**(已保存的收款人或新收款人)
2. 您想汇**多少**
3. 从**哪个账户**汇出

> 💡 提示:首次向*新*收款人进行即时付款时,将被暂留审核最多 30 分钟。

您想付款给谁?您也可以[管理您已保存的收款人](https://example.com/payees)。`,

    cards: `### 您的卡片

以下是您账户中卡片的概览:

| 卡片 | 末四位 | 状态 | 每月消费 |
| --- | --- | --- | ---: |
| 日常借记卡 | \`4471\` | 🟢 有效 | RM1,240 |
| 旅行信用卡 | \`8820\` | 🟢 有效 | RM312 |
| 旧借记卡 | \`1093\` | 🔴 已冻结 | RM0 |

我可以帮您:

- 即时**冻结或解冻**卡片
- 为遗失或损坏的卡片申请**补发**
- 调整**消费控制**和非接触式限额

> ⚠️ 如果您的卡片遗失或被盗,请立即冻结,我会马上为您办理补发。

我们说的是哪张卡?`,

    savings: `### 储蓄与目标

太好了 — 让我们来增长这些储蓄。以下是您目标的进展情况:

| 目标 | 目标金额 | 已存 | 进度 |
| --- | ---: | ---: | --- |
| 应急基金 | RM6,000 | RM4,500 | 75% |
| 2026 假期 | RM2,000 | RM600 | 30% |
| 新笔记本电脑 | RM1,500 | RM1,500 | ✅ 完成 |

我可以为您设置的几项:

1. 开设一个带每月自动转账的**新目标**
2. 预测按当前速度**需要多久**才能达到目标
3. 将日常消费凑整存入储蓄

> 以每月 RM250 计算,您的*2026 假期*目标预计将在 **2026 年 11 月**完成。

您在为什么存钱?您也可以[查看所有目标](https://example.com/goals)。`,

    security: `### 欺诈与安全

您的安全是首要任务。以下是我标记待审核的**近期活动**:

| 日期 | 商户 | 金额 | 标记 |
| --- | --- | ---: | --- |
| 24/06 | 未知 – 在线 | RM89.99 | 🔺 高风险 |
| 23/06 | 咖啡店 | RM4.20 | 正常 |
| 22/06 | Streaming Co. | RM12.99 | 正常 |

如果您不认得这笔 **RM89.99** 的扣款,我们会这样处理:

- [x] 冻结受影响的卡片
- [ ] 对该交易提出异议
- [ ] 补发一张新卡

> ⚠️ **切勿**分享您的一次性密码(TAC)— Bank AI 绝不会向您索取。

需要我发起异议吗?您也可以[在此举报欺诈](https://example.com/report-fraud)。`,

    insights: `### 您的财务洞察

我会关注您的资金并突出显示重要事项。目前我正在追踪:

| 洞察 | 情况 |
| --- | --- |
| **投资组合偏移** | 您的资产配置已偏离目标 |
| **月度支出** | 您比上月高出 18% |
| **闲置现金** | RM8,500 本可发挥更大作用 |

点击上方任一洞察,或问我一些问题,例如*"为什么我的支出增加了?"*`,

    general: `## 你好,我是 Bank AI 👋

我可以帮您打理您的资金。以下是我擅长的:

| 主题 | 我能做什么 |
| --- | --- |
| **转账** | 汇款、管理收款人、查看限额 |
| **卡片** | 冻结、补发、设置消费控制 |
| **储蓄** | 开设目标、自动储蓄、追踪进度 |
| **安全** | 查看活动、锁定账户、举报欺诈 |

只需告诉我您想做什么 — 例如:

- *"给 Sam 转 RM200"*
- *"冻结我的旅行卡"*
- *"我的假期目标进展如何?"*

您想先做什么?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "汇款", "send": "我想汇一笔钱" },
  { "kind": "prompt", "label": "冻结卡片" },
  { "kind": "prompt", "label": "查看我的储蓄目标" },
  { "kind": "link", "label": "打开银行应用", "url": "https://example.com/app" }
] }
\`\`\``,
  },
}

// The daily spend-trend series is pure numeric data (no translatable text), so
// it's single-sourced here and reused across locales — only the month labels on
// the block differ per language.
const SPEND_TREND_DATA = `"markerDay": 30,
  "current": [
    { "day": 1, "amount": 75 }, { "day": 3, "amount": 200 }, { "day": 5, "amount": 330 },
    { "day": 7, "amount": 470 }, { "day": 9, "amount": 610 }, { "day": 11, "amount": 760 },
    { "day": 13, "amount": 900 }, { "day": 15, "amount": 1050 }, { "day": 17, "amount": 1190 },
    { "day": 19, "amount": 1330 }, { "day": 21, "amount": 1480 }, { "day": 23, "amount": 1620 },
    { "day": 25, "amount": 1720 }, { "day": 27, "amount": 1810 }, { "day": 30, "amount": 1910 },
    { "day": 31, "amount": 2010 }
  ],
  "previous": [
    { "day": 1, "amount": 95 }, { "day": 3, "amount": 250 }, { "day": 5, "amount": 410 },
    { "day": 7, "amount": 580 }, { "day": 9, "amount": 760 }, { "day": 11, "amount": 940 },
    { "day": 13, "amount": 1110 }, { "day": 15, "amount": 1300 }, { "day": 17, "amount": 1470 },
    { "day": 19, "amount": 1640 }, { "day": 21, "amount": 1820 }, { "day": 23, "amount": 1960 },
    { "day": 25, "amount": 2070 }, { "day": 27, "amount": 2140 }, { "day": 30, "amount": 2180 }
  ]`

/** The per-locale reply strings for the insights journey (spend + portfolio). */
interface LocaleContent {
  rebalancing: string
  portfolio: string
  spendThisMonth: string
  spendBreakdown: string
  spendInMay: string
  spendThisYear: string
  idleCash: string
}

const CONTENT: Record<Locale, LocaleContent> = {
  en: {
    rebalancing: `### Portfolio rebalancing

Your allocation has :hl[drifted]{tone=negative} as markets moved. Here's where you stand today — equities **68%**, bonds **24%**, cash **8%**:

\`\`\`bank:allocationDonut
{ "title": "Current allocation", "slices": [
  { "label": "Equities", "value": 68 },
  { "label": "Bonds", "value": 24 },
  { "label": "Cash", "value": 8 }
] }
\`\`\`

Against your **target**, equities are over and bonds are under:

\`\`\`bank:driftBars
{ "title": "Target vs current", "unit": "%", "items": [
  { "label": "Equities", "target": 60, "current": 68 },
  { "label": "Bonds", "target": 30, "current": 24 },
  { "label": "Cash", "target": 10, "current": 8 }
] }
\`\`\`

To get back on target, I'd suggest:

\`\`\`bank:actionCard
{ "title": "Suggested trades", "actions": [
  { "label": "Trim equities", "detail": "Sell ~RM4,200 to lock in recent gains" },
  { "label": "Top up bonds", "detail": "Restore your income buffer" },
  { "label": "Set quarterly auto-rebalance", "detail": "Keeps your mix on target automatically" }
], "cta": { "label": "Prepare these trades for review" } }
\`\`\`

> ⚖️ Rebalancing now keeps your risk in line with your plan.

Want me to prepare these trades for your review?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Prepare the trades", "send": "Prepare these trades for review" },
  { "kind": "prompt", "label": "Show my full portfolio", "send": "${NAV.en.showPortfolio}" },
  { "kind": "prompt", "label": "Why did it drift?" }
] }
\`\`\``,

    portfolio: `### Your portfolio at a glance

Your investments are worth :hl[RM164,200]{tone=positive} today — up :hl[RM12,400 (8.2%)]{tone=positive} over the past year.

\`\`\`bank:portfolioValue
{
  "value": 164200,
  "currency": "RM",
  "periodLabel": "Past 12 months",
  "gain": 12400,
  "gainPct": 8.2,
  "series": [
    { "label": "Jul", "value": 151800 },
    { "label": "Sep", "value": 154300 },
    { "label": "Nov", "value": 149600 },
    { "label": "Jan", "value": 157100 },
    { "label": "Mar", "value": 159900 },
    { "label": "May", "value": 164200 }
  ]
}
\`\`\`

Here's how that value splits across your holdings:

\`\`\`bank:holdingsTable
{
  "title": "Your holdings",
  "currency": "RM",
  "total": 164200,
  "holdings": [
    { "name": "EPF", "category": "epf", "value": 82400, "returnPct": 5.4 },
    { "name": "ASB", "category": "asb", "value": 38600, "returnPct": 5.0 },
    { "name": "Public Mutual PRS Growth", "category": "prs", "value": 21800, "returnPct": 9.1 },
    { "name": "Global Equity Unit Trust", "category": "unitTrust", "value": 14200, "returnPct": -2.3 },
    { "name": "Bursa shares", "category": "stocks", "value": 5400, "returnPct": 12.6 },
    { "name": "Cash", "category": "cash", "value": 1800, "returnPct": 0 }
  ]
}
\`\`\`

And your split by asset class:

\`\`\`bank:allocationRing
{
  "title": "Asset allocation",
  "currency": "RM",
  "total": 164200,
  "slices": [
    { "label": "Equities", "value": 82100 },
    { "label": "Fixed income", "value": 41050 },
    { "label": "Unit trusts", "value": 24630 },
    { "label": "Cash", "value": 16420 }
  ]
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Rebalance my portfolio", "send": "${NAV.en.rebalance}" },
  { "kind": "link", "label": "Open the investing app", "url": "https://example.com/portfolio" }
] }
\`\`\``,

    spendThisMonth: `### Spending this month

You've spent :hl[RM6,800]{tone=warning} in June — about **45% higher** than your usual 6-month average. Don't worry, your **school-holiday getaway to Langkawi** was the primary driver behind this!

\`\`\`bank:spendDonut
{
  "month": "June",
  "currency": "RM",
  "spend": 6800,
  "transactions": 96,
  "spendVsAvg": "+45% vs AVG",
  "txnVsAvg": "+25 vs AVG",
  "categories": [
    { "label": "Dining", "amount": 2448 },
    { "label": "Shopping", "amount": 1632 },
    { "label": "Transport", "amount": 1156 },
    { "label": "Transfer", "amount": 544 },
    { "label": "Others", "amount": 1020 }
  ]
}
\`\`\`

**Shopping** saw the biggest jump — duty-free finds on the island — while meals out and flights nudged **dining** and **transport** up too. Want the full category-by-category picture?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "View detailed breakdown" },
  { "kind": "prompt", "label": "Show me spending in May" },
  { "kind": "prompt", "label": "How much did I spend this year" }
] }
\`\`\``,

    spendBreakdown: `### June, category by category

You spent :hl[RM6,800]{tone=warning} in June — :hl[45% higher]{tone=warning} than your usual 6-month average. But don't worry, your **school-holiday getaway to Langkawi** was the :hl[primary driver]{tone=positive} behind this!

**Shopping** experienced the most noticeable jump at :hl[+RM867]{tone=warning} above your usual rhythm — duty-free shopping on the island — while island meals and flights nudged **dining** and **transport** up by :hl[+RM530]{tone=warning} and :hl[+RM548]{tone=warning}.

\`\`\`bank:spendBreakdown
{
  "title": "June Spend",
  "currency": "RM",
  "total": 6800,
  "vsAvg": "+RM2,110",
  "vsAvgLabel": "vs. 6-Month Avg",
  "categories": [
    { "label": "Dining", "icon": "dining", "percent": 36, "amount": 2448, "delta": "+RM530" },
    { "label": "Shopping", "icon": "shopping", "percent": 24, "amount": 1632, "delta": "+RM867" },
    { "label": "Transport", "icon": "transport", "percent": 17, "amount": 1156, "delta": "+RM548" },
    { "label": "Transfer", "icon": "transfer", "percent": 8, "amount": 544, "delta": "+RM100" },
    { "label": "Bills & Utility", "icon": "bills", "percent": 6, "amount": 408, "delta": "Flat" },
    { "label": "Entertainment", "icon": "entertainment", "percent": 5, "amount": 340, "delta": "-RM22" },
    { "label": "Others", "icon": "others", "percent": 4, "amount": 272, "delta": "+RM87" }
  ]
}
\`\`\`

Setting a dining budget could keep next month closer to your usual pace. Want me to dig into a specific month, or look at the whole year?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Show me spending in May" },
  { "kind": "prompt", "label": "How much did I spend this year" }
] }
\`\`\``,

    spendInMay: `### Spending in May

In May you spent :hl[RM2,010]{tone=positive} across 24 transactions — about **8% less** than April. Groceries and transport stayed flat; the drop came from fewer shopping trips.

\`\`\`bank:spendTrend
{
  "spend": 2010,
  "transactions": 24,
  "currency": "RM",
  "currentLabel": "May",
  "previousLabel": "April",
  ${SPEND_TREND_DATA}
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Show me spending in June", "send": "${NAV.en.spendJune}" },
  { "kind": "prompt", "label": "How much did I spend this year" }
] }
\`\`\``,

    spendThisYear: `### Spending so far this year

You've spent :hl[RM12,480]{tone=info} over the first six months — an average of **RM2,080 a month**. June is your biggest month so far at RM2,140; February was the leanest at RM1,760.

\`\`\`bank:allocationDonut
{
  "title": "Spending by category (year to date)",
  "slices": [
    { "label": "Dining & takeaway", "value": 28 },
    { "label": "Groceries", "value": 22 },
    { "label": "Shopping", "value": 18 },
    { "label": "Transport", "value": 16 },
    { "label": "Travel", "value": 10 },
    { "label": "Subscriptions", "value": 6 }
  ]
}
\`\`\`

Dining and groceries together make up half your spend. A RM2,000 monthly budget would keep you on last year's pace.

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Show me spending in May" },
  { "kind": "prompt", "label": "Show me spending in June", "send": "${NAV.en.spendJune}" }
] }
\`\`\``,

    idleCash: `### Idle cash

You're holding :hl[RM8,500]{tone=positive} in checking earning just **0.1%**. Before I suggest where it should go, let's tailor it to what you actually want this money to do.

\`\`\`bank:wizard
{
  "id": "idleCash",
  "title": "Make your idle cash work",
  "subtitle": "A few quick questions to tailor your options",
  "start": "aim",
  "questions": {
    "aim": {
      "title": "What's your aim for this money?",
      "options": [
        { "value": "wealth", "label": "${WIZARD_AIM.en.wealth}", "next": "horizon" },
        { "value": "retire", "label": "${WIZARD_AIM.en.retire}", "next": "retireWhen" },
        { "value": "home", "label": "${WIZARD_AIM.en.home}", "next": "homeWhen" },
        { "value": "buffer", "label": "${WIZARD_AIM.en.buffer}" }
      ]
    },
    "horizon": {
      "title": "Over what time frame?",
      "options": [
        { "value": "short", "label": "Under 3 years" },
        { "value": "mid", "label": "3 to 5 years", "next": "risk" },
        { "value": "long", "label": "5 years or more", "next": "risk" }
      ]
    },
    "risk": {
      "title": "How do you feel about ups and downs?",
      "options": [
        { "value": "cautious", "label": "Keep it steady" },
        { "value": "balanced", "label": "A balanced mix" },
        { "value": "adventurous", "label": "Chase higher returns" }
      ]
    },
    "retireWhen": {
      "title": "How far off is retirement?",
      "options": [
        { "value": "soon", "label": "Less than 5 years" },
        { "value": "midway", "label": "5 to 15 years" },
        { "value": "far", "label": "More than 15 years" }
      ]
    },
    "homeWhen": {
      "title": "When do you hope to buy?",
      "options": [
        { "value": "soon", "label": "Within 2 years" },
        { "value": "later", "label": "2 to 5 years away" }
      ]
    }
  }
}
\`\`\`

Tap **Get started** and I'll line up the right options for you.`,
  },

  ms: {
    rebalancing: `### Pengimbangan semula portfolio

Peruntukan anda telah :hl[menyimpang]{tone=negative} apabila pasaran bergerak. Berikut ialah kedudukan anda hari ini — ekuiti **68%**, bon **24%**, tunai **8%**:

\`\`\`bank:allocationDonut
{ "title": "Peruntukan semasa", "slices": [
  { "label": "Ekuiti", "value": 68 },
  { "label": "Bon", "value": 24 },
  { "label": "Tunai", "value": 8 }
] }
\`\`\`

Berbanding **sasaran** anda, ekuiti melebihi dan bon kurang:

\`\`\`bank:driftBars
{ "title": "Sasaran vs semasa", "unit": "%", "items": [
  { "label": "Ekuiti", "target": 60, "current": 68 },
  { "label": "Bon", "target": 30, "current": 24 },
  { "label": "Tunai", "target": 10, "current": 8 }
] }
\`\`\`

Untuk kembali ke sasaran, saya cadangkan:

\`\`\`bank:actionCard
{ "title": "Cadangan dagangan", "actions": [
  { "label": "Kurangkan ekuiti", "detail": "Jual ~RM4,200 untuk mengunci keuntungan terkini" },
  { "label": "Tambah bon", "detail": "Pulihkan penampan pendapatan anda" },
  { "label": "Tetapkan imbang semula automatik suku tahunan", "detail": "Mengekalkan gabungan anda pada sasaran secara automatik" }
], "cta": { "label": "Sediakan dagangan ini untuk semakan" } }
\`\`\`

> ⚖️ Mengimbang semula sekarang mengekalkan risiko anda selaras dengan pelan anda.

Mahu saya sediakan dagangan ini untuk semakan anda?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Sediakan dagangan", "send": "Sediakan dagangan ini untuk semakan" },
  { "kind": "prompt", "label": "Tunjukkan portfolio penuh saya", "send": "${NAV.ms.showPortfolio}" },
  { "kind": "prompt", "label": "Kenapa ia menyimpang?" }
] }
\`\`\``,

    portfolio: `### Portfolio anda sekilas pandang

Pelaburan anda bernilai :hl[RM164,200]{tone=positive} hari ini — naik :hl[RM12,400 (8.2%)]{tone=positive} sepanjang tahun lepas.

\`\`\`bank:portfolioValue
{
  "value": 164200,
  "currency": "RM",
  "periodLabel": "12 bulan lepas",
  "gain": 12400,
  "gainPct": 8.2,
  "series": [
    { "label": "Jul", "value": 151800 },
    { "label": "Sep", "value": 154300 },
    { "label": "Nov", "value": 149600 },
    { "label": "Jan", "value": 157100 },
    { "label": "Mac", "value": 159900 },
    { "label": "Mei", "value": 164200 }
  ]
}
\`\`\`

Berikut ialah bagaimana nilai itu terbahagi merentasi pegangan anda:

\`\`\`bank:holdingsTable
{
  "title": "Pegangan anda",
  "currency": "RM",
  "total": 164200,
  "holdings": [
    { "name": "EPF", "category": "epf", "value": 82400, "returnPct": 5.4 },
    { "name": "ASB", "category": "asb", "value": 38600, "returnPct": 5.0 },
    { "name": "Public Mutual PRS Growth", "category": "prs", "value": 21800, "returnPct": 9.1 },
    { "name": "Unit Amanah Ekuiti Global", "category": "unitTrust", "value": 14200, "returnPct": -2.3 },
    { "name": "Saham Bursa", "category": "stocks", "value": 5400, "returnPct": 12.6 },
    { "name": "Tunai", "category": "cash", "value": 1800, "returnPct": 0 }
  ]
}
\`\`\`

Dan pembahagian anda mengikut kelas aset:

\`\`\`bank:allocationRing
{
  "title": "Peruntukan aset",
  "currency": "RM",
  "total": 164200,
  "slices": [
    { "label": "Ekuiti", "value": 82100 },
    { "label": "Pendapatan tetap", "value": 41050 },
    { "label": "Unit amanah", "value": 24630 },
    { "label": "Tunai", "value": 16420 }
  ]
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Imbang semula portfolio saya", "send": "${NAV.ms.rebalance}" },
  { "kind": "link", "label": "Buka aplikasi pelaburan", "url": "https://example.com/portfolio" }
] }
\`\`\``,

    spendThisMonth: `### Perbelanjaan bulan ini

Anda telah membelanjakan :hl[RM6,800]{tone=warning} pada bulan Jun — kira-kira **45% lebih tinggi** daripada purata 6 bulan biasa anda. Jangan risau, **percutian cuti sekolah ke Langkawi** anda ialah pemacu utama di sebalik ini!

\`\`\`bank:spendDonut
{
  "month": "Jun",
  "currency": "RM",
  "spend": 6800,
  "transactions": 96,
  "spendVsAvg": "+45% vs PURATA",
  "txnVsAvg": "+25 vs PURATA",
  "categories": [
    { "label": "Makan", "amount": 2448 },
    { "label": "Beli-belah", "amount": 1632 },
    { "label": "Pengangkutan", "amount": 1156 },
    { "label": "Pindahan", "amount": 544 },
    { "label": "Lain-lain", "amount": 1020 }
  ]
}
\`\`\`

**Beli-belah** mencatatkan lonjakan terbesar — barangan bebas cukai di pulau — manakala makan di luar dan penerbangan turut menaikkan **makan** dan **pengangkutan**. Mahukan gambaran penuh kategori demi kategori?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Lihat pecahan terperinci" },
  { "kind": "prompt", "label": "Tunjukkan perbelanjaan pada Mei" },
  { "kind": "prompt", "label": "Berapa banyak saya belanja tahun ini" }
] }
\`\`\``,

    spendBreakdown: `### Jun, kategori demi kategori

Anda membelanjakan :hl[RM6,800]{tone=warning} pada bulan Jun — :hl[45% lebih tinggi]{tone=warning} daripada purata 6 bulan biasa anda. Tetapi jangan risau, **percutian cuti sekolah ke Langkawi** anda ialah :hl[pemacu utama]{tone=positive} di sebalik ini!

**Beli-belah** mengalami lonjakan paling ketara pada :hl[+RM867]{tone=warning} melebihi rentak biasa anda — beli-belah bebas cukai di pulau — manakala hidangan pulau dan penerbangan menaikkan **makan** dan **pengangkutan** sebanyak :hl[+RM530]{tone=warning} dan :hl[+RM548]{tone=warning}.

\`\`\`bank:spendBreakdown
{
  "title": "Perbelanjaan Jun",
  "currency": "RM",
  "total": 6800,
  "vsAvg": "+RM2,110",
  "vsAvgLabel": "vs. Purata 6 Bulan",
  "categories": [
    { "label": "Makan", "icon": "dining", "percent": 36, "amount": 2448, "delta": "+RM530" },
    { "label": "Beli-belah", "icon": "shopping", "percent": 24, "amount": 1632, "delta": "+RM867" },
    { "label": "Pengangkutan", "icon": "transport", "percent": 17, "amount": 1156, "delta": "+RM548" },
    { "label": "Pindahan", "icon": "transfer", "percent": 8, "amount": 544, "delta": "+RM100" },
    { "label": "Bil & Utiliti", "icon": "bills", "percent": 6, "amount": 408, "delta": "Rata" },
    { "label": "Hiburan", "icon": "entertainment", "percent": 5, "amount": 340, "delta": "-RM22" },
    { "label": "Lain-lain", "icon": "others", "percent": 4, "amount": 272, "delta": "+RM87" }
  ]
}
\`\`\`

Menetapkan bajet makan boleh mengekalkan bulan depan lebih hampir dengan rentak biasa anda. Mahu saya menyelidiki bulan tertentu, atau melihat sepanjang tahun?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Tunjukkan perbelanjaan pada Mei" },
  { "kind": "prompt", "label": "Berapa banyak saya belanja tahun ini" }
] }
\`\`\``,

    spendInMay: `### Perbelanjaan pada Mei

Pada bulan Mei anda membelanjakan :hl[RM2,010]{tone=positive} dalam 24 transaksi — kira-kira **8% kurang** daripada April. Barangan runcit dan pengangkutan kekal rata; penurunan datang daripada kurang perjalanan beli-belah.

\`\`\`bank:spendTrend
{
  "spend": 2010,
  "transactions": 24,
  "currency": "RM",
  "currentLabel": "Mei",
  "previousLabel": "April",
  ${SPEND_TREND_DATA}
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Tunjukkan perbelanjaan pada Jun", "send": "${NAV.ms.spendJune}" },
  { "kind": "prompt", "label": "Berapa banyak saya belanja tahun ini" }
] }
\`\`\``,

    spendThisYear: `### Perbelanjaan setakat ini tahun ini

Anda telah membelanjakan :hl[RM12,480]{tone=info} sepanjang enam bulan pertama — purata **RM2,080 sebulan**. Jun ialah bulan terbesar anda setakat ini pada RM2,140; Februari paling rendah pada RM1,760.

\`\`\`bank:allocationDonut
{
  "title": "Perbelanjaan mengikut kategori (tahun ke tarikh)",
  "slices": [
    { "label": "Makan & bawa pulang", "value": 28 },
    { "label": "Barangan runcit", "value": 22 },
    { "label": "Beli-belah", "value": 18 },
    { "label": "Pengangkutan", "value": 16 },
    { "label": "Perjalanan", "value": 10 },
    { "label": "Langganan", "value": 6 }
  ]
}
\`\`\`

Makan dan barangan runcit bersama-sama membentuk separuh perbelanjaan anda. Bajet bulanan RM2,000 akan mengekalkan anda pada rentak tahun lepas.

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Tunjukkan perbelanjaan pada Mei" },
  { "kind": "prompt", "label": "Tunjukkan perbelanjaan pada Jun", "send": "${NAV.ms.spendJune}" }
] }
\`\`\``,

    idleCash: `### Wang terbiar

Anda memegang :hl[RM8,500]{tone=positive} dalam akaun semasa yang hanya memperoleh **0.1%**. Sebelum saya cadangkan ke mana ia patut pergi, mari kita sesuaikan dengan apa yang anda mahu wang ini lakukan.

\`\`\`bank:wizard
{
  "id": "idleCash",
  "title": "Jadikan wang terbiar anda bekerja",
  "subtitle": "Beberapa soalan pantas untuk menyesuaikan pilihan anda",
  "start": "aim",
  "questions": {
    "aim": {
      "title": "Apakah matlamat anda untuk wang ini?",
      "options": [
        { "value": "wealth", "label": "${WIZARD_AIM.ms.wealth}", "next": "horizon" },
        { "value": "retire", "label": "${WIZARD_AIM.ms.retire}", "next": "retireWhen" },
        { "value": "home", "label": "${WIZARD_AIM.ms.home}", "next": "homeWhen" },
        { "value": "buffer", "label": "${WIZARD_AIM.ms.buffer}" }
      ]
    },
    "horizon": {
      "title": "Dalam tempoh masa yang mana?",
      "options": [
        { "value": "short", "label": "Kurang daripada 3 tahun" },
        { "value": "mid", "label": "3 hingga 5 tahun", "next": "risk" },
        { "value": "long", "label": "5 tahun atau lebih", "next": "risk" }
      ]
    },
    "risk": {
      "title": "Bagaimana perasaan anda tentang turun naik?",
      "options": [
        { "value": "cautious", "label": "Kekalkan stabil" },
        { "value": "balanced", "label": "Gabungan seimbang" },
        { "value": "adventurous", "label": "Kejar pulangan lebih tinggi" }
      ]
    },
    "retireWhen": {
      "title": "Berapa lama lagi persaraan?",
      "options": [
        { "value": "soon", "label": "Kurang daripada 5 tahun" },
        { "value": "midway", "label": "5 hingga 15 tahun" },
        { "value": "far", "label": "Lebih daripada 15 tahun" }
      ]
    },
    "homeWhen": {
      "title": "Bila anda berharap untuk membeli?",
      "options": [
        { "value": "soon", "label": "Dalam masa 2 tahun" },
        { "value": "later", "label": "2 hingga 5 tahun lagi" }
      ]
    }
  }
}
\`\`\`

Ketik **Mula** dan saya akan susun pilihan yang tepat untuk anda.`,
  },

  zh: {
    rebalancing: `### 投资组合重新平衡

随着市场变动,您的资产配置已:hl[偏移]{tone=negative}。以下是您今天的状况 — 股票 **68%**、债券 **24%**、现金 **8%**:

\`\`\`bank:allocationDonut
{ "title": "当前配置", "slices": [
  { "label": "股票", "value": 68 },
  { "label": "债券", "value": 24 },
  { "label": "现金", "value": 8 }
] }
\`\`\`

与您的**目标**相比,股票超配而债券不足:

\`\`\`bank:driftBars
{ "title": "目标 vs 当前", "unit": "%", "items": [
  { "label": "股票", "target": 60, "current": 68 },
  { "label": "债券", "target": 30, "current": 24 },
  { "label": "现金", "target": 10, "current": 8 }
] }
\`\`\`

为了回到目标,我建议:

\`\`\`bank:actionCard
{ "title": "建议交易", "actions": [
  { "label": "减持股票", "detail": "卖出约 RM4,200 以锁定近期收益" },
  { "label": "增持债券", "detail": "恢复您的收益缓冲" },
  { "label": "设置每季度自动再平衡", "detail": "自动使您的配置保持在目标水平" }
], "cta": { "label": "准备这些交易以供审核" } }
\`\`\`

> ⚖️ 现在重新平衡可使您的风险与计划保持一致。

需要我准备这些交易供您审核吗?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "准备交易", "send": "准备这些交易以供审核" },
  { "kind": "prompt", "label": "显示我的完整投资组合", "send": "${NAV.zh.showPortfolio}" },
  { "kind": "prompt", "label": "为什么会偏移?" }
] }
\`\`\``,

    portfolio: `### 您的投资组合概览

您的投资今天价值 :hl[RM164,200]{tone=positive} — 过去一年增长了 :hl[RM12,400 (8.2%)]{tone=positive}。

\`\`\`bank:portfolioValue
{
  "value": 164200,
  "currency": "RM",
  "periodLabel": "过去 12 个月",
  "gain": 12400,
  "gainPct": 8.2,
  "series": [
    { "label": "7月", "value": 151800 },
    { "label": "9月", "value": 154300 },
    { "label": "11月", "value": 149600 },
    { "label": "1月", "value": 157100 },
    { "label": "3月", "value": 159900 },
    { "label": "5月", "value": 164200 }
  ]
}
\`\`\`

以下是该价值在您各项持仓中的分布:

\`\`\`bank:holdingsTable
{
  "title": "您的持仓",
  "currency": "RM",
  "total": 164200,
  "holdings": [
    { "name": "EPF", "category": "epf", "value": 82400, "returnPct": 5.4 },
    { "name": "ASB", "category": "asb", "value": 38600, "returnPct": 5.0 },
    { "name": "Public Mutual PRS Growth", "category": "prs", "value": 21800, "returnPct": 9.1 },
    { "name": "全球股票单位信托", "category": "unitTrust", "value": 14200, "returnPct": -2.3 },
    { "name": "马交所股票", "category": "stocks", "value": 5400, "returnPct": 12.6 },
    { "name": "现金", "category": "cash", "value": 1800, "returnPct": 0 }
  ]
}
\`\`\`

以及您按资产类别的划分:

\`\`\`bank:allocationRing
{
  "title": "资产配置",
  "currency": "RM",
  "total": 164200,
  "slices": [
    { "label": "股票", "value": 82100 },
    { "label": "固定收益", "value": 41050 },
    { "label": "单位信托", "value": 24630 },
    { "label": "现金", "value": 16420 }
  ]
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "重新平衡我的投资组合", "send": "${NAV.zh.rebalance}" },
  { "kind": "link", "label": "打开投资应用", "url": "https://example.com/portfolio" }
] }
\`\`\``,

    spendThisMonth: `### 本月支出

您在六月花费了 :hl[RM6,800]{tone=warning} — 比您平常的 6 个月平均值高出约 **45%**。别担心,您的**学校假期兰卡威之旅**是主要原因!

\`\`\`bank:spendDonut
{
  "month": "六月",
  "currency": "RM",
  "spend": 6800,
  "transactions": 96,
  "spendVsAvg": "+45% 对比平均",
  "txnVsAvg": "+25 对比平均",
  "categories": [
    { "label": "餐饮", "amount": 2448 },
    { "label": "购物", "amount": 1632 },
    { "label": "交通", "amount": 1156 },
    { "label": "转账", "amount": 544 },
    { "label": "其他", "amount": 1020 }
  ]
}
\`\`\`

**购物**涨幅最大 — 岛上的免税好物 — 而外出用餐和机票也推高了**餐饮**和**交通**。想看逐类别的完整明细吗?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "查看详细明细" },
  { "kind": "prompt", "label": "显示五月的支出" },
  { "kind": "prompt", "label": "我今年花了多少钱" }
] }
\`\`\``,

    spendBreakdown: `### 六月,逐类别明细

您在六月花费了 :hl[RM6,800]{tone=warning} — 比您平常的 6 个月平均值 :hl[高出 45%]{tone=warning}。但别担心,您的**学校假期兰卡威之旅**是这背后的 :hl[主要原因]{tone=positive}!

**购物**涨幅最明显,比您平常的节奏高出 :hl[+RM867]{tone=warning} — 岛上的免税购物 — 而岛上餐食和机票将**餐饮**和**交通**分别推高了 :hl[+RM530]{tone=warning} 和 :hl[+RM548]{tone=warning}。

\`\`\`bank:spendBreakdown
{
  "title": "六月支出",
  "currency": "RM",
  "total": 6800,
  "vsAvg": "+RM2,110",
  "vsAvgLabel": "对比 6 个月平均",
  "categories": [
    { "label": "餐饮", "icon": "dining", "percent": 36, "amount": 2448, "delta": "+RM530" },
    { "label": "购物", "icon": "shopping", "percent": 24, "amount": 1632, "delta": "+RM867" },
    { "label": "交通", "icon": "transport", "percent": 17, "amount": 1156, "delta": "+RM548" },
    { "label": "转账", "icon": "transfer", "percent": 8, "amount": 544, "delta": "+RM100" },
    { "label": "账单与水电", "icon": "bills", "percent": 6, "amount": 408, "delta": "持平" },
    { "label": "娱乐", "icon": "entertainment", "percent": 5, "amount": 340, "delta": "-RM22" },
    { "label": "其他", "icon": "others", "percent": 4, "amount": 272, "delta": "+RM87" }
  ]
}
\`\`\`

设定餐饮预算可让下个月更接近您平常的节奏。需要我深入查看某个特定月份,还是看整年?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "显示五月的支出" },
  { "kind": "prompt", "label": "我今年花了多少钱" }
] }
\`\`\``,

    spendInMay: `### 五月的支出

五月您在 24 笔交易中花费了 :hl[RM2,010]{tone=positive} — 比四月**减少约 8%**。杂货和交通保持持平;减少的部分来自更少的购物行程。

\`\`\`bank:spendTrend
{
  "spend": 2010,
  "transactions": 24,
  "currency": "RM",
  "currentLabel": "五月",
  "previousLabel": "四月",
  ${SPEND_TREND_DATA}
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "显示六月的支出", "send": "${NAV.zh.spendJune}" },
  { "kind": "prompt", "label": "我今年花了多少钱" }
] }
\`\`\``,

    spendThisYear: `### 今年迄今的支出

前六个月您已花费 :hl[RM12,480]{tone=info} — 平均**每月 RM2,080**。六月是您迄今支出最多的月份,达 RM2,140;二月最少,为 RM1,760。

\`\`\`bank:allocationDonut
{
  "title": "按类别支出(年初至今)",
  "slices": [
    { "label": "餐饮与外卖", "value": 28 },
    { "label": "杂货", "value": 22 },
    { "label": "购物", "value": 18 },
    { "label": "交通", "value": 16 },
    { "label": "旅行", "value": 10 },
    { "label": "订阅", "value": 6 }
  ]
}
\`\`\`

餐饮和杂货合计占您支出的一半。每月 RM2,000 的预算可让您保持去年的节奏。

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "显示五月的支出" },
  { "kind": "prompt", "label": "显示六月的支出", "send": "${NAV.zh.spendJune}" }
] }
\`\`\``,

    idleCash: `### 闲置现金

您在往来账户中持有 :hl[RM8,500]{tone=positive},仅赚取 **0.1%**。在我建议它该去向之前,让我们根据您真正希望这笔钱做什么来量身定制。

\`\`\`bank:wizard
{
  "id": "idleCash",
  "title": "让您的闲置现金动起来",
  "subtitle": "几个简单的问题,为您量身定制方案",
  "start": "aim",
  "questions": {
    "aim": {
      "title": "这笔钱的目标是什么?",
      "options": [
        { "value": "wealth", "label": "${WIZARD_AIM.zh.wealth}", "next": "horizon" },
        { "value": "retire", "label": "${WIZARD_AIM.zh.retire}", "next": "retireWhen" },
        { "value": "home", "label": "${WIZARD_AIM.zh.home}", "next": "homeWhen" },
        { "value": "buffer", "label": "${WIZARD_AIM.zh.buffer}" }
      ]
    },
    "horizon": {
      "title": "在多长的时间范围内?",
      "options": [
        { "value": "short", "label": "3 年以内" },
        { "value": "mid", "label": "3 至 5 年", "next": "risk" },
        { "value": "long", "label": "5 年或以上", "next": "risk" }
      ]
    },
    "risk": {
      "title": "您如何看待涨跌波动?",
      "options": [
        { "value": "cautious", "label": "保持稳健" },
        { "value": "balanced", "label": "均衡搭配" },
        { "value": "adventurous", "label": "追求更高回报" }
      ]
    },
    "retireWhen": {
      "title": "距离退休还有多久?",
      "options": [
        { "value": "soon", "label": "少于 5 年" },
        { "value": "midway", "label": "5 至 15 年" },
        { "value": "far", "label": "超过 15 年" }
      ]
    },
    "homeWhen": {
      "title": "您希望何时购置?",
      "options": [
        { "value": "soon", "label": "2 年内" },
        { "value": "later", "label": "2 至 5 年后" }
      ]
    }
  }
}
\`\`\`

点击**开始**,我会为您列出合适的方案。`,
  },
}

/**
 * Insight-specific replies, keyed by the exact message text the welcome screen
 * (or a suggestion pill) sends. Built per locale from the shared NAV phrases so
 * the keys always match the localized titles/pills. Looked up only on the
 * `insights` thread; anything unmatched falls back to `replies[locale].general`.
 */
function buildInsightReplies(l: Locale): Record<string, string> {
  const n = NAV[l]
  const c = CONTENT[l]
  return {
    [n.rebalance]: c.rebalancing,
    [n.showPortfolio]: c.portfolio,
    [n.spendMonth]: c.spendThisMonth,
    [n.spendJune]: c.spendThisMonth,
    [n.breakdown]: c.spendBreakdown,
    [n.spendMay]: c.spendInMay,
    [n.spendYear]: c.spendThisYear,
    [n.idleCash]: c.idleCash,
  }
}

const insightReplies: Record<Locale, Record<string, string>> = {
  en: buildInsightReplies('en'),
  ms: buildInsightReplies('ms'),
  zh: buildInsightReplies('zh'),
}

// Shown beneath every post-questionnaire reply. The `signal` pill re-opens the
// idle-cash wizard fresh — the cross-message trigger — alongside normal pills.
const wizardSuggestions: Record<Locale, string> = {
  en: `\`\`\`bank:suggestions
{ "items": [
  { "kind": "signal", "label": "Reassess my needs", "target": "idleCash", "name": "open", "payload": { "fresh": true } },
  { "kind": "prompt", "label": "Open easy-access savings", "send": "Open an easy-access savings account and move RM6,500" },
  { "kind": "link", "label": "Compare rates", "url": "https://example.com/savings" }
] }
\`\`\``,
  ms: `\`\`\`bank:suggestions
{ "items": [
  { "kind": "signal", "label": "Nilai semula keperluan saya", "target": "idleCash", "name": "open", "payload": { "fresh": true } },
  { "kind": "prompt", "label": "Buka simpanan akses mudah", "send": "Buka akaun simpanan akses mudah dan pindahkan RM6,500" },
  { "kind": "link", "label": "Bandingkan kadar", "url": "https://example.com/savings" }
] }
\`\`\``,
  zh: `\`\`\`bank:suggestions
{ "items": [
  { "kind": "signal", "label": "重新评估我的需求", "target": "idleCash", "name": "open", "payload": { "fresh": true } },
  { "kind": "prompt", "label": "开设活期储蓄", "send": "开设一个活期储蓄账户并转入 RM6,500" },
  { "kind": "link", "label": "比较利率", "url": "https://example.com/savings" }
] }
\`\`\``,
}

// Post-submission replies, keyed by the first answer (the "aim" option label),
// per locale. Built from WIZARD_AIM so the keys match the localized wizard.
interface WizardReplyContent {
  wealth: string
  retire: string
  home: string
  buffer: string
  default: string
}

function buildWizardReplies(l: Locale, r: WizardReplyContent): Record<string, string> {
  const a = WIZARD_AIM[l]
  return {
    [a.wealth]: r.wealth,
    [a.retire]: r.retire,
    [a.home]: r.home,
    [a.buffer]: r.buffer,
    default: r.default,
  }
}

const wizardReplies: Record<Locale, Record<string, string>> = {
  en: buildWizardReplies('en', {
    wealth: `### A plan for growth

Thanks — that helps. With growth as your aim, a **unit trust or ASNB fund (e.g. ASB)** fits well: historically these have outpaced cash over longer horizons, though values can fall as well as rise.

- Keep ~RM2,000 in easy-access as a buffer
- Invest the rest in a diversified, low-cost fund
- Automate a monthly top-up to smooth out the ups and downs

> 📈 Time *in* the market tends to matter more than timing it.`,
    retire: `### Building your retirement pot

A retirement aim usually means a longer runway, so tax-efficient options do the heavy lifting. Topping up your **EPF (voluntary, via i-Saraan)** or a **PRS (Private Retirement Scheme, tax relief up to RM3,000/yr)** could turn this idle cash into meaningful future income.

- Check how much of this year's PRS tax relief you've used
- Consider a low-cost global fund for the long term
- Revisit the mix as retirement gets closer`,
    home: `### Saving toward your home

For a deposit, certainty matters more than chasing returns. A top **fixed deposit** or an **ASB** account keeps the money safe while it grows steadily.

- Lock away what you won't need before completion
- Keep the rest instant-access for flexibility`,
    buffer: `### A stronger safety net

Smart instinct — a rainy-day buffer should stay **instant-access**. But it shouldn't sit at 0.1%: moving it to **easy-access savings** earns roughly :hl[RM280 more a year]{tone=positive} with no lock-in.

> 💰 Same money, same access — just a better rate.`,
    default: `### Here's what I'd suggest

Based on your answers, the simplest win is moving most of this idle cash into **easy-access savings** — roughly :hl[RM280 more a year]{tone=positive}, with instant access kept for emergencies.`,
  }),

  ms: buildWizardReplies('ms', {
    wealth: `### Pelan untuk pertumbuhan

Terima kasih — itu membantu. Dengan pertumbuhan sebagai matlamat anda, **unit amanah atau dana ASNB (cth. ASB)** amat sesuai: dari segi sejarah, ini mengatasi tunai dalam tempoh yang lebih panjang, walaupun nilainya boleh jatuh dan naik.

- Simpan ~RM2,000 dalam akses mudah sebagai penampan
- Laburkan selebihnya dalam dana kos rendah yang pelbagai
- Automasikan tambahan bulanan untuk melancarkan turun naik

> 📈 Masa *dalam* pasaran biasanya lebih penting daripada memilih masa.`,
    retire: `### Membina simpanan persaraan anda

Matlamat persaraan biasanya bermakna landasan yang lebih panjang, jadi pilihan cekap cukai memainkan peranan utama. Menambah **EPF anda (sukarela, melalui i-Saraan)** atau **PRS (Skim Persaraan Swasta, pelepasan cukai sehingga RM3,000/tahun)** boleh mengubah wang terbiar ini menjadi pendapatan masa depan yang bermakna.

- Semak berapa banyak pelepasan cukai PRS tahun ini yang telah anda gunakan
- Pertimbangkan dana global kos rendah untuk jangka panjang
- Semak semula gabungan apabila persaraan semakin hampir`,
    home: `### Menyimpan ke arah rumah anda

Untuk deposit, kepastian lebih penting daripada mengejar pulangan. **Simpanan tetap** terbaik atau akaun **ASB** memastikan wang selamat sambil berkembang dengan stabil.

- Kunci apa yang anda tidak perlukan sebelum penyelesaian
- Kekalkan selebihnya akses segera untuk fleksibiliti`,
    buffer: `### Jaring keselamatan yang lebih kukuh

Naluri yang bijak — dana kecemasan harus kekal **akses segera**. Tetapi ia tidak sepatutnya berada pada 0.1%: memindahkannya ke **simpanan akses mudah** memperoleh kira-kira :hl[RM280 lebih setahun]{tone=positive} tanpa kunci.

> 💰 Wang yang sama, akses yang sama — cuma kadar yang lebih baik.`,
    default: `### Inilah yang saya cadangkan

Berdasarkan jawapan anda, kemenangan paling mudah ialah memindahkan sebahagian besar wang terbiar ini ke **simpanan akses mudah** — kira-kira :hl[RM280 lebih setahun]{tone=positive}, dengan akses segera dikekalkan untuk kecemasan.`,
  }),

  zh: buildWizardReplies('zh', {
    wealth: `### 增长方案

谢谢 — 这很有帮助。以增长为目标,**单位信托或 ASNB 基金(如 ASB)**非常合适:从历史来看,在较长期限内它们的表现优于现金,尽管价值可能有涨有跌。

- 在活期账户中保留约 RM2,000 作为缓冲
- 将其余部分投资于多元化的低成本基金
- 设置每月自动追加,以平滑波动

> 📈 *身处*市场的时间通常比择时更重要。`,
    retire: `### 建立您的退休储备

退休目标通常意味着更长的时间跨度,因此税务高效的方案能发挥主要作用。追加您的 **EPF(自愿,通过 i-Saraan)**或 **PRS(私人退休计划,每年最高 RM3,000 税务减免)**,可将这笔闲置现金转化为可观的未来收入。

- 查看您今年已使用了多少 PRS 税务减免
- 考虑一只低成本的全球基金作长期投资
- 随着退休临近重新审视配置`,
    home: `### 为您的置业储蓄

对于首付,确定性比追求回报更重要。一份优质的**定期存款**或 **ASB** 账户能让资金安全,同时稳步增长。

- 锁定在成交前用不到的部分
- 其余保持即时存取以保留灵活性`,
    buffer: `### 更稳固的安全网

明智的直觉 — 应急储备应保持**即时存取**。但它不该停留在 0.1%:将其转入**活期储蓄**每年约多赚 :hl[RM280]{tone=positive},且没有锁定期。

> 💰 同样的钱、同样的存取 — 只是利率更好。`,
    default: `### 我的建议

根据您的回答,最简单的做法是将这笔闲置现金的大部分转入**活期储蓄** — 每年约多赚 :hl[RM280]{tone=positive},同时保留即时存取以备不时之需。`,
  }),
}

/** Pick the request's locale from `Accept-Language`, defaulting to English. */
function resolveLocale(request: Request): Locale {
  const raw = request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0]
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE
}

/** Detects a questionnaire submission (the `Q: …` / `A: …` message shape). */
function isWizardSubmission(message: string): boolean {
  return /^Q:\s.+\nA:\s/m.test(message)
}

/** The first answer in a submission — used to tailor the reply by aim. */
function firstAnswer(message: string): string {
  return message.match(/A:\s*(.+)/)?.[1]?.trim() ?? ''
}

export const handlers = [
  http.get('/api/topics', async ({ request }) => {
    // Artificial latency so the loading skeletons are visible.
    await delay(600)
    return HttpResponse.json(topics[resolveLocale(request)])
  }),

  http.get('/api/insights', async ({ request }) => {
    await delay(600)
    return HttpResponse.json(insights[resolveLocale(request)])
  }),

  http.get('/api/block-remotes', async () => {
    await delay(150)
    return HttpResponse.json(blockRemotes)
  }),

  http.post('/api/chat', async ({ request }) => {
    const locale = resolveLocale(request)
    const { threadId, messages } = (await request.json()) as {
      threadId: ThreadId
      messages: ChatTurn[]
    }
    // The client sends the full thread for context; the canned replies only
    // care about the latest user turn.
    const message = messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''
    // Backend returns the full reply; streaming is faked client-side.
    await delay(700)
    if (threadId === 'insights') {
      // A questionnaire submission: tailor the reply by the first answer and
      // append the follow-up pills (incl. "Reassess my needs").
      if (isWizardSubmission(message)) {
        const body = wizardReplies[locale][firstAnswer(message)] ?? wizardReplies[locale].default
        return HttpResponse.json({ reply: `${body}\n\n${wizardSuggestions[locale]}` })
      }
      // Otherwise match the message text to an insight reply.
      if (insightReplies[locale][message]) {
        return HttpResponse.json({ reply: insightReplies[locale][message] })
      }
    }
    return HttpResponse.json({ reply: replies[locale][threadId] ?? replies[locale].general })
  }),
]
