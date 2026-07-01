import { defineBlock } from '../defineBlock'
import { spendTrendSchema } from '@bank-ai/shared'

export default defineBlock(spendTrendSchema, () => import('./SpendTrend'))
