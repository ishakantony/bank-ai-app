import { defineBlock } from '../defineBlock'
import { suggestionsSchema } from '@bank-ai/shared'

export default defineBlock(suggestionsSchema, () => import('./Suggestions'))
