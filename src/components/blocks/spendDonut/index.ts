import { defineBlock } from '../defineBlock'
import { spendDonutSchema } from './schema'

export default defineBlock(spendDonutSchema, () => import('./SpendDonut'))
