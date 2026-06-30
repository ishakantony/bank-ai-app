import { defineBlock } from '../defineBlock'
import { actionCardSchema } from './schema'

export default defineBlock(actionCardSchema, () => import('./ActionCard'))
