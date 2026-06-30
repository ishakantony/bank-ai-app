import { defineBlock } from '../defineBlock'
import { allocationDonutSchema } from './schema'

export default defineBlock(allocationDonutSchema, () => import('./AllocationDonut'))
