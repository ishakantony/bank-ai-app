import { defineBlock } from '../defineBlock'
import { allocationDonutSchema } from '@bank-ai/shared'

export default defineBlock(allocationDonutSchema, () => import('./AllocationDonut'))
