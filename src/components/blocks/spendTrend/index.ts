import { defineBlock } from '../defineBlock'
import { spendTrendSchema } from './schema'

export default defineBlock(spendTrendSchema, () => import('./SpendTrend'))
