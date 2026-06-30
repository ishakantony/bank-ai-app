import { defineBlock } from '../defineBlock'
import { spendBreakdownSchema } from './schema'

export default defineBlock(spendBreakdownSchema, () => import('./SpendBreakdown'))
