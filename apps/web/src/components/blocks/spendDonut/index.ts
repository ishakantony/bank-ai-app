import { defineBlock } from '../defineBlock'
import { spendDonutSchema } from '@bank-ai/shared'

export default defineBlock(spendDonutSchema, () => import('./SpendDonut'))
