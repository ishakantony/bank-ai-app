import { defineBlock } from '../defineBlock'
import { suggestionsSchema } from '@bank-poc/shared'

export default defineBlock(suggestionsSchema, () => import('./Suggestions'))
