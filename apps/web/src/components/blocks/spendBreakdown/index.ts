import { defineBlock } from '../defineBlock'
import { spendBreakdownSchema } from '@bank-ai/shared'

export default defineBlock(spendBreakdownSchema, () => import('./SpendBreakdown'))
