import { defineBlock } from '../defineBlock'
import { suggestionsSchema } from './schema'

export default defineBlock(suggestionsSchema, () => import('./Suggestions'))
