import { defineBlock } from '../defineBlock'
import { actionCardSchema } from '@bank-ai/shared'

export default defineBlock(actionCardSchema, () => import('./ActionCard'))
